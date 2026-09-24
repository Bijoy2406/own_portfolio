import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ModelEntry {
  id: string;
  label: string;
  available: boolean;
}

// ─── Free-tier whitelist (NaraRouter "Free plan") ────────────────────────────
// IDs of the models listed under "Included in the Free plan — usable at no
// cost" on https://router.bynara.id/models. NaraRouter's /v1/models endpoint
// does NOT expose a `free: true` flag — it only returns list pricing — and
// some free-tier models (e.g. `agnes-2.5-flash`) actually have non-zero list
// prices that get waived by your account's free-plan quota. So we trust the
// catalog over the price fields.
//
// Update this list whenever NaraRouter rotates their free plan.
const FREE_TIER_IDS = new Set<string>([
  'agnes-2.5-flash',
  'laguna-s-2.1',
  'ling-3.0-flash-fin-free',
  'ling-3.0-flash-sante-free',
  'ling-3.0-flash-vl-free',
  'nemotron-3-super-free',
  'nemotron-3-ultra-free',
  'nemotron-3.5-lightning-free',
  'nex-n2.5-pro',
  'space-bunny-alpha',
  'space-bunny-alpha-bynara',
]);

// Curated fallback (a small subset of the free tier) — used when the upstream
// /v1/models call fails OR the API key isn't configured yet. Keeps the
// dropdown usable even when the network is down.
const FALLBACK_MODELS: ModelEntry[] = [
  { id: 'space-bunny-alpha', label: 'Space Bunny Alpha', available: true },
  { id: 'space-bunny-alpha-bynara', label: 'Space Bunny Alpha (Bynara)', available: true },
  { id: 'laguna-s-2.1', label: 'Laguna S 2.1', available: true },
  { id: 'ling-3.0-flash-fin-free', label: 'Ling 3.0 Flash (Free)', available: true },
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
    // Free-tier whitelist — the only reliable signal we have for "this model
    // is in my free plan". Pricing fields are unreliable (see comment above).
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
// Use the OpenAI-compatible /v1/models endpoint on NaraRouter to get the
// human-friendly labels (and any availability hints). We still filter to the
// free-tier whitelist because /v1/models doesn't expose a free flag.
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
// current state of NaraRouter's free tier. The browser layer is responsible
// for not over-fetching on every render.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || 'https://router.bynara.id/v1';

  let models: ModelEntry[] = [];
  let source: 'upstream' | 'fallback' = 'fallback';

  if (apiKey) {
    const fetched = await fetchFromUpstream(baseURL, apiKey);
    if (fetched.length > 0) {
      models = fetched;
      source = 'upstream';
    }
  }

  if (models.length === 0) {
    // Either the key is missing, or NaraRouter is down / rejected the key.
    // Never leave the client without at least one option.
    models = FALLBACK_MODELS;
  }

  // Cap at 4 — the dropdown is sized for ~4 entries; the rest still scroll.
  const payload = { models: models.slice(0, 4) };
  res.setHeader('x-models-source', source);
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json(payload);
}
