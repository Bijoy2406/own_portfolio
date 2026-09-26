# Web Design Review — Portfolio Site

**Target URL:** http://localhost:5173/
**Framework:** React 18 + Vite 6 + TypeScript
**Styling:** Tailwind CSS + Framer Motion + GSAP
**Tool:** Playwright MCP (`@playwright/mcp`)
**Viewports tested:** 375px (mobile), 768px (tablet), 1024px (breakpoint edge), 1280px (desktop), 1920px (wide)

## Summary

| Item | Value |
|---|---|
| Issues Detected | 2 |
| Issues Fixed | 2 |
| Console errors | 0 |
| Horizontal overflow | None at any viewport |

---

## Issues Found & Fixed

### [P1] Boot loader overlay permanently blocks all clicks after every fresh visit

**Element:** `BootLoader`'s root `<div aria-hidden="true" class="fixed inset-0 z-[100] …">`

**Issue:** On first load (or any time `sessionStorage` doesn't have the boot flag — private browsing, cleared storage, or a real visitor's actual first visit), the boot animation overlay would fade to `opacity: 0` but never unmount from the DOM. It kept `pointer-events: auto` forever, silently intercepting every click across the whole page.

An initial fix attempt wrapped the exit in `AnimatePresence` with an `exit={{opacity:0}}` prop. This looked correct and passed a quick check, but a more rigorous re-verification (waiting the full animation duration on a truly fresh session, across dev server *and* two separate production builds) showed it **did not actually work**: `booting` state correctly flipped to `false` and React re-rendered, but `AnimatePresence`'s `onExitComplete` callback never fired, and the node stayed stuck in the DOM at `opacity: 0`, still blocking clicks. Reproducible identically in `vite dev` and `vite build` + `vite preview` (not a React StrictMode artifact).

**Fix:** Removed the `AnimatePresence` dependency for this case entirely.
- `src/App.tsx` — conditional render (`{booting && <BootLoader/>}`) now drives real mount/unmount directly, no `AnimatePresence` wrapper.
- `src/components/BootLoader.tsx` — the component owns its own fade-out via local `exiting` state on its `motion.div`, and sets `pointer-events: none` the instant the exit begins. This means even if DOM removal is ever delayed, the overlay can no longer block interaction.

**Verification:** Tested across 6+ fresh-session reloads (dev + prod) via Playwright MCP:
- Overlay div fully removed from DOM ~3.7s after load
- `document.elementFromPoint()` at viewport center resolves to real page content, not the boot loader
- Clicking a project card visually expands it with full details
- No console errors introduced; production build compiles cleanly

### [P2] Tablet breakpoint (768px) — navbar wraps to 3 lines

**Element:** `Navbar`'s desktop nav/logo (previously `md:flex`, 768px breakpoint)

**Issue:** The desktop nav (logo + 6 links + Resume CTA) activated at Tailwind's `md:` (768px) — exactly the tablet test width — with no room for the content. The logo text "Tajuddin Ahmed Bijoy" wrapped across 3 lines and the nav pill squeezed awkwardly to the right.

**Fix:** `src/components/Navbar.tsx` — moved all four `md:`/`md:hidden` toggles (desktop nav, desktop CTA, mobile menu button, mobile drawer) to `lg:` (1024px), giving the full nav enough room before switching away from the hamburger pattern.

**Verification:** Screenshotted at:
- 768px — now shows clean single-line logo + hamburger, matching the mobile pattern
- 1024px (exact edge) — full nav fits on one line, no overflow
- 1280px / 1920px — unaffected, full nav as before

No horizontal overflow at any tested width (`docWidth ≤ winWidth` confirmed at all 5 viewports).

---

## Not Bugs (Ruled Out)

- **Blank gaps in full-page screenshots** — an early full-page capture showed large empty gaps under every section (About, Education, Skills, Interests, Projects). This is scroll-triggered reveal animation (Framer Motion / GSAP) that only fires on real incremental scroll — confirmed correct by step-by-step viewport screenshots. Not a bug.
- **Duplicated Interests pills** — the Interests section's pill list appears twice in the accessibility tree. This is an intentional infinite-marquee loop pattern, verified visually, not a bug.

## Other Observations

- Mobile hamburger menu (open/close, all 6 links, Resume button) works correctly at 375px.
- All images have descriptive `alt` text.
- Keyboard tab order and visible focus outlines work correctly on interactive nav elements.
- Two persistent framer-motion/Spline dev console warnings are benign (a module version mismatch note, and a scroll-offset positioning notice from an unrelated `Education` component using `useScroll`).

## Unfixed / Follow-up

### Boot loader accessibility announcement (P3, not fixed)
- **Issue:** The ~2.2–2.75s boot sequence is the only visible content on first paint but is marked `aria-hidden="true"` with no `role="status"`/`aria-live` region, so screen reader users get silence with no indication the page is loading.
- **Recommended action:** Add `role="status"` and `aria-live="polite"` with a visually-hidden "Loading portfolio…" text node inside the boot loader, or drop `aria-hidden` and give it a real accessible label.

## Recommendations

- Consider code-splitting the Spline/physics bundles (`physics-*.js` ~1.99MB, `react-spline-*.js` ~2.06MB pre-gzip) via dynamic `import()` — Vite's build flags these as oversized chunks, affecting initial load performance especially on first visit when the boot loader is also masking asset loading.
- If reintroducing `AnimatePresence` around `BootLoader` in the future, verify `onExitComplete` actually fires before trusting it for anything interaction-blocking — this environment showed it silently failing with no console error.
- Address the P3 accessibility gap above when convenient.

---

## Files Changed

- [src/App.tsx](src/App.tsx) — boot loader mount/unmount no longer routed through `AnimatePresence`
- [src/components/BootLoader.tsx](src/components/BootLoader.tsx) — owns its own fade-out + `pointer-events` guard
- [src/components/Navbar.tsx](src/components/Navbar.tsx) — breakpoint moved from `md:` (768px) to `lg:` (1024px)
