import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2, Github, Linkedin, Copy, Check, ArrowUpRight } from "lucide-react";
import { PERSONAL_INFO } from "../data/portfolioData";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 6000);
    } catch (error: any) {
      console.error("Submission error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong. Please try again later.");
    }
  };

  return (
    <section id="contact" className="py-28 px-6 border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Information & Direct Channels */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5 flex flex-col space-y-8"
          >
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold mb-2 block">
                06. Connect
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-4">
                Get in Touch
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
                Have a question or want to work together? Drop me a message!
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              {/* Email Card */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-11 h-11 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
                      Email
                    </span>
                    <a
                      href={`mailto:${PERSONAL_INFO.contact.email}`}
                      className="text-sm font-medium text-zinc-200 hover:text-emerald-400 transition-colors truncate block"
                    >
                      {PERSONAL_INFO.contact.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
                  title="Copy email address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Location Card */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
                    Location
                  </span>
                  <span className="text-sm font-medium text-zinc-200">
                    {PERSONAL_INFO.contact.location || "Mirpur, Dhaka"}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Ghost Buttons (per DESIGN.md ghost button spec) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={PERSONAL_INFO.contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 bg-transparent text-zinc-300 text-sm font-medium transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/50"
              >
                <Github className="w-4 h-4 text-zinc-400" />
                <span>GitHub Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>
              <a
                href={PERSONAL_INFO.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 bg-transparent text-zinc-300 text-sm font-medium transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/50"
              >
                <Linkedin className="w-4 h-4 text-zinc-400" />
                <span>LinkedIn Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </motion.div>

          {/* Right Column: Interactive Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="lg:col-span-7"
          >
            {/* Card Spec per DESIGN.md: bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 transition-all duration-200 */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 sm:p-8 backdrop-blur-sm transition-all duration-200">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Your Name */}
                <div>
                  <label htmlFor="name" className="sr-only">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>

                {/* Your Email */}
                <div className="relative">
                  <label htmlFor="email" className="sr-only">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-4 py-3.5 pr-11 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="sr-only">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>

                {/* Your Message */}
                <div>
                  <label htmlFor="message" className="sr-only">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                  />
                </div>

                {/* Feedback Alerts */}
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Thank you! Your message has been sent successfully. I'll get back to you soon.</span>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs sm:text-sm flex items-center gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Submit Button per DESIGN.md primary button spec:
                    px-5 py-2.5 rounded-lg bg-emerald-500 text-zinc-950 font-semibold text-sm transition-all duration-200 hover:bg-emerald-400 active:scale-[0.98] shadow-sm */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 px-5 rounded-lg bg-emerald-500 text-zinc-950 font-semibold text-sm transition-all duration-200 hover:bg-emerald-400 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4 text-zinc-950" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
