import type { HandlerEvent } from '@netlify/functions';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ModelEntry {
  id: string;
  label: string;
  available: boolean;
}

// ─── Free-tier whitelist (sourced from env, NEVER hardcoded in source) ──────
// NaraRouter's /v1/models endpoint does NOT expose a `free: true` flag —
// it only returns list pricing — and some free-tier models (e.g.
// `agnes-2.5-flash`) actually have non-zero list prices that get waived by
// your account's free-plan quota. So we trust the catalog over the price
// fields.
//
// The whitelist is read from `OPENAI_FREE_TIER_IDS` at runtime so the user's
// chosen OPENAI_MODEL id doesn't have to be duplicated in source. Duplicating
// it would fail Netlify's secret-scanner (which compares env-var values
// against the repo + build output).
const FREE_TIER_IDS: Set<string> = (() => {
  const raw = process.env.OPENAI_FREE_TIER_IDS || '';
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    // Minimal sane defaults — non-empty so the dropdown works when
    // OPENAI_FREE_TIER_IDS isn't configured. The user's actual OPENAI_MODEL
    // id is NOT in this fallback to keep the scanner happy.
    return new Set([
      'laguna-s-2.1',
      'ling-3.0-flash-fin-free',
      'ling-3.0-flash-sante-free',
      'ling-3.0-flash-vl-free',
    ]);
  }
  return new Set(ids);
})();

// Curated fallback (a small subset of the free tier) — used when the upstream
// /v1/models call fails OR the API key isn't configured yet. Keeps the
// dropdown usable even when the network is down.
//
// IMPORTANT: this list MUST NOT contain the value of OPENAI_MODEL — see the
// FALLBACK_MODELS comment in netlify/functions/chat.ts for the same rule.
const FALLBACK_MODELS: ModelEntry[] = [
  { id: 'laguna-s-2.1', label: 'Laguna S 2.1', available: true },
  { id: 'ling-3.0-flash-fin-free', label: 'Ling 3.0 Flash (Free)', available: true },
  { id: 'ling-3.0-flash-sante-free', label: 'Ling 3.0 Flash Sante (Free)', available: true },
  { id: 'ling-3.0-flash-vl-free', label: 'Ling 3.0 Flash VL (Free)', available: true },
];

// ─── OpenAI-compatible normalization ───────────────────────────────────────
// Pulls id + display label from /v1/models response, then keeps only entries
// whose id is in the free-tier whitelist. NaraRouter doesn't expose a free
// flag in /v1/models, so we filter by id rather than pricing.
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
    // Drop obvious non-chat models even if the upstream forgot to filter
    // them — embeddings / image / audio endpoints aren't usable here.
    if (/embed|dall[- ]?e|tts|whisper|speech|moderation/i.test(id)) continue;
    if (/^agnes-video/i.test(id)) continue;
    // Free-tier whitelist — the only reliable signal we have for "this
    // model is in my free plan". Pricing fields are unreliable (see comment
    // above).
    if (!FREE_TIER_IDS.has(id)) continue;

    // Display label — prefer the upstream `name` field if present.
    let label: string;
    if (typeof it.label === 'string') label = it.label;
    else if (typeof it.display_name === 'string') label = it.display_name;
    else if (typeof it.name === 'string' && it.name !== id) label = it.name;
    else label = prettifyId(id);

    // "available" — default true unless the payload explicitly says otherwise.
    let available = true;
    if (typeof it.available === 'boolean') available = it.available;
    else if (typeof it.status === 'string') available = it.status.toLowerCase() !== 'offline';
    else if (typeof it.enabled === 'boolean') available = it.enabled;

    out.push({ id, label, available });
  }
  // Sort alphabetically so the dropdown order is stable across reloads (the
  // upstream list order isn't documented as stable).
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

function prettifyId(id: string): string {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ─── Upstream fetch ─────────────────────────────────────────────────────────
// Use the OpenAI-compatible /v1/models endpoint on the configured base URL
// to get the human-friendly labels (and any availability hints). We still
// filter to the free-tier whitelist because /v1/models doesn't expose a free
// flag.
async function fetchFromUpstream(baseURL: string, apiKey: string): Promise<ModelEntry[]> {
  const url = `${baseURL.replace(/\/+$/, '')}/models`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'portfolio-chatbot-models-proxy',
      },
      signal: ctrl.signal,
    });
    if (!res.ok) return [];
    const body = await res.json().catch(() => null);
    return normalize(body);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// ─── Handler ────────────────────────────────────────────────────────────────
// No caching: every visit/refresh hits upstream so the dropdown reflects the
// current state of the free tier. The browser layer is responsible for not
// over-fetching on every render.
// We don't annotate the export with `Handler` from @netlify/functions — v6's
// typings only allow the legacy `{ statusCode, body, headers }` shape, but
// the runtime also accepts `Response` objects directly. The runtime is the
// source of truth.
async function modelsHandler(event: HandlerEvent) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return new Response('', {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  }

  if (event.httpMethod !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL;

  let models: ModelEntry[] = [];
  let source: 'upstream' | 'fallback' = 'fallback';

  if (apiKey && baseURL) {
    const fetched = await fetchFromUpstream(baseURL, apiKey);
    if (fetched.length > 0) {
      models = fetched;
      source = 'upstream';
    }
  }

  if (models.length === 0) {
    // Either the key is missing, the upstream is down, or the key was
    // rejected. Never leave the client without at least one option.
    models = FALLBACK_MODELS;
  }

  // Cap at 4 — the dropdown is sized for ~4 entries; the rest still scroll.
  const payload = { models: models.slice(0, 4) };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'x-models-source': source,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export { modelsHandler as handler };