"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPECIALITIES, CITIES } from "@/lib/constants";
import {
  Search, Briefcase, Building2, Users, GraduationCap, Globe2, Wrench, PlusCircle,
  ArrowRight, ShieldCheck, HeartHandshake, BadgeCheck,
} from "lucide-react";
import { ToothIcon } from "@/components/ToothIcon";

const LOOKING_QUICK = ["Job", "Clinic Space", "Practice Partner", "Course", "MDS Admission", "Abroad Opportunity", "Dental Service", "Practice Partnership"];
const OFFERING_QUICK = ["Dentist Job", "Associate Dentist", "Clinic Space", "Practice Partnership", "MDS Opportunity", "Course", "Dental Service", "Equipment", "Designer Engineering"];

const POPULAR = [
  { label: "Find a Job", icon: Briefcase, to: "/opportunities?mode=offering&category=Job" },
  { label: "Find a Dentist", icon: Users, to: "/dentists" },
  { label: "Clinic Opportunity", icon: Building2, to: "/opportunities?category=Clinic Space" },
  { label: "Practice Partner", icon: HeartHandshake, to: "/opportunities?category=Practice Partnership" },
  { label: "MDS & Courses", icon: GraduationCap, to: "/opportunities?category=Course" },
  { label: "Abroad Opportunities", icon: Globe2, to: "/opportunities?category=Abroad Opportunity" },
  { label: "Dental Services", icon: Wrench, to: "/opportunities?category=Dental Service" },
  { label: "Post an Opportunity", icon: PlusCircle, to: "/post" },
];

const FOR_DENTISTS = ["Find Jobs", "Build Professional Profile", "Find Clinic Opportunities", "Find Practice Partners", "Explore MDS & Courses", "Explore Abroad Opportunities"];
const FOR_CLINICS = ["Post a Job", "Find Dentists", "Find Specialists", "Find Consultants", "Find Partners", "Find Dental Services"];

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("looking");
  const [q, setQ] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [city, setCity] = useState("");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/opportunities", { params: { limit: 6 } }).then(({ data }) => {
      const sorted = [...data].sort((a, b) => (b.featured === true) - (a.featured === true));
      setFeatured(sorted.slice(0, 6));
    }).catch(() => {});
  }, []);

  const runSearch = () => {
    const p = new URLSearchParams();
    p.set("mode", mode);
    if (q) p.set("q", q);
    if (speciality) p.set("speciality", speciality);
    if (city) p.set("city", city);
    navigate(`/opportunities?${p.toString()}`);
  };

  const quick = mode === "looking" ? LOOKING_QUICK : OFFERING_QUICK;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden hub-grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 to-transparent dark:from-slate-900/40 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8 pt-16 pb-14 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">
              <ToothIcon className="h-3.5 w-3.5" /> India's Dental Opportunity Marketplace
            </span>
            <h1 className="mt-5 font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              One Platform.<br /><span className="text-emerald-800 dark:text-emerald-400">Every Dental</span> <span className="text-amber-600">Opportunity.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Connecting dentists, students, clinics, institutions and dental service providers — from careers and practice opportunities to education, partnerships and professional services.
            </p>

            {/* Toggle */}
            <div className="mt-8 inline-flex rounded-full bg-slate-100 dark:bg-slate-800 p-1" data-testid="hero-mode-toggle">
              <button data-testid="hero-looking" onClick={() => setMode("looking")}
                className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${mode === "looking" ? "text-white" : "text-slate-600 dark:text-slate-300"}`}>
                {mode === "looking" && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-emerald-800" />}
                <span className="relative flex items-center gap-1"><Search className="h-4 w-4" /> I'M LOOKING FOR</span>
              </button>
              <button data-testid="hero-offering" onClick={() => setMode("offering")}
                className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${mode === "offering" ? "text-white" : "text-slate-600 dark:text-slate-300"}`}>
                {mode === "offering" && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-amber-600" />}
                <span className="relative flex items-center gap-1"><Briefcase className="h-4 w-4" /> I'M OFFERING</span>
              </button>
            </div>

            {/* Search bar */}
            <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm grid sm:grid-cols-[1fr_auto] gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input data-testid="hero-search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="What? e.g. Associate, RCT" className="rounded-xl border-slate-200" onKeyDown={(e) => e.key === "Enter" && runSearch()} />
                <Select value={speciality} onValueChange={setSpeciality}>
                  <SelectTrigger data-testid="hero-speciality" className="rounded-xl"><SelectValue placeholder="Speciality" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900">{SPECIALITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger data-testid="hero-city" className="rounded-xl"><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900">{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button data-testid="hero-search-btn" onClick={runSearch} className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white h-full px-6">
                <Search className="h-4 w-4 mr-1" /> Search
              </Button>
            </div>

            {/* Quick chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              {quick.map((c) => (
                <button key={c} data-testid={`quick-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  onClick={() => navigate(`/opportunities?mode=${mode}&category=${encodeURIComponent(c)}`)}
                  className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:border-emerald-600 hover:text-emerald-800 transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="mb-3 grid grid-cols-2 gap-3">
              <button data-testid="hero-register-seeker" onClick={() => navigate("/register?role=seeker")}
                className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 px-3 py-4 text-center hover:border-emerald-600 hover:shadow-md transition-all">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-emerald-800 text-white group-hover:scale-105 transition-transform"><Search className="h-5 w-5" /></span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">I am a Seeker</span>
                <span className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">Register &amp; find opportunities</span>
              </button>
              <button data-testid="hero-register-giver" onClick={() => navigate("/register?role=giver")}
                className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 px-3 py-4 text-center hover:border-amber-600 hover:shadow-md transition-all">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-amber-600 text-white group-hover:scale-105 transition-transform"><Briefcase className="h-5 w-5" /></span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">I am a Giver</span>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Register &amp; post opportunities</span>
              </button>
            </div>
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
              <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?crop=entropy&cs=srgb&fm=jpg&q=85&w=900" alt="Modern dental clinic" className="w-full h-[340px] object-cover" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-emerald-800 text-white"><BadgeCheck className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Verified professionals & clinics</p>
                  <p className="text-xs text-slate-500">BDS ✓ · MDS ✓ · Clinic ✓ · Institution ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-14">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Popular on the Hub</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Jump straight into what dental professionals search most.</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {POPULAR.map((p, i) => (
            <motion.button key={p.label} data-testid={`popular-${p.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              onClick={() => navigate(p.to)}
              className="group text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-emerald-600 hover:shadow-md transition-all">
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 group-hover:bg-emerald-800 group-hover:text-white transition-colors"><p.icon className="h-5 w-5" /></span>
              <p className="mt-4 font-semibold text-slate-900 dark:text-white flex items-center justify-between">{p.label}<ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 lg:px-8 py-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Latest Opportunities</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Sample listings shown for demonstration.</p>
            </div>
            <Button data-testid="view-all-opps" variant="ghost" onClick={() => navigate("/opportunities")} className="text-emerald-800 dark:text-emerald-400">View all <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((o, i) => <OpportunityCard key={o.id} opp={o} index={i} />)}
          </div>
        </section>
      )}

      {/* FOR DENTISTS / CLINICS */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-14 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-emerald-900 text-white p-8">
          <h3 className="font-heading text-2xl font-bold">Build Your Dental Career</h3>
          <p className="mt-2 text-emerald-100">For dentists, specialists & students.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FOR_DENTISTS.map((f) => (
              <button key={f} data-testid={`dentist-cta-${f.toLowerCase().replace(/[^a-z]+/g, "-")}`} onClick={() => navigate("/register")}
                className="text-left rounded-xl bg-emerald-800/60 hover:bg-emerald-700 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between">
                {f} <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-amber-600 text-white p-8">
          <h3 className="font-heading text-2xl font-bold">Find the Right Dental Professional</h3>
          <p className="mt-2 text-amber-50">For clinics, institutions & providers.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FOR_CLINICS.map((f) => (
              <button key={f} data-testid={`clinic-cta-${f.toLowerCase().replace(/[^a-z]+/g, "-")}`} onClick={() => navigate(f === "Find Dentists" || f === "Find Specialists" ? "/dentists" : "/post")}
                className="text-left rounded-xl bg-amber-500/70 hover:bg-amber-400 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between">
                {f} <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFICATION */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 pb-16">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-emerald-800" />
          <h2 className="mt-4 font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">A Trust Layer Built for Healthcare</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Verification badges reflect an actual completed check — never a mere document upload. Progress from mobile & email to credential, clinic and organisation verification.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {["Mobile Verified", "Email Verified", "Qualification Submitted", "Credential Verified", "Clinic Verified", "Organisation Verified"].map((l) => (
              <span key={l} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-1 text-sm font-medium"><BadgeCheck className="h-4 w-4" />{l}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
