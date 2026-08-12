import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Code, Cpu, Wrench, Terminal, Layers } from "lucide-react";
import { SKILL_CATEGORIES } from "../data/portfolioData";

export const Skills: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const getCategoryIcon = (category: string) => {
    if (category.includes("Systems")) return <Cpu className="w-5 h-5 text-emerald-400" />;
    if (category.includes("Frameworks")) return <Layers className="w-5 h-5 text-emerald-400" />;
    return <Wrench className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <section id="skills" className="py-24 px-6 border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            03. Technical Stack
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mt-2">
            Skills & Capabilities
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SKILL_CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.45,
                delay: shouldReduceMotion ? 0 : index * 0.08,
                ease: "easeOut",
              }}
              /* DESIGN.md Card Spec: hover border brightens + slight lift (translateY -2px), strictly NO glow, NO 3D tilt */
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 transition-all duration-200 hover:border-zinc-700 hover:-translate-y-0.5 flex flex-col justify-between backdrop-blur-sm"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
                    {getCategoryIcon(cat.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100">{cat.category}</h3>
                    <p className="text-xs text-zinc-400 font-mono">{cat.description}</p>
                  </div>
                </div>

                <div className="h-px bg-zinc-800/80 my-4" />

                {/* Skills Item List */}
                <div className="flex flex-col gap-3">
                  {cat.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="group flex flex-col gap-0.5 p-2 rounded-lg hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                          {skill.name}
                        </span>
                      </div>
                      {skill.detail && (
                        <span className="text-xs font-mono text-zinc-400 pl-5">
                          {skill.detail}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Subtle Tag */}
              <div className="mt-6 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>{cat.skills.length} core proficiencies</span>
                <Code className="w-3.5 h-3.5 text-zinc-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
