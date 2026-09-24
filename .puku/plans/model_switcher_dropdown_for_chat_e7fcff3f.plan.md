---
name: Model-switcher dropdown for chat
overview: "Add a persistent model-picker dropdown in the chat header. Fetch available models from NaraRouter's /models endpoint on chat open (cached), persist the user's selection in localStorage, and pass the chosen model id to /api/chat so the server uses it. Auto-fall-back to the next model on 404/429 and surface a tiny error if all fail."
isProject: false
---

## Plan: Model-switcher dropdown for Cipher chat

Goal: let visitors pick from 3–4 NaraRouter free models in the chat header. Their choice sticks across sessions. If a model 404s or rate-limits, the request silently retries with the next model in the list.

### 1. New server endpoint — `api/models.ts`
- Proxies `GET https://router.bynara.id/models` so the client never sees the upstream URL and so we can filter/normalize.
- Reads the same `OPENAI_API_KEY` env var already set (server-side use only).
- Returns a normalized list:
  ```ts
  { models: Array<{ id: string; label: string; available: boolean }> }
  ```
  Capped to 4 entries. If the upstream is unreachable, returns a static fallback list of 3 well-known free models on NaraRouter so the dropdown always works.
- In-memory cache with 5-min TTL.

### 2. Extend `api/chat.ts` to accept a model
- Add `model?: string` to the request body (validated: string, ≤ 64 chars, `[A-Za-z0-9._:/-]+`).
- Use `req.body.model` if present and valid; otherwise fall back to `process.env.OPENAI_MODEL`.
- **Auto-fallback**: if the upstream call returns `404`/`429`, retry up to 2 more times with the next model in the order returned by `GET /api/models`. If all fail, return 502.
- Add `x-model-used` response header so the client can display which model actually answered.

### 3. New client-side hook — `src/lib/useChatModels.ts`
- On first use, fetches `GET /api/models`.
- Caches in a module-level promise (avoids refetching on every chat open).
- Returns `{ models, loading, error, refresh }`.

### 4. Update `src/components/ChatBot.tsx`
- New state: `selectedModelId` (init from `localStorage.cipher_model_id`; persists across sessions).
- New header dropdown placed **above the messages**, in the existing header row (L357–388), between the title block and the action buttons:
  - Compact button: shows current model label + chevron.
  - Dropdown panel: 3–4 entries with availability dot (green = available, red = unavailable). Clicking selects and writes to localStorage.
- Send the chosen id on each POST: `{ messages, model: selectedModelId }`.
- Read `x-model-used` from the response and show a tiny "via: model-name" subtitle in the last assistant message if it differs from the picked one (only when fallback kicked in).

### 5. Visual polish
- Use the existing emerald/zinc palette already in the header.
- Status dot color matches `available` flag from `/api/models`.
- Keyboard accessible: `aria-expanded`, `aria-haspopup`, Escape closes, Enter selects.
- When `loading`, the button shows a 1.5-pulse skeleton instead of the model name.

### File changes
- **New**: `api/models.ts`, `src/lib/useChatModels.ts`.
- **Modify**: `api/chat.ts` (model param + fallback loop), `src/components/ChatBot.tsx` (dropdown + send logic).
- **No new deps** — uses React hooks + existing `framer-motion` + `lucide-react`.

### Verification
1. `npm run build` — TS clean, no new warnings.
2. `GET /api/models` returns up to 4 entries with stable ids.
3. `POST /api/chat` with `{ model: "<id>" }` echoes the id in `x-model-used`.
4. `POST /api/chat` with a bogus model falls back to the next model and returns a successful reply.
5. In the browser: dropdown opens, selecting a model persists across reload (localStorage round-trip), the selected model name appears in the header.
