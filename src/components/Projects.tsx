import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ExternalLink, ChevronDown, Cpu, Activity, CheckCircle2, Github, GraduationCap, Sparkles } from "lucide-react";
import { PROJECTS_DATA, UNIVERSITY_PROJECTS, ProjectItem, UniversityProject } from "../data/portfolioData";
import gsap from "gsap";

type ProjectsMode = "featured" | "university";

const UniversityProjectCard: React.FC<{ project: UniversityProject }> = ({ project }) => {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm transition-colors duration-200 hover:border-zinc-700 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-emerald-400 shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-zinc-100 leading-tight truncate">
              {project.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80">
                {project.course}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-emerald-400 hover:border-zinc-700 transition-colors text-[10px] font-mono"
              title="View live site"
              aria-label={`View ${project.title} live site`}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-emerald-400 hover:border-zinc-700 transition-colors"
              title="View on GitHub"
              aria-label={`View ${project.title} on GitHub`}
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed mb-4">
        {project.shortDescription}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-zinc-800/60 text-zinc-400 border border-zinc-700/40"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
};

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
  const [mode, setMode] = useState<ProjectsMode>("featured");
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
            Projects
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl">
            Real-world products I&apos;ve built, plus the university projects that shaped my foundation.
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          role="tablist"
          aria-label="Project categories"
          className="inline-flex items-center p-1 mb-10 rounded-lg border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm"
        >
          {([
            { key: "featured", label: "Featured", icon: Sparkles, count: PROJECTS_DATA.length },
            { key: "university", label: "Academic", icon: GraduationCap, count: UNIVERSITY_PROJECTS.length },
          ] as { key: ProjectsMode; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[]).map(({ key, label, icon: Icon, count }) => {
            const active = mode === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setMode(key)}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  active
                    ? "text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="projects-tab-pill"
                    className="absolute inset-0 rounded-md bg-zinc-800/80 border border-zinc-700 shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <span
                  className={`ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    active
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Projects Content — animated swap between Featured and University */}
        <AnimatePresence mode="wait" initial={false}>
          {mode === "featured" ? (
            <motion.div
              key="featured"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="university"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {UNIVERSITY_PROJECTS.map((project) => (
                  <UniversityProjectCard key={project.id} project={project} />
                ))}
              </div>
              <p className="text-[11px] font-mono text-zinc-600 mt-6">
                Coursework &amp; lab projects from AUST — kept compact so the featured work above stays the focus.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Animated Project Preview Modal */}
      {!shouldReduceMotion && (
        <ProjectHoverModal modal={modal} projects={PROJECTS_DATA} />
      )}
    </section>
  );
};
