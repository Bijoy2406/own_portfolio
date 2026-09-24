import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, User, ThumbsUp, ThumbsDown, RotateCcw, Plus, ChevronDown } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useChatModels, type ChatModel } from "../lib/useChatModels";

// ─── Button Customization ───────────────────────────────────────────────────
// 💡 Change this hex code anytime to change the floating button's background color:
export const BOT_BUTTON_BG_COLOR = "#0F0C1B";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  feedback?: "up" | "down" | null;
  /** Model id that actually served this reply (from x-model-used header). */
  model?: string;
}

const MODEL_STORAGE_KEY = "cipher_model_id";

// ─── Suggestion Chips ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What projects has Tajuddin built?",
  "What's his tech stack?",
  "How can I contact him?",
  "Tell me about his education",
];

// ─── Markdown Renderer ────────────────────────────────────────────────────────
const renderFormattedText = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|https?:\/\/[^\s<)]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold text-zinc-100">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(<code key={match.index} className="px-1 py-0.5 rounded bg-zinc-800 font-mono text-[11px] text-emerald-400 border border-zinc-700/60">{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const lm = token.match(/\[(.*?)\]\((.*?)\)/);
      if (lm) {
        parts.push(<a key={match.index} href={lm[2]} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors font-medium">{lm[1]}</a>);
      } else parts.push(token);
    } else if (token.startsWith("http://") || token.startsWith("https://")) {
      parts.push(<a key={match.index} href={token} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors font-medium">{token}</a>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={match.index} className="italic text-zinc-300">{token.slice(1, -1)}</em>);
    } else parts.push(token);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.substring(lastIndex));
  return parts;
};

const FormattedMessage: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) return <span className="whitespace-pre-wrap">{content}</span>;
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 leading-relaxed text-zinc-300">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;
        const bulletMatch = line.match(/^(\s*)([-*•])\s+(.+)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="text-emerald-400 select-none mt-1.5 text-[7px] leading-none shrink-0">●</span>
              <div className="flex-1">{renderFormattedText(bulletMatch[3])}</div>
            </div>
          );
        }
        const numberMatch = line.match(/^(\s*)(\d+[\.\)])\s+(.+)$/);
        if (numberMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="text-emerald-400 font-mono text-xs select-none shrink-0 font-medium">{numberMatch[2]}</span>
              <div className="flex-1">{renderFormattedText(numberMatch[3])}</div>
            </div>
          );
        }
        return <div key={idx}>{renderFormattedText(line)}</div>;
      })}
    </div>
  );
};

// ─── Model Picker ─────────────────────────────────────────────────────────────
// Compact dropdown that lives in the chat header. Picks the LLM model for the
// next request and persists the choice to localStorage. Renders the resolved
// model's label on the trigger button and a small availability dot per entry.
interface ModelPickerProps {
  models: ChatModel[];
  loading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

const ModelPicker: React.FC<ModelPickerProps> = ({
  models,
  loading,
  selectedId,
  onSelect,
  open,
  onOpenChange,
  menuRef,
}) => {
  // Pick the visible label: prefer an explicit selection, else the first model
  // in the list (server's default order), else a skeleton pulse while loading.
  const selected = models.find((m) => m.id === selectedId) ?? models[0];
  const triggerLabel = loading
    ? "Loading…"
    : selected
      ? selected.label
      : models.length === 0
        ? "No models"
        : "Pick a model";

  // Close on outside click + Escape (keyboard accessibility).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, menuRef, onOpenChange]);

  return (
    <div ref={menuRef} className="relative shrink min-w-0">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Switch AI model"
        className="flex items-center gap-1.5 max-w-[140px] sm:max-w-[170px] px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors truncate"
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${loading ? "bg-zinc-600 animate-pulse" : selected?.available === false ? "bg-red-500" : "bg-emerald-500"}`} />
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-1.5 w-60 max-h-64 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 z-50 py-1"
          >
            {models.length === 0 && !loading && (
              <li className="px-3 py-2 text-xs text-zinc-500">No models available</li>
            )}
            {loading && models.length === 0 && (
              <li className="px-3 py-2 text-xs text-zinc-500 animate-pulse">Loading models…</li>
            )}
            {models.map((m) => {
              const isSelected = (selected?.id ?? selectedId) === m.id;
              return (
                <li key={m.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => onSelect(m.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.available ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="flex-1 truncate font-medium">{m.label}</span>
                    <span className="text-[10px] text-zinc-500 truncate">{m.id}</span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // DotLottieReact measures its canvas box on mount using getBoundingClientRect(),
  // which reflects the button's live CSS transform. Mounting it while the button
  // is still mid-spring from `initial={{ scale: 0 }}` lets it lock onto a
  // near-zero or partial size that never self-corrects, leaving the icon blank.
  // Gate the lottie mount on the entrance animation's completion so it always
  // measures the button at its true, settled size.
  const [iconReady, setIconReady] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hi! I'm **Cipher** — Tajuddin's portfolio assistant. Ask me anything about his projects, technical skills, education, or how to reach him!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [lastUserMsg, setLastUserMsg] = useState<string | null>(null);
  // ─── Model picker ──────────────────────────────────────────────────────────
  // Persists across sessions so the visitor doesn't have to re-pick every time.
  // We don't validate against the upstream list at hydration — if the saved id
  // is gone from /api/models, the server falls back to its default for the
  // next request, and we let the dropdown show whatever is current.
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem(MODEL_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const { models, loading: modelsLoading } = useChatModels();
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen, scrollToBottom]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // ─── Send Message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (userMsg: string, currentMessages: Message[]) => {
    setIsLoading(true);
    setLastUserMsg(userMsg);
    setShowSuggestions(false);

    // Add empty assistant placeholder for streaming
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages.map(({ role, content }) => ({ role, content })),
          // Pass the user's chosen model — server may silently fall back if
          // it's 404/429, in which case the resolved id comes back via the
          // `model` field on each streaming chunk (see below).
          ...(selectedModelId ? { model: selectedModelId } : {}),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw Object.assign(new Error(data.error || "Request failed"), { status: res.status });
      }

      // Read the resolved model from the response header once so we can show it
      // as a "via: ..." subtitle if fallback kicked in.
      const resolvedModel = res.headers.get("x-model-used") || undefined;

      const contentType = res.headers.get("content-type") || "";

      // ── Streaming path ────────────────────────────────────────────────────
      if (contentType.includes("text/event-stream")) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;
            try {
              const { delta, model } = JSON.parse(payload);
              if (delta) {
                setMessages((prev) => {
                  const msgs = [...prev];
                  const last = msgs[msgs.length - 1];
                  if (last.id === assistantId) {
                    msgs[msgs.length - 1] = {
                      ...last,
                      content: last.content + delta,
                      // Lock in the model that actually served this reply — the
                      // header value wins if the chunk omits it.
                      model: last.model || model || resolvedModel,
                    };
                  }
                  return msgs;
                });
              }
            } catch { /* ignore malformed chunks */ }
          }
        }
      } else {
        // ── Non-streaming fallback ───────────────────────────────────────────
        const data = await res.json();
        setMessages((prev) => {
          const msgs = [...prev];
          const last = msgs[msgs.length - 1];
          if (last.id === assistantId) {
            msgs[msgs.length - 1] = {
              ...last,
              content: data.reply || "No response received.",
              model: data.model || resolvedModel,
            };
          }
          return msgs;
        });
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        // User stopped generation — keep whatever text arrived
        return;
      }

      const status = error?.status;
      let userMessage = "Something went wrong. Please try again in a moment.";
      if (!navigator.onLine) {
        userMessage = "You appear to be offline. Please check your connection.";
      } else if (status === 429) {
        userMessage = "I'm getting a lot of questions right now — please wait a moment and try again.";
      } else if (status === 401 || status === 403) {
        // Don't inline the owner's email here — Netlify's secret-scanner
        // compares env-var values against the repo + build output, so
        // duplicating the personal-email string in client source would fail
        // the deploy. Visitors can find contact details in the Contact
        // section of the portfolio.
        userMessage = "There's a configuration issue on our end. Feel free to reach out via the Contact section of this portfolio.";
      } else if (status && status >= 500) {
        userMessage = "The AI service is temporarily unavailable. Please try again shortly.";
      }

      setMessages((prev) => {
        const msgs = [...prev];
        const last = msgs[msgs.length - 1];
        if (last.id === assistantId) {
          msgs[msgs.length - 1] = { ...last, content: userMessage, isError: true };
        }
        return msgs;
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [selectedModelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", content: userMsg };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await sendMessage(userMsg, updatedMessages);
  };

  const handleSuggestion = (suggestion: string) => {
    if (isLoading) return;
    setInput("");
    setShowSuggestions(false);
    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", content: suggestion };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    sendMessage(suggestion, updatedMessages);
  };

  const handleRetry = () => {
    if (!lastUserMsg || isLoading) return;
    // Remove last error message, re-send
    setMessages((prev) => prev.filter((m) => !m.isError));
    const filtered = messages.filter((m) => !m.isError);
    sendMessage(lastUserMsg, filtered);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const handleFeedback = (id: string, fb: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: m.feedback === fb ? null : fb } : m))
    );
  };

  const handleNewChat = () => {
    setMessages([{
      id: "init",
      role: "assistant",
      content: "Hi! I'm **Cipher** — Tajuddin's portfolio assistant. Ask me anything about his projects, technical skills, education, or how to reach him!",
    }]);
    setShowSuggestions(true);
    setLastUserMsg(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: isOpen ? 0 : 1.08 }}
        whileTap={{ scale: isOpen ? 0 : 0.95 }}
        onAnimationComplete={() => setIconReady(true)}
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: BOT_BUTTON_BG_COLOR }}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg shadow-black/40 flex items-center justify-center cursor-pointer border-0 focus:outline-none transition-transform overflow-hidden"
        aria-label="Open AI Chat"
      >
        {/*
          DotLottieReact silently drops the `style` prop whenever a
          `className` is also passed (it forwards style to its internal
          wrapper div only when className is falsy), which previously
          left the canvas at the browser's default 300x150 intrinsic
          size — clipped to almost nothing inside this button.
          It also measures its canvas via getBoundingClientRect() on
          mount, which reflects live CSS transforms — mounting it here
          while the button is still mid scale-in spring let it lock
          onto a near-zero size that never self-corrected. `iconReady`
          (set by onAnimationComplete above) delays the mount until the
          button has settled at its true, final size; a static Bot icon
          fills the gap for that first instant so the button never
          reads as empty.
        */}
        {iconReady ? (
          <DotLottieReact
            src="/chatbot-typing-clean.lottie"
            loop
            autoplay
            // Pin to the button's true desktop size (64px) so dotlottie allocates
            // a high-resolution backing canvas. Without an explicit pixel size
            // it falls back to its intrinsic 300x150, which gets squeezed into
            // the round button and renders soft. We deliberately leave
            // `image-rendering` at its default `auto` — dotlottie draws the
            // animation on a vector canvas, so the browser should smooth
            // it normally instead of nearest-neighbor-upscaling it.
            style={{
              width: "100%",
              height: "100%",
              maxWidth: 64,
              maxHeight: 64,
              pointerEvents: "none",
            }}
          />
        ) : (
          <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white/90" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Cipher — Portfolio AI Assistant"
            className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-[400px] h-[540px] max-h-[82vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-zinc-950/70 border-b border-zinc-800 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-100">Cipher</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs text-zinc-400">Portfolio Assistant</p>
                  </div>
                </div>
              </div>

              {/* Model picker dropdown — sits between the title and the
                  action buttons. Compact on narrow widths so the header never
                  wraps awkwardly. */}
              <ModelPicker
                models={models}
                loading={modelsLoading}
                selectedId={selectedModelId}
                onSelect={(id) => {
                  setSelectedModelId(id);
                  try { window.localStorage.setItem(MODEL_STORAGE_KEY, id); } catch {}
                  setModelMenuOpen(false);
                }}
                open={modelMenuOpen}
                onOpenChange={setModelMenuOpen}
                menuRef={modelMenuRef}
              />

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleNewChat}
                  title="New chat"
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800"
                  aria-label="Start new chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-800"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              role="log"
              aria-label="Chat messages"
              aria-live="polite"
              aria-atomic="false"
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-[88%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center mt-0.5 ${
                    msg.role === "user"
                      ? "bg-zinc-800 text-zinc-200"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div
                      role={isLoading && msg.content === "" ? "status" : undefined}
                      aria-label={isLoading && msg.content === "" ? "Cipher is typing" : undefined}
                      className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-emerald-500 text-zinc-950 font-medium rounded-tr-sm"
                          : msg.isError
                          ? "bg-red-950/40 text-red-300 border border-red-800/40 rounded-tl-sm"
                          : "bg-zinc-950/80 text-zinc-200 border border-zinc-800/80 rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {/* Show typing dots inside the empty placeholder bubble */}
                      {msg.role === "assistant" && msg.content === "" && isLoading ? (
                        <div className="flex items-center gap-1.5 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      ) : (
                        <FormattedMessage content={msg.content} isUser={msg.role === "user"} />
                      )}
                    </div>

                    {/* Error retry */}
                    {msg.isError && (
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-emerald-400 transition-colors self-start ml-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Try again
                      </button>
                    )}

                    {/* "via: <model>" subtitle — only when a fallback kicked
                        in (resolved model differs from the user's pick). */}
                    {msg.role === "assistant" && !msg.isError && msg.id !== "init" && msg.content !== "" && msg.model && msg.model !== selectedModelId && (
                      <p className="text-[10px] text-zinc-600 ml-1 self-start" title={`Served by ${msg.model}`}>
                        via: <span className="text-zinc-500">{msg.model}</span>
                      </p>
                    )}

                    {/* Feedback thumbs — only on completed messages */}
                    {msg.role === "assistant" && !msg.isError && msg.id !== "init" && msg.content !== "" && (
                      <div className="flex gap-1 ml-1">
                        <button
                          onClick={() => handleFeedback(msg.id, "up")}
                          aria-label="Helpful"
                          className={`transition-colors text-xs ${msg.feedback === "up" ? "text-emerald-400" : "text-zinc-700 hover:text-zinc-400"}`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, "down")}
                          aria-label="Not helpful"
                          className={`transition-colors text-xs ${msg.feedback === "down" ? "text-red-400" : "text-zinc-700 hover:text-zinc-400"}`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {showSuggestions && messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    disabled={isLoading}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-zinc-950/70 border-t border-zinc-800 shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <label htmlFor="chat-input" className="sr-only">Type your message</label>
                <input
                  id="chat-input"
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about skills, projects..."
                  disabled={isLoading}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-60"
                />

                {isLoading ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all flex items-center justify-center shrink-0"
                    aria-label="Stop generating"
                    title="Stop generating"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-md shadow-emerald-500/10"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};