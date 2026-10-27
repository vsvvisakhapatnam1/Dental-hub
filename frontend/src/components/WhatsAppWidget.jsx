"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Send } from "lucide-react";

const PHONE = "918951950389";
const DISPLAY = "+91-89519 50389";
const AVATAR = "https://static.prod-images.emergentagent.com/jobs/44036ef2-8e8a-4b54-af78-efd0b0e3f36e/images/6c0412e158797332c8466a5ae51761307b0608b9e356974ef142b6932902cfab.jpeg";

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setGreeting(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const openChat = () => {
    const text = encodeURIComponent(msg || "Hi Dental Hub Pro, I'd like to know more about your platform.");
    window.open(`https://wa.me/${PHONE}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const toggle = () => { setGreeting(false); setOpen((v) => !v); };

  return (
    <div className="fixed bottom-24 right-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            data-testid="whatsapp-chatbox"
            className="w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
          >
            <div className="bg-[#075E54] p-4 text-white flex items-center gap-3">
              <img src={AVATAR} alt="Assistant" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/40" />
              <div className="min-w-0">
                <p className="font-heading font-bold leading-tight">Dental Hub Pro</p>
                <p className="text-xs text-emerald-100 flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#25D366]" /> Assistant · replies in minutes</p>
              </div>
              <button data-testid="whatsapp-close" onClick={() => setOpen(false)} className="ml-auto rounded-full p-1 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-[#e5ddd5] dark:bg-slate-800">
              <div className="rounded-xl rounded-tl-none bg-white dark:bg-slate-700 p-3 text-sm text-slate-700 dark:text-slate-100 shadow-sm max-w-[85%]">
                👋 Hello! How can I help? Ask me about jobs, listings, products or clinic design.
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <textarea
                data-testid="whatsapp-message"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={2}
                placeholder="Type your message…"
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <div className="flex items-center gap-2">
                <button data-testid="whatsapp-send" onClick={openChat} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a] transition-colors">
                  <Send className="h-4 w-4" /> Chat on WhatsApp
                </button>
                <a href={`tel:+${PHONE}`} data-testid="whatsapp-call" className="grid place-items-center h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800" title={DISPLAY}>
                  <Phone className="h-4 w-4" />
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
            className="relative mr-1 max-w-[220px] rounded-2xl rounded-br-none bg-white dark:bg-slate-800 px-4 py-3 shadow-xl border border-slate-100 dark:border-slate-700"
          >
            <button data-testid="whatsapp-greeting-close" onClick={() => setGreeting(false)} className="absolute -top-2 -left-2 grid place-items-center h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-300"><X className="h-3 w-3" /></button>
            <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">Hello! 👋</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">How can I help you today?</p>
            <span className="absolute -bottom-2 right-4 h-4 w-4 rotate-45 bg-white dark:bg-slate-800 border-b border-r border-slate-100 dark:border-slate-700" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar button */}
      <button
        data-testid="whatsapp-fab"
        onClick={toggle}
        aria-label="Chat with our assistant"
        className="group relative h-16 w-16 rounded-full shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-transform"
      >
        {!open && greeting === false && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30 pointer-events-none" />}
        {open ? (
          <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-800 text-white"><X className="h-6 w-6" /></span>
        ) : (
          <>
            <img src={AVATAR} alt="Chat assistant" className="h-16 w-16 rounded-full object-cover ring-2 ring-white" />
            <span className="absolute -bottom-0.5 -right-0.5 grid h-7 w-7 place-items-center rounded-full bg-[#25D366] ring-2 ring-white">
              <MessageCircle className="h-4 w-4 text-white" />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
