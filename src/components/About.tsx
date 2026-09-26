import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { User, Shield } from "lucide-react";
import { PERSONAL_INFO } from "../data/portfolioData";

export const About: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const lineVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="about" className="py-24 px-6 border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            01. Background
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mt-2">
            About Tajuddin Ahmed Bijoy
          </h2>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Bio Text Left (7 Cols) */}
          <motion.div
            className="lg:col-span-7 flex flex-col gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {PERSONAL_INFO.aboutBio.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={lineVariants}
                className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal"
              >
                {paragraph}
              </motion.p>
            ))}

            {/* Quick Metrics / Focus Cards */}
            <motion.div
              variants={lineVariants}
              className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/80 mt-2"
            >
              <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
                <div className="text-xs font-mono text-emerald-400 mb-1">SPECIALIZATION</div>
                <div className="text-sm font-semibold text-zinc-200">Full-Stack Development</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
                <div className="text-xs font-mono text-emerald-400 mb-1">CORE ECOSYSTEM</div>
                <div className="text-sm font-semibold text-zinc-200">React & Next.js</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Profile Photo Right (5 Cols) */}
          <motion.div
            className="lg:col-span-5 relative flex flex-col items-center"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-full max-w-sm bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md shadow-2xl group">
              {/* Subtle Ambient Emerald Glow Behind */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />

              {/* Graphic Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-700/80" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700/80" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700/80" />
                </div>
                <div className="font-mono text-xs text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>identity_core.tsx</span>
                </div>
              </div>

              {/* Static Profile Photo */}
              <div className="relative rounded-xl overflow-hidden border border-zinc-800/80 shadow-lg bg-zinc-950 aspect-square group-hover:border-emerald-500/30 transition-colors duration-300">
                <img
                  src="/projects/profile_pic.jpeg"
                  alt="Tajuddin Ahmed Bijoy — Full-Stack Web Developer"
                  width="512"
                  height="512"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card Footer info */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  CSE Undergrad
                </span>
                <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/30 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  AUST
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
