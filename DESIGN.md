# DESIGN.md - Design Specifications & Guidelines

This document outlines the strict design specifications, component guidelines, and animation rules for the Personal Portfolio Website.

---

## 🎨 Color Palette & Theme

- **Background Base**: `#09090b` (`bg-zinc-950`)
- **Card Background**: `#18181b` with 60% opacity (`bg-zinc-900/60 backdrop-blur-sm`)
- **Border Default**: `#27272a` (`border-zinc-800`)
- **Border Hover**: `#3f3f46` (`hover:border-zinc-700`)
- **Text Primary**: `#f4f4f5` (`text-zinc-100`)
- **Text Secondary**: `#a1a1aa` (`text-zinc-400`)
- **Text Muted**: `#71717a` (`text-zinc-500`)
- **Single Accent Color**: `#10b981` (`emerald-500` / `emerald-400` / `emerald-950/30`)
  - *Rule*: Accent color is reserved **strictly** for primary call-to-action buttons, active navigation indicator, timeline node highlights, and key focus states. No extra chromatic colors (no random pinks, purples, blues).

---

## 🧱 Component Specs

### 1. Card Spec (`DESIGN.md card spec`)
- **Base Style**: `bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 transition-all duration-200`
- **Hover State**: Border brightens to `border-zinc-700` with a subtle lift `translateY(-2px)` (`hover:border-zinc-700 hover:-translate-y-0.5`).
- **Forbidden**: NO box-shadow glow, NO neon radial gradients, NO 3D tilt effects.

### 2. Pill Spec (`DESIGN.md pill spec`)
- **Base Style**: `inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50`
- **Hover State**: `hover:scale-[1.03] hover:border-zinc-600 transition-all duration-150`
- **Use Case**: Tech stack tags on project cards, interest tags in horizontal scroll section.

### 3. Primary Button Spec (`DESIGN.md primary button spec`)
- **Base Style**: `px-5 py-2.5 rounded-lg bg-emerald-500 text-zinc-950 font-semibold text-sm transition-all duration-200 hover:bg-emerald-400 active:scale-[0.98] shadow-sm`
- **Use Case**: Navigation CTA (Resume / Contact button).

### 4. Ghost Button Spec (`DESIGN.md ghost button spec`)
- **Base Style**: `inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 bg-transparent text-zinc-300 text-sm font-medium transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/50`
- **Use Case**: Contact links (Email, GitHub, LinkedIn).

---

## ⚡ Motion & Animation Guidelines

- **Engine**: Framer Motion
- **Scroll Triggers**: `whileInView`, `viewport={{ once: true, margin: "-100px" }}`
- **Stagger**: ~80ms (`delay: index * 0.08` or Framer Motion stagger children variant)
- **Entrance Animation**: Subtle fade-in + slide-up (`opacity: 0, y: 16` -> `opacity: 1, y: 0`), duration `0.4s` to `0.5s` with `easeOut`.
- **Accessibility**: Wrap Framer Motion animations with reduced-motion checks (`useReducedMotion()` hook) to simplify or eliminate motion for users who prefer reduced motion.
