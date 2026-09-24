import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Education } from "./components/Education";
import { Skills } from "./components/Skills";
import { Interests } from "./components/Interests";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";
import { BootLoader } from "./components/BootLoader";
import { ChatBot } from "./components/ChatBot";

const BOOT_FLAG = "bijoy_portfolio_booted";

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("hero");
  // Only show the boot loader once per browser session — first visit, not
  // every internal navigation or component remount.
  const [booting, setBooting] = useState<boolean>(
    () => typeof window !== "undefined" && !sessionStorage.getItem(BOOT_FLAG)
  );

  const handleBootComplete = () => {
    sessionStorage.setItem(BOOT_FLAG, "1");
    setBooting(false);
  };

  // Lock scroll while the boot loader is showing so the page underneath
  // can mount/animate without being scrollable yet.
  useEffect(() => {
    document.body.style.overflow = booting ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [booting]);

  useEffect(() => {
    const sectionIds = ["hero", "about", "education", "skills", "interests", "projects", "contact"];
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3, // 30% section visibility trigger
        rootMargin: "-10% 0px -40% 0px",
      }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      sectionElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen relative selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* BootLoader owns its own fade-out internally and unmounts itself via
          onComplete once the exit transition finishes — see BootLoader.tsx.
          (Not wrapped in AnimatePresence: its exit-completion callback never
          fired reliably here, which left the overlay stuck in the DOM at
          opacity:0 while still blocking every click on the page.) */}
      {booting && <BootLoader onComplete={handleBootComplete} />}

      {/* Navigation */}
      <Navbar activeSection={activeSection} />

      {/* Main Single Page Sections in exact requested order */}
      <main>
        <Hero />
        <About />
        <Education />
        <Skills />
        <Interests />
        <Projects />
        <Contact />
      </main>

      {/* Global AI ChatBot */}
      <ChatBot />
    </div>
  );
};

export default App;
