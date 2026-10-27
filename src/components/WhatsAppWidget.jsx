"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Send, Loader2, Sparkles, Bot, ExternalLink } from "lucide-react";

const PHONE = "918951950389";
const DISPLAY = "+91-89519 50389";
const LOGO_AVATAR = "/logo.png";

const QUICK_PROMPTS = [
  "🔍 Find Dentist Jobs",
  "🏥 How to Post a Clinic Space?",
  "📐 Clinic Setup & Design",
  "💰 Pricing Packages",
];

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "👋 Hello! I am your Dental Hub Pro Assistant. How can I help you today with jobs, clinic opportunities, or services?",
      time: "Just now",
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setGreeting(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async (textToSend) => {
    const query = (textToSend || inputMsg).trim();
    if (!query || loading) return;

    const userMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages,
        }),
      });

      const data = await res.json();
      const botReply = {
        id: "bot-" + Date.now(),
        sender: "assistant",
        text: data?.reply || "Thank you for reaching out! Let me know if you need assistance with dental opportunities.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          sender: "assistant",
          text: "I am ready to help! You can explore our listings on the menu, or connect directly on WhatsApp at +91-89519 50389.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openWhatsAppDirect = () => {
    const text = encodeURIComponent(
      inputMsg || "Hi Dental Hub Pro, I'd like to know more about dental opportunities on your platform."
    );
    window.open(`https://wa.me/${PHONE}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const toggle = () => {
    setGreeting(false);
    setOpen((v) => !v);
  };

  return (
    <div className="fixed bottom-6 right-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 25 }}
            data-testid="whatsapp-chatbox"
            className="w-[370px] max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[80vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
          >
            {/* Header: Dental Hub Blue & Brown theme */}
            <div className="bg-gradient-to-r from-[#1D70B8] via-[#16508C] to-[#5C3A21] p-4 text-white flex items-center gap-3 shrink-0 shadow-sm">
              <div className="relative h-11 w-11 rounded-full bg-white p-1 ring-2 ring-white/60 shrink-0 overflow-hidden flex items-center justify-center">
                <img
                  src={LOGO_AVATAR}
                  alt="Dental Hub Assistant"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-heading font-bold text-[15px] leading-tight truncate">Dental Hub Pro</p>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <p className="text-xs text-sky-100 flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Assistant · replies in minutes
                </p>
              </div>
              <button
                data-testid="whatsapp-close"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/80 dark:bg-slate-950/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] shadow-sm ${
                      m.sender === "user"
                        ? "bg-[#1D70B8] text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none leading-relaxed"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-3.5 py-2.5 w-fit shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1D70B8]" />
                  <span>Dental Hub AI is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            {messages.length <= 2 && (
              <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 shrink-0">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt.replace(/^[^\w]+/, ""))}
                    className="text-[11px] font-medium bg-sky-50 dark:bg-sky-950/40 text-[#1D70B8] dark:text-sky-300 hover:bg-sky-100 px-2.5 py-1 rounded-full border border-sky-200/60 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  data-testid="whatsapp-message"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D70B8] transition-all"
                />
                <button
                  data-testid="whatsapp-send"
                  onClick={() => sendMessage()}
                  disabled={!inputMsg.trim() || loading}
                  className="grid place-items-center h-10 w-10 rounded-xl bg-[#1D70B8] text-white hover:bg-[#165a96] disabled:opacity-40 disabled:hover:bg-[#1D70B8] transition-colors shadow-sm"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Secondary WhatsApp & Direct Call row */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                <button
                  onClick={openWhatsAppDirect}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                >
                  <ExternalLink className="h-3 w-3" /> Continue on WhatsApp
                </button>
                <a
                  href={`tel:+${PHONE}`}
                  data-testid="whatsapp-call"
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                >
                  <Phone className="h-3 w-3" /> {DISPLAY}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting speech bubble */}
      <AnimatePresence>
        {greeting && !open && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.9 }}
            data-testid="whatsapp-greeting"
            className="relative mr-1 max-w-[240px] rounded-2xl rounded-br-none bg-white dark:bg-slate-800 px-4 py-3 shadow-xl border border-slate-200/90 dark:border-slate-700 cursor-pointer"
            onClick={toggle}
          >
            <button
              data-testid="whatsapp-greeting-close"
              onClick={(e) => {
                e.stopPropagation();
                setGreeting(false);
              }}
              className="absolute -top-2 -left-2 grid place-items-center h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-300"
              aria-label="Close greeting"
            >
              <X className="h-3 w-3" />
            </button>
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug flex items-center gap-1">
              <span>Hi there! 👋</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
              Have questions about dental jobs or clinic listings? Chat with our AI assistant!
            </p>
            <span className="absolute -bottom-2 right-4 h-4 w-4 rotate-45 bg-white dark:bg-slate-800 border-b border-r border-slate-200/90 dark:border-slate-700" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <button
        data-testid="whatsapp-fab"
        onClick={toggle}
        aria-label="Chat with Dental Hub Pro AI Assistant"
        className="group relative h-16 w-16 rounded-full shadow-xl shadow-blue-900/25 hover:scale-105 active:scale-95 transition-transform bg-white border-2 border-white ring-2 ring-[#1D70B8]/40"
      >
        {!open && greeting === false && (
          <span className="absolute -inset-1 rounded-full bg-[#1D70B8] opacity-30 animate-ping pointer-events-none" />
        )}
        {open ? (
          <span className="grid h-full w-full place-items-center rounded-full bg-[#1D70B8] text-white">
            <X className="h-6 w-6" />
          </span>
        ) : (
          <div className="relative h-full w-full rounded-full overflow-hidden p-1 flex items-center justify-center bg-white">
            <img
              src={LOGO_AVATAR}
              alt="Dental Hub Pro Assistant"
              className="h-full w-full object-contain"
            />
            <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full bg-[#1D70B8] text-white ring-2 ring-white">
              <Bot className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
