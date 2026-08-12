import React, { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { GraduationCap, Award, Calendar } from "lucide-react";
import { EDUCATION_DATA } from "../data/portfolioData";

export const Education: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll tracking for hairline drawing animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section id="education" className="py-24 px-6 border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            02. Timeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mt-2">
            Education & Experience
          </h2>
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="relative max-w-3xl mx-auto pl-6 sm:pl-8">
          {/* Base Background Hairline */}
          <div className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-[1.5px] bg-zinc-800" />

          {/* Animated Hairline Line Drawing In on Scroll */}
          <motion.div
            className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-[1.5px] bg-emerald-500 origin-top"
            style={{ scaleY: shouldReduceMotion ? 1 : scaleY }}
          />

          {/* Timeline Items */}
          <div className="flex flex-col gap-12">
            {EDUCATION_DATA.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                  ease: "easeOut",
                }}
                className="relative pl-6 sm:pl-8 group"
              >
                {/* Node Bullet Dot */}
                <div className="absolute left-[-19px] sm:left-[-23px] top-1.5 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 border-emerald-500 transition-all duration-300 group-hover:scale-125 group-hover:bg-emerald-500" />
                </div>

                {/* Content Card (per DESIGN.md card spec) */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 transition-all duration-200 hover:border-zinc-700 hover:-translate-y-0.5 backdrop-blur-sm shadow-sm">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>{entry.degree}</span>
                      </h3>
                      <p className="text-sm font-mono text-zinc-400 mt-1">
                        {entry.institution}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>{entry.period}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                    {entry.description}
                  </p>

                  {/* Highlights List */}
                  <ul className="flex flex-col gap-2">
                    {entry.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        className="text-xs sm:text-sm text-zinc-400 flex items-start gap-2.5"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-400/80 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
