import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Ruler, PenTool, Layers, Sparkles, CheckCircle2, ArrowRight, Building2, Palette, Sofa, Lightbulb,
} from "lucide-react";

const PACKAGES = [
  { name: "Starter Clinic", chairs: "1–2 Chairs", price: "from ₹6.5L", features: ["Space planning & zoning", "Reception + 1 operatory", "Basic branding & signage", "Electrical & plumbing layout"], popular: false },
  { name: "Growth Practice", chairs: "3–5 Chairs", price: "from ₹18L", features: ["Full interior design", "Sterilization & X-ray zone", "Custom cabinetry", "Brand identity & signage", "Lighting & HVAC design"], popular: true },
  { name: "Premium Studio", chairs: "6+ Chairs / Multi-specialty", price: "Custom", features: ["Turnkey execution", "Luxury patient experience", "Digital workflow integration", "Lab & consult rooms", "Project management"], popular: false },
];

const STEPS = [
  { i: Ruler, t: "Site & Needs Survey", d: "We assess your space, footfall and specialty mix." },
  { i: PenTool, t: "Concept & 3D Design", d: "Mood boards, floor plans and 3D walkthroughs." },
  { i: Layers, t: "Execution & Fit-out", d: "Civil, cabinetry, electricals and equipment install." },
  { i: Sparkles, t: "Handover & Support", d: "Snag-free handover with post-setup support." },
];

const GALLERY = [
  "https://images.unsplash.com/photo-1616391182219-e080b4d1043a?w=700&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1704455306251-b4634215d98f?w=700&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1728342057953-94bfad8f0e7e?w=700&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1704455306925-1401c3012117?w=700&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606811856475-5e6fcdc6e509?w=700&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1698749778813-ad5f2814e50f?w=700&q=70&auto=format&fit=crop",
];

export default function ClinicDesign() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div>
      <section className="relative overflow-hidden bg-emerald-900 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-800/70 px-3 py-1 text-xs font-semibold text-emerald-100"><Building2 className="h-3.5 w-3.5" /> Clinic Design & Setup</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-extrabold leading-tight">Design a clinic patients<br /><span className="text-amber-400">love to walk into.</span></h1>
            <p className="mt-4 max-w-xl text-emerald-100">End-to-end dental clinic design, interior and turnkey setup — from a single-chair start-up to multi-specialty studios. Concept to handover, done right.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button data-testid="cd-consult" onClick={() => navigate("/contact")} className="rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">Book a free consult <ArrowRight className="h-4 w-4 ml-1" /></Button>
              <Button variant="outline" onClick={() => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20">View packages</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GALLERY.slice(0, 4).map((g, i) => (
              <motion.img key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} src={g} alt="Clinic design" className={`rounded-2xl object-cover h-40 w-full ${i % 3 === 0 ? "mt-6" : ""}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-14">
        <h2 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white text-center">How it works</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <motion.div key={s.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <span className="absolute -top-3 -left-3 grid place-items-center h-8 w-8 rounded-full bg-amber-500 text-slate-900 text-sm font-bold">{i + 1}</span>
              <s.i className="h-6 w-6 text-emerald-800" /><h3 className="mt-3 font-heading font-bold text-slate-900 dark:text-white">{s.t}</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="packages" className="bg-slate-50 dark:bg-slate-950/40 py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white text-center">Design packages</h2>
          <p className="mt-2 text-center text-slate-500">Indicative pricing for demonstration. Final quote after site survey.</p>
          <div className="mt-10 grid lg:grid-cols-3 gap-6">
            {PACKAGES.map((p) => (
              <div key={p.name} data-testid={`cd-package-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className={`rounded-3xl border bg-white dark:bg-slate-900 p-7 relative ${p.popular ? "border-emerald-600 shadow-xl ring-2 ring-emerald-600/20" : "border-slate-200 dark:border-slate-800"}`}>
                {p.popular && <span className="absolute -top-3 left-7 rounded-full bg-emerald-800 px-3 py-1 text-xs font-bold text-white">Most Popular</span>}
                <h3 className="font-heading text-xl font-extrabold text-slate-900 dark:text-white">{p.name}</h3>
                <p className="text-sm text-slate-500">{p.chairs}</p>
                <p className="mt-4 font-heading text-3xl font-extrabold text-emerald-800 dark:text-emerald-400">{p.price}</p>
                <ul className="mt-5 space-y-2">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />{f}</li>)}
                </ul>
                <Button onClick={() => navigate("/contact")} className={`mt-6 w-full rounded-full ${p.popular ? "bg-emerald-800 hover:bg-emerald-900 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}>Get a quote</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-14">
        <h2 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white text-center">What we design</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ i: Palette, t: "Interior & Branding" }, { i: Sofa, t: "Reception & Waiting" }, { i: Lightbulb, t: "Lighting & Ambience" }, { i: Layers, t: "Operatory Layout" }].map((f) => (
            <div key={f.t} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center">
              <f.i className="h-6 w-6 text-emerald-800 mx-auto" /><h3 className="mt-3 font-heading font-semibold text-slate-900 dark:text-white text-sm">{f.t}</h3>
            </div>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3">
          {GALLERY.map((g, i) => <img key={i} src={g} alt="Design gallery" className="rounded-2xl object-cover h-48 w-full" />)}
        </div>
      </section>
    </div>
  );
}
