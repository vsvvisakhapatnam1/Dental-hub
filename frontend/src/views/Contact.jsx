"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill all fields"); return; }
    toast.success("Thanks! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };
  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="font-heading text-4xl font-extrabold text-slate-900 dark:text-white">Get in touch</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Questions about opportunities, partnerships or listing on the Hub? Send us a message.</p>
        <div className="mt-8 space-y-4">
          <Item icon={Mail} label="Email" value="info@dentalhubpro.com" />
          <Item icon={MessageCircle} label="WhatsApp" value="+91-89519 50389" />
          <Item icon={MapPin} label="Base" value="India-first · Expanding globally" />
        </div>
      </div>
      <form onSubmit={submit} data-testid="contact-form" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-4">
        <div><Label className="mb-1.5 block">Name</Label><Input data-testid="contact-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="rounded-xl" /></div>
        <div><Label className="mb-1.5 block">Email</Label><Input data-testid="contact-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="rounded-xl" /></div>
        <div><Label className="mb-1.5 block">Message</Label><Textarea data-testid="contact-message" value={form.message} onChange={(e) => set("message", e.target.value)} rows={5} className="rounded-xl" /></div>
        <Button type="submit" data-testid="contact-submit" className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white"><Send className="h-4 w-4 mr-1" /> Send message</Button>
      </form>
    </div>
  );
}

function Item({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid place-items-center h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400"><Icon className="h-5 w-5" /></span>
      <div><p className="text-xs text-slate-400">{label}</p><p className="font-medium text-slate-800 dark:text-slate-100">{value}</p></div>
    </div>
  );
}
