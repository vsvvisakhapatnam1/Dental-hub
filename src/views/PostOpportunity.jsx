"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  LOOKING_CATEGORIES, OFFERING_CATEGORIES, SPECIALITIES, QUALIFICATIONS, EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES, CITIES, STATES,
} from "@/lib/constants";
import { Search, Briefcase, ArrowRight, ArrowLeft, Loader2, CheckCircle2, PlusCircle } from "lucide-react";

export default function PostOpportunity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    mode: user?.role === "giver" ? "offering" : "looking",
    category: "", title: "", description: "", city: "", state: "", speciality: "", qualification: "",
    experience: "", employment_type: "", compensation: "", requirements: "", perks: "",
    contact_method: "email", contact_value: user?.email || "",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const steps = ["Type & Category", "Key Details", "Requirements & Perks", "Contact & Review"];
  const cats = f.mode === "looking" ? LOOKING_CATEGORIES : OFFERING_CATEGORIES;

  const next = () => {
    if (step === 0 && !f.category) { toast.error("Please choose a category"); return; }
    if (step === 1 && (!f.title || !f.city)) { toast.error("Title and city are required"); return; }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/opportunities", f);
      toast.success("Opportunity submitted for review!");
      navigate(`/opportunities/${data.id}`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not post");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 py-12">
      <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><PlusCircle className="h-8 w-8 text-[#1D70B8]" /> Post an Opportunity</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Listings go live after admin review. The form adapts to your chosen category.</p>

      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => <div key={s} className="flex-1"><div className={`h-1.5 rounded-full ${i <= step ? "bg-[#1D70B8]" : "bg-slate-200 dark:bg-slate-700"}`} /></div>)}
      </div>
      <h2 className="mt-6 font-heading text-2xl font-bold text-slate-900 dark:text-white">{steps[step]}</h2>

      <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8" data-testid="post-form">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Are you looking or offering?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" data-testid="post-mode-looking" onClick={() => { set("mode", "looking"); set("category", ""); }} className={`rounded-2xl border-2 p-4 text-left ${f.mode === "looking" ? "border-emerald-700 bg-emerald-50" : "border-slate-200"}`}><Search className="h-5 w-5 text-emerald-700" /><p className="mt-2 font-semibold">I'm Looking For</p></button>
                <button type="button" data-testid="post-mode-offering" onClick={() => { set("mode", "offering"); set("category", ""); }} className={`rounded-2xl border-2 p-4 text-left ${f.mode === "offering" ? "border-amber-600 bg-amber-50" : "border-slate-200"}`}><Briefcase className="h-5 w-5 text-amber-600" /><p className="mt-2 font-semibold">I'm Offering</p></button>
              </div>
            </div>
            <div>
              <Label className="mb-3 block">Select a category</Label>
              <div className="flex flex-wrap gap-2">
                {cats.map((c) => (
                  <button type="button" key={c} data-testid={`post-cat-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`} onClick={() => set("category", c)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium border ${f.category === c ? "bg-emerald-800 text-white border-emerald-800" : "bg-white dark:bg-slate-900 border-slate-200 text-slate-700 dark:text-slate-200 hover:border-emerald-500"}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Label className="mb-1.5 block">Title</Label><Input data-testid="post-title" value={f.title} onChange={(e) => set("title", e.target.value)} className="rounded-xl" placeholder={`e.g. ${f.category} — ${f.city || "Location"}`} /></div>
            <SelField label="Speciality" value={f.speciality} onChange={(v) => set("speciality", v)} options={SPECIALITIES} testid="post-speciality" />
            <SelField label="Qualification" value={f.qualification} onChange={(v) => set("qualification", v)} options={QUALIFICATIONS} testid="post-qualification" />
            <SelField label="City" value={f.city} onChange={(v) => set("city", v)} options={CITIES} testid="post-city" />
            <SelField label="State" value={f.state} onChange={(v) => set("state", v)} options={STATES} testid="post-state" />
            <SelField label="Experience" value={f.experience} onChange={(v) => set("experience", v)} options={EXPERIENCE_LEVELS} testid="post-experience" />
            <SelField label="Employment Type" value={f.employment_type} onChange={(v) => set("employment_type", v)} options={EMPLOYMENT_TYPES} testid="post-employment" />
            <div className="sm:col-span-2"><Label className="mb-1.5 block">Compensation / Fee / Price</Label><Input data-testid="post-compensation" value={f.compensation} onChange={(e) => set("compensation", e.target.value)} className="rounded-xl" placeholder="e.g. ₹40,000/month or 50% split" /></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div><Label className="mb-1.5 block">Description</Label><Textarea data-testid="post-description" value={f.description} onChange={(e) => set("description", e.target.value)} rows={3} className="rounded-xl" /></div>
            <div><Label className="mb-1.5 block">Requirements</Label><Textarea data-testid="post-requirements" value={f.requirements} onChange={(e) => set("requirements", e.target.value)} rows={3} className="rounded-xl" placeholder="Qualification, skills, working hours…" /></div>
            <div><Label className="mb-1.5 block">Perks (optional)</Label><Textarea data-testid="post-perks" value={f.perks} onChange={(e) => set("perks", e.target.value)} rows={2} className="rounded-xl" placeholder="Equipment provided, incentives…" /></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Preferred contact method</Label>
              <RadioGroup value={f.contact_method} onValueChange={(v) => set("contact_method", v)} className="flex gap-6">
                <label className="flex items-center gap-2"><RadioGroupItem value="email" data-testid="post-contact-email" /> Email</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="whatsapp" data-testid="post-contact-whatsapp" /> WhatsApp</label>
              </RadioGroup>
            </div>
            <div><Label className="mb-1.5 block">{f.contact_method === "whatsapp" ? "WhatsApp Number" : "Contact Email"}</Label><Input data-testid="post-contact-value" value={f.contact_value} onChange={(e) => set("contact_value", e.target.value)} className="rounded-xl" placeholder={f.contact_method === "whatsapp" ? "+91 9XXXXXXXXX" : "you@example.com"} /></div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-sm">
              <p className="font-semibold mb-2">Review</p>
              <p className="text-slate-600 dark:text-slate-300">{f.mode === "looking" ? "Looking" : "Offering"} · {f.category}</p>
              <p className="font-medium text-slate-900 dark:text-white mt-1">{f.title || "(no title)"}</p>
              <p className="text-slate-500 mt-1">{f.city}{f.state && `, ${f.state}`} {f.compensation && `· ${f.compensation}`}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="ghost" data-testid="post-back" onClick={back} disabled={step === 0} className="rounded-full"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          {step < steps.length - 1 ? (
            <Button type="button" data-testid="post-next" onClick={next} className="rounded-full bg-[#1D70B8] hover:bg-[#16508C] text-white">Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
          ) : (
            <Button type="button" data-testid="post-submit" onClick={submit} disabled={busy} className="rounded-full bg-[#5C3A21] hover:bg-[#432613] text-white">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-1" /> Submit Opportunity</>}</Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function SelField({ label, value, onChange, options, testid }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Select value={value} onValueChange={onChange}><SelectTrigger data-testid={testid} className="rounded-xl"><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger><SelectContent className="bg-white dark:bg-slate-900 max-h-64">{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
    </div>
  );
}
