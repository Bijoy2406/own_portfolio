import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Github, Linkedin, Copy, Check, ArrowUpRight } from "lucide-react";
import { PERSONAL_INFO } from "../data/portfolioData";

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const copyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-28 px-6 border-t border-zinc-900 relative">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold mb-2">
            06. Connect
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-4">
            Get In Touch
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed mb-10">
            I'm currently seeking full-time opportunities in Distributed Systems, Infrastructure, and Systems Software Engineering starting mid-2026.
          </p>

          {/* Direct Email Display Box */}
          <div className="mb-8 inline-flex items-center gap-3 p-2 pl-4 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm">
            <span className="font-mono text-sm text-zinc-200">{PERSONAL_INFO.contact.email}</span>
            <button
              onClick={copyEmail}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Copy Email Address"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Ghost Buttons Group (per DESIGN.md ghost button spec) */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Email Ghost Button */}
            <a
              href={`mailto:${PERSONAL_INFO.contact.email}`}
              /* DESIGN.md ghost button spec: px-4 py-2.5 rounded-lg border border-zinc-800 bg-transparent text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/50 */
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg border border-zinc-800 bg-transparent text-zinc-300 text-sm font-medium transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/50 shadow-sm"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Send Email</span>
            </a>

            {/* GitHub Ghost Button */}
            <a
              href={PERSONAL_INFO.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg border border-zinc-800 bg-transparent text-zinc-300 text-sm font-medium transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/50 shadow-sm"
            >
              <Github className="w-4 h-4 text-zinc-400" />
              <span>GitHub Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>

            {/* LinkedIn Ghost Button */}
            <a
              href={PERSONAL_INFO.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg border border-zinc-800 bg-transparent text-zinc-300 text-sm font-medium transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/50 shadow-sm"
            >
              <Linkedin className="w-4 h-4 text-zinc-400" />
              <span>LinkedIn Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </motion.div>

        {/* Minimal Footer */}
        <div className="mt-24 pt-8 border-t border-zinc-900 w-full text-center">
          <p className="text-xs font-mono text-zinc-400">
            Designed & Built by {PERSONAL_INFO.name} · React + Tailwind CSS + Framer Motion
          </p>
        </div>
      </div>
    </section>
  );
};
