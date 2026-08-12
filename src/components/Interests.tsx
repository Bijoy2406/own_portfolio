import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { INTERESTS_DATA } from "../data/portfolioData";

const SPEED = 30; // seconds per loop

export const Interests: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Center-based opacity effect (from 21st.dev CTA with Text Marquee)
  useEffect(() => {
    if (shouldReduceMotion) return;

    const container = marqueeRef.current;
    if (!container) return;

    let frameId: number;

    const update = () => {
      const items = container.querySelectorAll<HTMLElement>(".marquee-item-horizontal");
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      items.forEach((item) => {
        const r = item.getBoundingClientRect();
        const itemCenter = r.left + r.width / 2;
        const distance = Math.abs(centerX - itemCenter);
        const maxDistance = rect.width / 2;
        const normalized = Math.min(distance / maxDistance, 1);
        item.style.opacity = (1 - normalized * 0.8).toString();
      });

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [shouldReduceMotion]);

  const trackClass = `flex shrink-0 marquee-track${paused ? " marquee-track-paused" : ""}`;

  return (
    <section id="interests" className="py-24 border-t border-zinc-900 relative">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>04. Focus Areas</span>
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mt-2">
          Interests
        </h2>
      </div>

      {/* Marquee */}
      <div className="max-w-6xl mx-auto px-6 overflow-hidden">
        <div
          ref={marqueeRef}
          className="relative flex overflow-hidden"
          style={{ "--marquee-duration": `${SPEED}s` } as React.CSSProperties}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Track 1 */}
          <div className={trackClass}>
            {INTERESTS_DATA.map((tag, i) => (
              <div
                key={`a-${i}`}
                className="marquee-item-horizontal whitespace-nowrap px-5 py-2.5 mx-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm font-medium text-zinc-300 select-none cursor-default"
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Track 2 — identical copy for seamless loop */}
          <div className={trackClass} aria-hidden="true">
            {INTERESTS_DATA.map((tag, i) => (
              <div
                key={`b-${i}`}
                className="marquee-item-horizontal whitespace-nowrap px-5 py-2.5 mx-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm font-medium text-zinc-300 select-none cursor-default"
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Left vignette */}
          <div className="pointer-events-none absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[#09090b] via-[#09090b]/50 to-transparent z-10" />
          {/* Right vignette */}
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#09090b] via-[#09090b]/50 to-transparent z-10" />
        </div>
      </div>
    </section>
  );
};
