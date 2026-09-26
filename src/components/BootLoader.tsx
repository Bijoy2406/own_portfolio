import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { preloadHeroSpline, onSplineLoaded, isSplineLoaded } from "../lib/splinePreload";

interface BootLoaderProps {
  onComplete: () => void;
}

export function BootLoader({ onComplete }: BootLoaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [robotLoaded, setRobotLoaded] = useState(isSplineLoaded());
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    preloadHeroSpline();
    const unsubscribe = onSplineLoaded(() => {
      setRobotLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      preloadHeroSpline().finally(() => {
        setExiting(true);
        setTimeout(onComplete, 0);
      });
      return;
    }

    let rafId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      setProgress((prev) => {
        if (prev >= 100) {
          if (!doneRef.current) {
            doneRef.current = true;
            // Short hold at 100% so all 10 glowing green blocks fill completely
            setTimeout(() => {
              setExiting(true);
              setTimeout(onComplete, 450);
            }, 250);
          }
          return 100;
        }

        // Cap at 95% while waiting for robot 3D model, 100% when robot is ready
        const maxCap = robotLoaded ? 100 : 95;

        // Smooth speed: fast count-up once robot is loaded (~3-5% per frame)
        // steady speed while waiting (~1% per 25ms)
        const increment = robotLoaded
          ? Math.max(2, Math.floor(delta * 0.12))
          : Math.max(1, Math.floor(delta * 0.035));

        return Math.min(prev + increment, maxCap);
      });

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [onComplete, shouldReduceMotion, robotLoaded]);

  if (shouldReduceMotion) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#060807] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  // Telemetry status text based on progress & robot state
  const getStatusText = (p: number) => {
    if (p < 35) return "INITIALIZING SYSTEM ARCHITECTURE";
    if (p < 85 && !robotLoaded) return "DOWNLOADING 3D ROBOT MODEL";
    if (!robotLoaded) return "COMPILING 3D ROBOT SHADERS";
    return "SYSTEM ONLINE // MOUNTING UI";
  };

  const TOTAL_BLOCKS = 10;
  const activeBlocks = Math.min(
    TOTAL_BLOCKS,
    Math.floor((progress / 100) * TOTAL_BLOCKS)
  );

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-[#060807] overflow-hidden select-none flex flex-col items-center justify-center px-6"
      style={{ pointerEvents: exiting ? "none" : "auto" }}
      aria-hidden="true"
    >
      {/* Atmospheric Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,rgba(6,8,7,1)_70%)] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e2923_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none" />

      {/* HUD Corner Readouts */}
      <div className="absolute top-6 left-6 font-mono text-[11px] tracking-widest text-emerald-500/50 uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <span>SYS_INIT // v2.4.0</span>
      </div>

      <div className="absolute top-6 right-6 font-mono text-[11px] tracking-widest text-zinc-500 uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        <span className="text-zinc-400">ONLINE</span>
      </div>

      <div className="absolute bottom-6 left-6 font-mono text-[11px] tracking-widest text-zinc-600 uppercase">
        Tajuddin Ahmed Bijoy
      </div>

      <div className="absolute bottom-6 right-6 font-mono text-[11px] tracking-widest text-zinc-600 uppercase flex items-center gap-1.5">
        <span>MEM: OK</span>
        <span className="text-zinc-700">|</span>
        <span className="text-emerald-500/70">{progress}%</span>
      </div>

      {/* Central Core Loader UI */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-md w-full gap-8">
        
        {/* Futuristic Emblem with Rotating Orbit Rings */}
        <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44">
          
          {/* Outer Rotating Dotted Orbit Ring */}
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full text-emerald-500/20 pointer-events-none"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="96"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              fill="none"
            />
          </motion.svg>

          {/* Counter-Rotating Tech Diamond Ring */}
          <motion.svg
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full text-zinc-700/40 pointer-events-none"
          >
            <polygon
              points="100,12 188,100 100,188 12,100"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 12"
              fill="none"
            />
          </motion.svg>

          {/* Central Monogram Badge: Stylized Cyber < B /> Emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-[#111814] to-[#0a0f0d] border border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.15)] overflow-hidden group"
          >
            {/* Ambient Inner Gradient Beam */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.25),transparent_70%)]" />

            <svg
              viewBox="0 0 100 100"
              className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400 relative z-10 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Code Bracket < */}
              <path
                d="M 28 35 L 16 50 L 28 65"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              />

              {/* Right Code Bracket > */}
              <path
                d="M 72 35 L 84 50 L 72 65"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              />

              {/* Stylized Central 'B' Emblem */}
              <path
                d="M 40 32 L 54 32 C 60 32 64 35 64 40 C 64 44 60 47 54 47 L 40 47 M 40 47 L 56 47 C 63 47 67 51 67 56 C 67 62 63 66 56 66 L 40 66 M 40 30 L 40 68"
                stroke="url(#emblem-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Gradient Defs */}
              <defs>
                <linearGradient id="emblem-grad" x1="40" y1="30" x2="67" y2="68" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#34d399" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>

        {/* Status Telemetry & Segmented Progress Bar */}
        <div className="w-full flex flex-col items-center gap-3">
          
          {/* Status Label with Pulsing Dot */}
          <div className="font-mono text-xs text-emerald-400/90 tracking-[0.2em] uppercase font-medium flex items-center gap-2 h-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <motion.span
              key={getStatusText(progress)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {getStatusText(progress)}
            </motion.span>
          </div>

          {/* Segmented Meter Row */}
          <div className="w-full bg-[#0d120f] border border-emerald-900/40 p-2 rounded-xl flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            
            {/* Block Segments */}
            <div className="flex-1 grid grid-cols-10 gap-1.5">
              {Array.from({ length: TOTAL_BLOCKS }).map((_, idx) => {
                const isActive = idx < activeBlocks;
                const isLeading = idx === activeBlocks - 1;
                return (
                  <div
                    key={idx}
                    className={`h-2.5 rounded-[3px] transition-all duration-200 ${
                      isActive
                        ? isLeading
                          ? "bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.8)] scale-y-110"
                          : "bg-emerald-500/85 shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                        : "bg-zinc-900/90 border border-zinc-800/80"
                    }`}
                  />
                );
              })}
            </div>

            {/* Percentage Display */}
            <div className="font-mono text-xs font-bold tracking-widest text-emerald-400 min-w-[42px] text-right">
              {String(progress).padStart(3, "0")}%
            </div>
          </div>

          {/* Bottom Telemetry Detail */}
          <div className="w-full flex items-center justify-between font-mono text-[10px] text-zinc-600 tracking-wider">
            <span>CORE_RENDER: ACTIVE</span>
            <span>SECURE_BOOT</span>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

