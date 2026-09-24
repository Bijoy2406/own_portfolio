import type { Handler } from '@netlify/functions';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ModelEntry {
  id: string;
  label: string;
  available: boolean;
}

// ─── Free-tier allowlist (sourced from env, NEVER hardcoded in source) ─────
// `OPENAI_FREE_TIER_IDS` is the *only* gate. Models outside the allowlist
// never enter the dropdown, even if they look free upstream. This keeps a
// curator (you) in the loop so paid models can't slip through on a quirky
// pricing field.
//
// When the allowlist is empty we fall back to a small safe set so the dev
// environment still has something to render without contacting upstream.
const FREE_TIER_IDS: Set<string> = (() => {
  const raw = process.env.OPENAI_FREE_TIER_IDS || '';
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    return new Set([
      'laguna-s-2.1',
      'ling-3.0-flash-fin-free',
      'ling-3.0-flash-sante-free',
      'ling-3.0-flash-vl-free',
    ]);
  }
  return new Set(ids);
})();

// Curated fallback list — used when the upstream is fully unreachable, the
// API key is missing, or every probe failed. Keeps the dropdown usable even
// when the network is dead.
//
// IMPORTANT: this list MUST NOT contain the value of OPENAI_MODEL — see the
// FALLBACK_MODELS comment in netlify/functions/chat.ts for the same rule.
const FALLBACK_MODELS: ModelEntry[] = [
  { id: 'laguna-s-2.1', label: 'Laguna S 2.1', available: true },
  { id: 'ling-3.0-flash-fin-free', label: 'Ling 3.0 Flash (Free)', available: true },
  { id: 'ling-3.0-flash-sante-free', label: 'Ling 3.0 Flash Sante (Free)', available: true },
  { id: 'ling-3.0-flash-vl-free', label: 'Ling 3.0 Flash VL (Free)', available: true },
];

// ─── Upstream /v1/models fetch ──────────────────────────────────────────────
// Returns the candidate set: model ids from upstream that pass our
// allowlist gate AND the "looks like a chat model" filter. We do NOT trust
// the upstream's `available` / `status` flags alone — those can lie — but
// they help us skip clearly-dead models before we spend a probe on them.
async function fetchCandidatesFromUpstream(
  baseURL: string,
  apiKey: string,
  signal: AbortSignal
): Promise<ModelEntry[]> {
  const url = `${baseURL.replace(/\/+$/, '')}/models`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'User-Agent': 'portfolio-chatbot-models-proxy',
    },
    signal,
  });
  if (!res.ok) return [];
  const body = await res.json().catch(() => null);
  return normalize(body);
}

function normalize(raw: unknown): ModelEntry[] {
  if (!raw || typeof raw !== 'object') return [];
  const r: any = raw;
  const arr: any[] | null = Array.isArray(r.data)
    ? r.data
    : Array.isArray(r.models)
      ? r.models
      : Array.isArray(raw)
        ? (raw as any[])
        : null;
  if (!arr) return [];

  const out: ModelEntry[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const it: any = item;
    const id = typeof it.id === 'string' ? it.id : typeof it.name === 'string' ? it.name : null;
    if (!id) continue;
    // Drop non-chat endpoints — embeddings / image / audio / moderation
    // aren't usable here even if upstream forgot to filter them.
    if (/embed|dall[- ]?e|tts|whisper|speech|moderation/i.test(id)) continue;
    if (/^agnes-video/i.test(id)) continue;
    // Allowlist gate — never admit a model that isn't in
    // OPENAI_FREE_TIER_IDS.
    if (!FREE_TIER_IDS.has(id)) continue;

    // Display label — prefer the upstream `name` field if present.
    let label: string;
    if (typeof it.label === 'string') label = it.label;
    else if (typeof it.display_name === 'string') label = it.display_name;
    else if (typeof it.name === 'string' && it.name !== id) label = it.name;
    else label = prettifyId(id);

    // `available` from upstream is a hint, not a guarantee. The probe below
    // is the real check. We still propagate the hint for UI display.
    let available = true;
    if (typeof it.available === 'boolean') available = it.available;
    else if (typeof it.status === 'string') available = it.status.toLowerCase() !== 'offline';
    else if (typeof it.enabled === 'boolean') available = it.enabled;

    out.push({ id, label, available });
  }
  // Upstream order preserved — `https://router.bynara.id/v1/models` lists
  // free-tier entries before paid ones, so the allowlist filter alone gives
  // a stable order.
  return out;
}

function prettifyId(id: string): string {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ─── Liveness probe ─────────────────────────────────────────────────────────
// Sends a 1-token ping to `/v1/chat/completions`. Treats 2xx as "alive",
// anything else (404 = model not found, 429 = rate-limited, 5xx = server
// error, network timeout) as "dead." Hard 3000ms deadline via Promise.race
// so a cold-starting model doesn't block the whole list.
//
// Cost per probe: ~10 input tokens + 1 output token. With ~10 candidates
// fanned out in parallel, each refresh of the cached list costs roughly a
// single small chat request. The 15-min edge cache absorbs repeat traffic.
const PROBE_TIMEOUT_MS = 3000;
const PROBE_BODY = JSON.stringify({
  model: '', // overwritten per probe
  messages: [{ role: 'user', content: 'ping' }],
  max_tokens: 1,
  stream: false,
});

async function probeModel(
  baseURL: string,
  apiKey: string,
  id: string,
  parentSignal: AbortSignal
): Promise<boolean> {
  const url = `${baseURL.replace(/\/+$/, '')}/chat/completions`;
  const ctrl = new AbortController();
  // Tie the probe's signal to the parent request — if the function's
  // upstream fetch aborts we should abort any in-flight probes too.
  const onParentAbort = () => ctrl.abort(parentSignal.reason);
  parentSignal.addEventListener('abort', onParentAbort, { once: true });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('probe-timeout')), PROBE_TIMEOUT_MS)
  );

  try {
    const work = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'portfolio-chatbot-models-probe',
      },
      body: PROBE_BODY.replace('"model":""', `"model":"${id.replace(/"/g, '')}"`),
      signal: ctrl.signal,
    }).then((res) => res.ok);

    const ok = await Promise.race([work, timeout]);
    return ok === true;
  } catch {
    return false;
  } finally {
    parentSignal.removeEventListener('abort', onParentAbort);
    ctrl.abort();
  }
}

// ─── Handler ────────────────────────────────────────────────────────────────
// Returns the legacy `{ statusCode, body, headers }` shape. Netlify
// Functions' runtime serializes this directly; returning a web `Response`
// object crashed with HTTP 502 in production (the deployed function bundle
// couldn't unwrap it).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Cache for 15 minutes at the Netlify edge. The dropdown only loads on the
// ChatBot mount, so this hits upstream once per quarter-hour per region
// regardless of visitor count. stale-while-revalidate keeps the UI fast
// even when the cached entry expires.
const CACHE_CONTROL = 'public, max-age=0, s-maxage=900, stale-while-revalidate=1800';

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL;

  // Path 1 — no API key or no base URL configured. Skip upstream entirely
  // and serve the curated static fallback. The dropdown still works while
  // you're setting things up.
  if (!apiKey || !baseURL) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        'x-models-source': 'fallback',
        'Cache-Control': CACHE_CONTROL,
      },
      body: JSON.stringify({ models: FALLBACK_MODELS }),
    };
  }

  // Path 2 — full discovery: upstream candidate list + per-model probe.
  // 8s overall ceiling so the function doesn't exceed Netlify's sync
  // function limit. Probes fan out in parallel via Promise.allSettled, so
  // the wall-clock cost is one probe latency, not N × latency.
  const overallCtrl = new AbortController();
  const overallTimer = setTimeout(() => overallCtrl.abort(new Error('overall-timeout')), 8000);

  try {
    const candidates = await fetchCandidatesFromUpstream(baseURL, apiKey, overallCtrl.signal);

    if (candidates.length === 0) {
      // Upstream is down or returned nothing matching the allowlist.
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          'x-models-source': 'fallback',
          'Cache-Control': CACHE_CONTROL,
        },
        body: JSON.stringify({ models: FALLBACK_MODELS }),
      };
    }
    // Fan out probes in parallel. `Promise.allSettled` so one slow / dead
    // probe doesn't poison the whole batch.
    const probeResults = await Promise.allSettled(
      candidates.map((c) => probeModel(baseURL, apiKey, c.id, overallCtrl.signal))
    );

    const alive: ModelEntry[] = [];
    for (let i = 0; i < candidates.length; i++) {
      const r = probeResults[i];
      if (r.status === 'fulfilled' && r.value === true) {
        alive.push(candidates[i]);
      }
    }

    let payload: ModelEntry[];
    let source: 'upstream-probed' | 'upstream-unprobed' | 'fallback';

    if (alive.length > 0) {
      payload = alive.slice(0, 4);
      source = 'upstream-probed';
    } else {
      // Every probe failed but upstream did return candidates. Surface the
      // upstream list unprobed, marked as `available: false` so the UI can
      // dim them if it wants to. Better an unverified list than nothing.
      payload = candidates.slice(0, 4).map((c) => ({ ...c, available: false }));
      source = 'upstream-unprobed';
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        'x-models-source': source,
        'Cache-Control': CACHE_CONTROL,
      },
      body: JSON.stringify({ models: payload }),
    };
  } catch (err) {
    console.error('models.ts upstream error:', (err as Error)?.message || err);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        'x-models-source': 'fallback',
        'Cache-Control': CACHE_CONTROL,
      },
      body: JSON.stringify({ models: FALLBACK_MODELS }),
    };
  } finally {
    clearTimeout(overallTimer);
  }
};

export { handler };
