export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description?: string;
  highlights: string[];
}

export interface SkillCategory {
  category: string;
  description: string;
  skills: { name: string; icon?: string; detail?: string }[];
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  image?: string;
  shortDescription: string;
  fullDescription: string;
  architectureDetails: string[];
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  metrics: string;
}

export interface UniversityProject {
  id: string;
  title: string;
  course: string;
  semester: string;
  shortDescription: string;
  techStack: string[];
  githubUrl?: string;
}

export const PERSONAL_INFO = {
  name: "Tajuddin Ahmed Bijoy",
  title: "Full-Stack Web Developer",
  headline: "Learning, building, and growing as a full-stack developer.",
  tagline: "I'm a computer science student at AUST. I'm actively learning modern web development, striving to build professional-grade apps with React/Next.js, and shipping real projects along the way.",
  aboutBio: [
    "I'm a CSE undergraduate at Ahsanullah University of Science and Technology — currently deep in the learning curve and genuinely loving every part of it.",
    "I build full-stack web applications using React, Next.js, and TypeScript, and I've shipped real projects — from NGO donation platforms to complete e-commerce systems with payment integrations. Each one taught me something new, and that's exactly what drives me.",
    "I'm passionate about clean UI, smooth animations, and building things that actually work end-to-end. Still growing, still learning — but always building."
  ],
  contact: {
    email: "bijoy.ahmed12555@gmail.com",
    github: "https://github.com/Bijoy2406",
    linkedin: "https://www.linkedin.com/in/bijoy2406/",
    phone: "01924753893",
    location: "Mirpur, Dhaka",
    facebook: "https://www.facebook.com/bijoy2406/",
    resumeUrl: "/resume.pdf",
  }
};

export const EDUCATION_DATA: EducationItem[] = [
  {
    id: "edu-1",
    degree: "B.Sc. in Computer Science & Engineering (CSE)",
    institution: "Ahsanullah University of Science and Technology (AUST)",
    period: "2023 — 2027 (Expected)",
    description: "Focusing on Software Engineering, Database Systems, Web Application Development, and Algorithms.",
    highlights: [
      "Actively developing full-stack web projects using standard React & Next.js architectures",
      "Hands-on coursework: Object-Oriented Programming, Database Management Systems, Software Engineering, Algorithms Design"
    ]
  },
  {
    id: "edu-2",
    degree: "Higher Secondary Certificate (HSC) — Science",
    institution: "Dhaka Residential Model College",
    period: "2021",
    highlights: [
      "GPA 5.00 / 5.00",
      "Dhaka Board · Science Group"
    ]
  },
  {
    id: "edu-3",
    degree: "Secondary School Certificate (SSC) — Science",
    institution: "Dhaka Residential Model College",
    period: "2019",
    highlights: [
      "GPA 5.00 / 5.00",
      "Dhaka Board · Science Group"
    ]
  }
];

export const UNIVERSITY_PROJECTS: UniversityProject[] = [
  {
    id: "uni-1",
    title: "Student Result Management System",
    course: "Database Systems Lab",
    semester: "L3 · S1",
    shortDescription: "MySQL-backed CRUD system for managing student records, courses, and grading with normalized schema.",
    techStack: ["MySQL", "PHP", "HTML", "CSS"],
    githubUrl: "https://github.com/Bijoy2406"
  },
  {
    id: "uni-2",
    title: "Hospital Queue Simulator",
    course: "Data Structures",
    semester: "L2 · S2",
    shortDescription: "Priority-queue driven simulator comparing FCFS vs priority-based patient scheduling with stats output.",
    techStack: ["C++", "STL", "Queue"],
    githubUrl: "https://github.com/Bijoy2406"
  },
  {
    id: "uni-3",
    title: "OOP Banking System",
    course: "Object-Oriented Programming",
    semester: "L2 · S1",
    shortDescription: "Console banking app demonstrating inheritance, polymorphism, and abstract account types.",
    techStack: ["Java", "OOP"],
    githubUrl: "https://github.com/Bijoy2406"
  },
  {
    id: "uni-4",
    title: "Assembler Simulator",
    course: "Computer Architecture",
    semester: "L3 · S1",
    shortDescription: "Two-pass assembler translating symbolic assembly into machine code with symbol table generation.",
    techStack: ["C", "Systems"],
    githubUrl: "https://github.com/Bijoy2406"
  },
  {
    id: "uni-5",
    title: "Sorting Algorithm Visualizer",
    course: "Algorithms Lab",
    semester: "L2 · S2",
    shortDescription: "Browser visualizer comparing bubble, merge, quick, and heap sort with adjustable input sizes.",
    techStack: ["JavaScript", "Canvas", "HTML"],
    githubUrl: "https://github.com/Bijoy2406"
  },
  {
    id: "uni-6",
    title: "LAN Chat Application",
    course: "Computer Networks",
    semester: "L3 · S2",
    shortDescription: "Socket-based chat over LAN supporting private rooms, broadcast, and message history.",
    techStack: ["Java", "Sockets", "Swing"],
    githubUrl: "https://github.com/Bijoy2406"
  },
  {
    id: "uni-7",
    title: "AI Tic-Tac-Toe Agent",
    course: "Artificial Intelligence",
    semester: "L3 · S2",
    shortDescription: "Unbeatable tic-tac-toe using minimax with alpha-beta pruning and heuristic evaluation.",
    techStack: ["Python", "AI"],
    githubUrl: "https://github.com/Bijoy2406"
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Languages & Core",
    description: "Programming languages & runtime environments",
    skills: [
      { name: "JavaScript", detail: "ES6+, Async/Await, DOM manipulation" },
      { name: "TypeScript", detail: "Strict Typing, Interface Contracts" },
      { name: "HTML & CSS", detail: "Semantic Markup, Responsive Layouts" },
      { name: "Python", detail: "Scripting, Automation" },
      { name: "C / C++", detail: "Problem Solving, Data Structures" }
    ]
  },
  {
    category: "Frameworks & UI Tools",
    description: "Libraries and web frameworks for building interfaces",
    skills: [
      { name: "React", detail: "Hooks, Context API, SPA Routing" },
      { name: "Next.js", detail: "App Router, Server Actions, SSR" },
      { name: "Tailwind CSS", detail: "Responsive Design, Custom Configurations" },
      { name: "GSAP", detail: "Timelines, Micro-interactions, ScrollTrigger" },
      { name: "Framer Motion", detail: "Layout Animations, Keyframes" }
    ]
  },
  {
    category: "Backend & Infrastructure",
    description: "Databases, auth, CMS, and cloud APIs",
    skills: [
      { name: "Node.js & Express", detail: "REST APIs, Middleware, JWT Auth" },
      { name: "Supabase", detail: "Row Level Security, PostgreSQL, Database Functions" },
      { name: "Sanity CMS", detail: "Studio Configuration, Headless Content Delivery" },
      { name: "Cloudinary", detail: "Media Transformation, Secure Delivery" },
      { name: "Payment APIs", detail: "SSLCommerz Integration, bKash Merchant APIs" }
    ]
  }
];

export const INTERESTS_DATA = [
  "Full-Stack Web Architecture",
  "UI/UX Animations & Interactions",
  "Artificial Intelligence & LLMs",
  "Machine Learning Fundamentals",
  "Generative AI & Prompt Engineering",
  "Headless CMS & Content Systems",
  "Secure Payment Gateway Flows",
  "Database Design & Optimization",
  "Edge Computing & Serverless",
  "Open Source Web Tooling"
];

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "project-1",
    title: "SSRN",
    role: "Frontend Developer",
    image: "/projects/ssrn.png",
    shortDescription: "Static frontend for a ride-booking platform built from Figma designs, featuring full authentication and multi-step booking flows.",
    fullDescription: "Built static frontend for a ride-booking platform from Figma designs – full auth flow (login, signup, OTP, password reset), landing pages, and multi-step booking flow. Custom reusable UI components (date/time/duration pickers) with a token-based design system. Deployed on Netlify. Live link couldn't be shared as backend integration was left incomplete by the client's backend team.",
    architectureDetails: [
      "Designed full authentication flow (login, signup, OTP verification, password reset)",
      "Implemented a responsive landing page and a multi-step ride booking flow",
      "Created custom reusable UI components (date/time/duration pickers) integrated with a token-based design system",
      "Deployed and optimized front-end builds on Netlify"
    ],
    techStack: ["HTML", "CSS", "JavaScript", "Netlify", "Figma"],
    githubUrl: "https://github.com/Bijoy2406/Ssrn",
    liveUrl: "https://ssrn-app.netlify.app/", // Placeholder link
    metrics: "Figma to Frontend · Token-based UI"
  },
  {
    id: "project-2",
    title: "Farzana Afroz Foundation",
    role: "Full Stack Developer",
    image: "/projects/ngo.png",
    shortDescription: "A custom NGO donation website built with Next.js and Sanity CMS featuring dynamic galleries and event tracking.",
    fullDescription: "Built a full donation website for an NGO with Next.js and Sanity CMS. Includes event management with galleries, team showcase, donation modal (bank transfer + QR code), FAQ accordion, and EmailJS contact forms. Cloudinary-powered image delivery with anti-download protection, smooth animations via Framer Motion, and a custom sage/ocean-green design system.",
    architectureDetails: [
      "Integrated Sanity Studio for headless content management (events, galleries, team members)",
      "Designed donation modal supporting bank transfer details and direct QR codes",
      "Optimized asset delivery with Cloudinary and implemented custom anti-download protection on images",
      "Built custom sage/ocean-green design system with smooth Framer Motion animations"
    ],
    techStack: ["Next.js", "TypeScript", "Sanity CMS", "Tailwind CSS", "Cloudinary", "EmailJS", "Framer Motion"],
    githubUrl: "https://github.com/Bijoy2406/ngo_donation",
    liveUrl: "https://www.farhanaafrozfoundation.org/", // Placeholder link
    metrics: "Sanity CMS · Sage-Green Theme"
  },
  {
    id: "project-3",
    title: "Denz",
    role: "Full Stack Developer",
    image: "/projects/denz.png",
    shortDescription: "A robust e-commerce platform built with Next.js and Supabase, with an advanced admin panel and Row Level Security.",
    fullDescription: "Full-stack e-commerce platform with Next.js and Supabase. Customer side: product browsing, filtering, cart, checkout, order history, Google OAuth login. Admin dashboard: product/order management, ad carousel, role-based access with Row Level Security. Cloudinary integration for optimized product images (WebP/AVIF auto-conversion).",
    architectureDetails: [
      "Set up Supabase backend with Row Level Security (RLS) policies for user and transaction data protection",
      "Created complete customer shopping experience: filtering, shopping cart, checkout, and order history",
      "Built a secure administration dashboard for inventory management, product editing, and sales logging",
      "Leveraged Cloudinary for auto-converting uploaded product images into WebP/AVIF formats"
    ],
    techStack: ["Next.js", "Supabase", "TypeScript", "PostgreSQL", "Cloudinary", "Google OAuth"],
    githubUrl: "https://github.com/Bijoy2406/denz",
    liveUrl: "https://www.denzapparel.com/", // Placeholder link
    metrics: "Supabase RLS · WebP/AVIF Compressing"
  },
  {
    id: "project-4",
    title: "CampusCrew",
    role: "Full Stack Developer",
    image: "/projects/campuscrew.png",
    shortDescription: "Comprehensive campus event management platform with payment integration and automated PDF certificates.",
    fullDescription: "Campus event management platform (MERN stack) – event creation/discovery, bKash & SSLCommerz payment integration, automated PDF certificate generation, QR code verification, and a recommendation engine for personalized event suggestions. JWT auth, email notifications, Cloudinary image storage.",
    architectureDetails: [
      "Developed a full event discovery and creation pipeline using the MERN stack",
      "Integrated bKash and SSLCommerz payment gateways for paid event ticket purchases",
      "Built an automated PDF certificate generation system with QR-code verification checks",
      "Implemented a custom recommendation engine proposing relevant events based on user preferences"
    ],
    techStack: ["React", "Node.js", "Express", "MongoDB", "JWT", "bKash API", "SSLCommerz"],
    githubUrl: "https://github.com/Bijoy2406/CampusCrew",
    liveUrl: "https://www.campuscrew.app/", // Placeholder link
    metrics: "bKash & SSLCommerz · PDF Generation"
  },
  {
    id: "project-5",
    title: "Navid's Portfolio",
    role: "Frontend Developer",
    image: "/projects/navid.png",
    shortDescription: "YAML-driven portfolio for a photographer and cinematographer featuring GSAP animations and Gemini AI.",
    fullDescription: "Single-page portfolio site for a photographer/cinematographer, built with Next.js and GSAP animations. Content fully driven by YAML files, so the site owner updates copy without touching code – hero, bio, experience, skills, all editable. Gemini API integration for AI-assisted features.",
    architectureDetails: [
      "Engineered a dynamic content layer driven entirely by local YAML data configurations",
      "Built smooth, high-fidelity landing page animations and micro-interactions using GSAP",
      "Integrated Gemini API to power smart, context-aware AI-assisted assistant utilities",
      "Optimized media loading to showcase high-resolution photography efficiently"
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP", "Gemini API", "js-yaml"],
    githubUrl: "https://github.com/Bijoy2406/navid_portfolio",
    liveUrl: "https://tamzidnavid.netlify.app/", // Placeholder link
    metrics: "GSAP Animations · Gemini AI Integration"
  }
];
