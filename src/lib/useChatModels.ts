import { useEffect, useState, useCallback, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ChatModel {
  id: string;
  label: string;
  available: boolean;
}

export interface UseChatModelsResult {
  models: ChatModel[];
  loading: boolean;
  error: string | null;
  /** Force a re-fetch (e.g. after a model 404s so the dropdown refreshes). */
  refresh: () => Promise<void>;
}

// ─── Per-page in-flight de-dupe ─────────────────────────────────────────────
// NaraRouter's free-tier availability shifts, so the chat should always pull
// a fresh list on every page load. We keep a short-lived in-flight promise so
// that if two components mount during the same render cycle (rare, but
// possible during React StrictMode double-mount), they share the same fetch.
// There is no TTL — every visit/refresh goes to the server, which hits
// NaraRouter's /v1/models server-side.
let inflight: Promise<ChatModel[]> | null = null;

async function fetchModels(): Promise<ChatModel[]> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch('/api/models', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data?.models) ? (data.models as ChatModel[]) : [];
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/**
 * React hook for the chat model's available list.
 *
 * Returns `{ models, loading, error, refresh }`. Every mount triggers a fresh
 * fetch (no module-level cache), so reloading the page always shows the
 * current NaraRouter free-tier list.
 */
export function useChatModels(): UseChatModelsResult {
  const [models, setModels] = useState<ChatModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const m = await fetchModels();
      if (!mountedRef.current) return;
      setModels(m);
    } catch (e: any) {
      if (!mountedRef.current) return;
      setError(e?.message ?? 'Failed to load models');
      // Hard failure shouldn't leave the dropdown empty — show the same
      // curated fallback the server uses so the visitor can still pick.
      setModels([
        { id: 'space-bunny-alpha', label: 'Space Bunny Alpha', available: true },
        { id: 'space-bunny-alpha-bynara', label: 'Space Bunny Alpha (Bynara)', available: true },
        { id: 'laguna-s-2.1', label: 'Laguna S 2.1', available: true },
        { id: 'ling-3.0-flash-fin-free', label: 'Ling 3.0 Flash (Free)', available: true },
      ]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    inflight = null;
    await load();
  }, [load]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { models, loading, error, refresh };
}
