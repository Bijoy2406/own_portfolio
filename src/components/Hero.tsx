import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ArrowRight, Terminal } from "lucide-react";
import { PERSONAL_INFO } from "../data/portfolioData";
import { SplineScene } from "./ui/splite";
import { TextRotate } from "./ui/text-rotate";
import { markSplineLoaded } from "../lib/splinePreload";

export const Hero: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Words split for precise text reveal animation.
  // The H1 must lead with the developer's full name so search engines and
  // assistive tech surface "Tajuddin Ahmed Bijoy" as the primary identity
  // signal for personal-name SEO.
  const staticPart = "Tajuddin Ahmed Bijoy,";
  const staticWords = staticPart.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] },
    },
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.3 },
    },
  };

  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const checkIsDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop || shouldReduceMotion) {
        markSplineLoaded();
      }
    };
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, [shouldReduceMotion]);

  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-24 pb-16 overflow-hidden"
    >
      {/* Background Subtle Mesh Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Full-screen Spline Scene Container (Tracks mouse everywhere, desktop only) */}
      {isDesktop && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 w-[150vw] lg:w-[200vw] h-full -left-[20vw] lg:-left-[30vw] pointer-events-auto">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </motion.div>
      )}

      {/* Main Content Layout Container */}
      <div className="max-w-6xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pointer-events-none">
        {/* Left Side: Headline, Subtitle, CTA (7 Cols) */}
        <motion.div
          className="lg:col-span-7 flex flex-col items-start text-left pointer-events-none"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Status Badge */}
          <motion.div variants={wordVariants} className="mb-6 pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>const [status] = useState("building_the_future")</span>
            </div>
          </motion.div>

          {/* Text Reveal Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-100 leading-[1.25] max-w-2xl mb-6 pointer-events-auto flex flex-wrap gap-x-2.5 row-gap-2">
            {staticWords.map((word, index) => (
              <motion.span
                key={index}
                variants={wordVariants}
                className="inline-block pointer-events-none"
              >
                {word}
              </motion.span>
            ))}
            <motion.span variants={wordVariants} className="inline-block min-w-[200px]">
              <TextRotate
                texts={[
                  "full-stack web developer.",
                  "building real products.",
                  "shipping with React & Next.js.",
                  "solving real problems.",
                  "growing every day."
                ]}
                mainClassName="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 inline-block overflow-hidden pb-1"
                staggerFrom={"first"}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
                staggerDuration={0.02}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                rotationInterval={3200}
              />
            </motion.span>
          </h1>

          {/* Tagline Staggered Fade-in */}
          <motion.p
            variants={fadeVariants}
            className="text-base sm:text-lg text-zinc-400 max-w-xl font-normal leading-relaxed mb-8 pointer-events-none"
          >
            {PERSONAL_INFO.tagline}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={fadeVariants}
            className="flex flex-wrap items-center gap-4 pointer-events-auto"
          >
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-emerald-500/10 flex items-center gap-2 group active:scale-[0.98]"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-sm font-medium transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900"
            >
              Get in Touch
            </a>
          </motion.div>
        </motion.div>

        {/* Right Side spacing to align text layout correctly on desktop */}
        <div className="hidden lg:block lg:col-span-5 pointer-events-none" />
      </div>

      {/* Scroll Down Indicator with Subtle Bounce */}
      <motion.button
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors group cursor-pointer z-20 pointer-events-auto"
        aria-label="Scroll to About section"
      >
        <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
          Scroll
        </span>
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="p-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </section>
  );
};
