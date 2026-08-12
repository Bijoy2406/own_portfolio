import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ExternalLink, ChevronDown, Cpu, Activity, CheckCircle2 } from "lucide-react";
import { PROJECTS_DATA, ProjectItem } from "../data/portfolioData";
import gsap from "gsap";

const scaleAnimation = {
  initial: { scale: 0, x: "-50%", y: "-50%" },
  enter: {
    scale: 1,
    x: "-50%",
    y: "-50%",
    transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] },
  },
  closed: {
    scale: 0,
    x: "-50%",
    y: "-50%",
    transition: { duration: 0.35, ease: [0.32, 0, 0.67, 0] },
  },
};

interface ModalProps {
  modal: { active: boolean; index: number };
  projects: ProjectItem[];
}

const getProjectPreviewImage = (project: ProjectItem) => {
  return project.image || `https://picsum.photos/seed/${project.id}/600/400`;
};

const ProjectHoverModal: React.FC<ModalProps> = ({ modal, projects }) => {
  const { active, index } = modal;
  const modalContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // QuickTo positioning for high-performance cursor following (Viewport relative)
    const xMoveContainer = gsap.quickTo(modalContainer.current, "left", {
      duration: 0.6,
      ease: "power3.out",
    });
    const yMoveContainer = gsap.quickTo(modalContainer.current, "top", {
      duration: 0.6,
      ease: "power3.out",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      xMoveContainer(clientX);
      yMoveContainer(clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <motion.div
      variants={scaleAnimation}
      initial="initial"
      animate={active ? "enter" : "closed"}
      ref={modalContainer}
      className="fixed pointer-events-none z-50 w-72 h-48 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 shadow-2xl flex items-center justify-center"
      style={{
        left: 0,
        top: 0,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="absolute h-full w-full transition-[top] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ top: `${index * -100}%` }}
      >
        {projects.map((project) => (
          <div
            className="flex h-full w-full items-center justify-center bg-zinc-950"
            key={project.id}
          >
            <img
              alt={project.title}
              className="w-full h-full object-cover opacity-90"
              src={getProjectPreviewImage(project)}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const Projects: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modal, setModal] = useState({ active: false, index: 0 });
  const shouldReduceMotion = useReducedMotion();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="projects" className="py-24 px-6 border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            05. Engineering Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mt-2">
            Featured Projects
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl">
            Click on any project card to view technical architecture, metrics, and implementation details.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {PROJECTS_DATA.map((project: ProjectItem, index: number) => {
            const isExpanded = expandedId === project.id;

            return (
              <motion.div
                key={project.id}
                layout={!shouldReduceMotion}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.4,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                  layout: { duration: 0.3, ease: "easeInOut" },
                }}
                onMouseEnter={() => !shouldReduceMotion && !isExpanded && setModal({ active: true, index })}
                onMouseLeave={() => !shouldReduceMotion && setModal({ active: false, index })}
                /* DESIGN.md Card Spec: bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 transition-all hover:border-zinc-700 hover:-translate-y-0.5 */
                className={`bg-zinc-900/60 border rounded-xl p-6 backdrop-blur-sm transition-colors duration-200 cursor-pointer ${
                  isExpanded
                    ? "border-emerald-500/50 bg-zinc-900/90 shadow-xl"
                    : "border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5"
                }`}
                onClick={() => toggleExpand(project.id)}
              >
                {/* Card Top Row: Title + Links */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-emerald-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h3>
                      {project.role && (
                        <span className="text-xs font-mono text-emerald-400 font-medium block mt-0.5">
                          {project.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* External Links */}
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-emerald-400 hover:border-zinc-700 transition-colors"
                        title="View Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Short One-line Description */}
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  {project.shortDescription}
                </p>

                {/* Metrics Highlight Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
                  <Activity className="w-3 h-3 shrink-0" />
                  <span>{project.metrics}</span>
                </div>

                {/* Tech Tag Pills (DESIGN.md pill spec) */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 hover:scale-[1.03] transition-transform"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Expand Indicator */}
                <div
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setModal({ active: false, index });
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    if (!isExpanded && !shouldReduceMotion) {
                      setModal({ active: true, index });
                    }
                  }}
                  className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-3 border-t border-zinc-800/80"
                >
                  <span className="flex items-center gap-1">
                    {isExpanded ? "Click to collapse" : "Click for deep dive"}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-emerald-400" />
                  </motion.div>
                </div>

                {/* Expandable Content Area */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden pt-4 mt-4 border-t border-zinc-800"
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        setModal({ active: false, index });
                      }}
                    >
                      <h4 className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-2 font-semibold">
                        System Architecture & Details
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                        {project.fullDescription}
                      </p>

                      <h5 className="text-xs font-mono text-zinc-400 mb-2">Key Highlights:</h5>
                      <ul className="flex flex-col gap-2">
                        {project.architectureDetails.map((detail, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-zinc-400 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Animated Project Preview Modal */}
      {!shouldReduceMotion && (
        <ProjectHoverModal modal={modal} projects={PROJECTS_DATA} />
      )}
    </section>
  );
};
