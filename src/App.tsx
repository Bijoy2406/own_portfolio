import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Education } from "./components/Education";
import { Skills } from "./components/Skills";
import { Interests } from "./components/Interests";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("hero");

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
    </div>
  );
};

export default App;
