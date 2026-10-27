"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, DraftingCompass } from "lucide-react";

export const DESIGNER_ENGINEERING = "Designer Engineering";
export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const EMPTY_TESTIMONIAL = { client_name: "", contact: "", feedback: "" };

export const isDesignerEngineering = (form) =>
  form.profile_type === DESIGNER_ENGINEERING || form.multi.includes(DESIGNER_ENGINEERING);

export const validateDesignerEngineering = (form) => {
  if (!GST_REGEX.test((form.gst_number || "").trim().toUpperCase())) return "Please enter a valid 15-character GST Number";
  const ok = form.testimonials.filter((t) => t.client_name.trim() && t.contact.trim() && t.feedback.trim());
  if (ok.length === 0) return "Please add at least one complete Testimonial (client name, contact and feedback)";
  return null;
};

const TestimonialCard = ({ t, i, onChange, onRemove, canRemove }) => (
  <div data-testid={`de-testimonial-${i}`} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Reference {i + 1}</p>
      {canRemove && <Button type="button" variant="ghost" size="sm" data-testid={`de-testimonial-remove-${i}`} onClick={onRemove}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
    </div>
    <div className="grid sm:grid-cols-2 gap-3">
      <Input data-testid={`de-testimonial-name-${i}`} value={t.client_name} maxLength={120} onChange={(e) => onChange("client_name", e.target.value)} placeholder="Client / clinic name *" className="rounded-xl" />
      <Input data-testid={`de-testimonial-contact-${i}`} value={t.contact} maxLength={120} onChange={(e) => onChange("contact", e.target.value)} placeholder="Client phone or email *" className="rounded-xl" />
    </div>
    <Textarea data-testid={`de-testimonial-feedback-${i}`} value={t.feedback} maxLength={1000} onChange={(e) => onChange("feedback", e.target.value)} rows={2} placeholder="What did the client say about your work? *" className="rounded-xl" />
  </div>
);

export const DesignerEngineeringFields = ({ form, setForm }) => {
  const list = form.testimonials;
  const update = (i, k, v) => setForm((f) => ({ ...f, testimonials: f.testimonials.map((t, j) => (j === i ? { ...t, [k]: v } : t)) }));
  const add = () => setForm((f) => ({ ...f, testimonials: [...f.testimonials, { ...EMPTY_TESTIMONIAL }] }));
  const remove = (i) => setForm((f) => ({ ...f, testimonials: f.testimonials.filter((_, j) => j !== i) }));

  return (
    <div data-testid="designer-engineering-form" className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 dark:bg-amber-950/10 p-5 space-y-4">
      <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><DraftingCompass className="h-5 w-5 text-amber-600" /> Designer Engineering application</p>
      <div className="sm:max-w-sm">
        <Label className="mb-1.5 block">GST Number<span className="text-red-500"> *</span></Label>
        <Input data-testid="de-gst-number" value={form.gst_number} maxLength={15} onChange={(e) => setForm((f) => ({ ...f, gst_number: e.target.value.toUpperCase() }))} placeholder="e.g. 37ABCDE1234F1Z5" className="rounded-xl uppercase" />
      </div>
      <div className="space-y-3">
        <Label className="block">Testimonials as reference<span className="text-red-500"> *</span> <span className="text-xs font-normal text-slate-500">(at least one)</span></Label>
        {list.map((t, i) => (
          <TestimonialCard key={i} t={t} i={i} onChange={(k, v) => update(i, k, v)} onRemove={() => remove(i)} canRemove={list.length > 1} />
        ))}
        {list.length < 5 && <Button type="button" variant="outline" size="sm" data-testid="de-testimonial-add" onClick={add} className="rounded-full"><Plus className="h-4 w-4 mr-1" /> Add another reference</Button>}
      </div>
    </div>
  );
};
