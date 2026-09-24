import type OpenAI from 'openai';

// ─── Shared chat-stream logic used by netlify/functions/chat.ts (production)
// and the dev middleware in vite.config.ts. Keeps the two paths in lock-step
// so model selection + fallback behavior is identical locally and in
// production.

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRunOptions {
  openai: OpenAI;
  systemPrompt: string;
  history: ChatMessage[];
  requestedModel: string;
  /** Ordered list of model ids to try if `requestedModel` fails. */
  fallbackModels: string[];
  temperature?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  /** Called once we know which model will actually be used. */
  onModelResolved?: (model: string) => void;
  /** Called when the picked model 404s/429s and we move to a fallback. */
  onFallback?: (from: string, to: string, reason: number) => void;
}

const RETRYABLE_STATUSES = new Set([404, 429, 502, 503]);

// OpenAI streaming type — minimal shape we depend on
type ChatChunk = {
  choices: Array<{ delta?: { content?: string | null } }>;
};

export interface ChatRunResult {
  modelUsed: string;
  /** Yields each text delta from the OpenAI stream. */
  stream: AsyncIterable<string>;
  fellBack: boolean;
}

/**
 * Validate a model id. Keeps the surface narrow so we can't pass arbitrary
 * client strings into the OpenAI SDK.
 */
export function isValidModelId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && id.length <= 64 && /^[A-Za-z0-9._:/-]+$/.test(id);
}

export async function runChatStream(opts: ChatRunOptions): Promise<ChatRunResult> {
  // Build the candidate list: requested model first, then fallbacks (skip
  // duplicates).
  const candidates: string[] = [];
  const seen = new Set<string>();
  for (const m of [opts.requestedModel, ...opts.fallbackModels]) {
    if (!isValidModelId(m)) continue;
    if (seen.has(m)) continue;
    seen.add(m);
    candidates.push(m);
  }

  let lastError: any = null;
  let fellBack = false;
  let attemptedModel = '';

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    attemptedModel = candidate;
    opts.onModelResolved?.(candidate);

    try {
      const upstream = await opts.openai.chat.completions.create({
        model: candidate,
        messages: [
          { role: 'system', content: opts.systemPrompt },
          ...opts.history,
        ] as any,
        temperature: opts.temperature ?? 0.6,
        max_tokens: opts.maxTokens ?? 400,
        presence_penalty: opts.presencePenalty ?? 0.1,
        frequency_penalty: opts.frequencyPenalty ?? 0.2,
        stream: true,
      });

      // Adapter that re-yields text deltas and swallows non-content chunks.
      const stream = (async function* () {
        for await (const chunk of upstream as unknown as AsyncIterable<ChatChunk>) {
          const delta = chunk.choices?.[0]?.delta?.content || '';
          if (delta) yield delta;
        }
      })();

      return { modelUsed: candidate, stream, fellBack };
    } catch (err: any) {
      lastError = err;
      const status: number | undefined = err?.status;
      if (status && RETRYABLE_STATUSES.has(status) && i < candidates.length - 1) {
        const next = candidates[i + 1];
        fellBack = true;
        opts.onFallback?.(candidate, next, status);
        continue;
      }
      throw err;
    }
  }

  // Shouldn't reach here, but just in case:
  throw lastError ?? new Error('No models available');
}
