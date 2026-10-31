"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { subscribeToRealtime } from "@/lib/supabase";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPECIALITIES, CITIES } from "@/lib/constants";
import {
  Search, Briefcase, Building2, Users, GraduationCap, Globe2, Wrench, PlusCircle,
  ArrowRight, ShieldCheck, HeartHandshake, BadgeCheck, Stethoscope, Activity, UserPlus,
} from "lucide-react";

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

  const fetchLatest = useCallback(() => {
    api.get("/opportunities", { params: { limit: 6 } }).then(({ data }) => {
      const sorted = [...data].sort((a, b) => (b.featured === true) - (a.featured === true));
      setFeatured(sorted.slice(0, 6));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchLatest();
    const unsubscribe = subscribeToRealtime(() => {
      fetchLatest();
    });
    return unsubscribe;
  }, [fetchLatest]);

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
    <div className="bg-white text-slate-900 min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden dental-grid-bg border-b border-teal-100/80">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/40 via-white/90 to-white pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8 pt-10 pb-14 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 px-3.5 py-1 text-xs font-bold tracking-wide uppercase">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" /> India's Clinical Dental Opportunity Network
            </span>
            <h1 className="mt-5 font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.14] text-slate-900">
              One Platform.<br />
              <span className="text-teal-600">Every Dental</span>{" "}
              <span className="text-sky-600">Opportunity.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Connecting dentists, specialists, clinics, hospitals and healthcare providers — from career openings and operatory chair sharing to fellowships, partnerships, and turnkey clinic setups.
            </p>

            {/* Toggle: Clinical Teal for Looking, Doctor Sky Blue for Offering */}
            <div className="mt-8 inline-flex rounded-full bg-slate-100 p-1 border border-slate-200 shadow-inner" data-testid="hero-mode-toggle">
              <button
                data-testid="hero-looking"
                onClick={() => setMode("looking")}
                className={`relative rounded-full px-5 py-2.5 text-sm font-bold transition-all ${mode === "looking" ? "text-white" : "text-slate-600"}`}
              >
                {mode === "looking" && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-teal-600 shadow-md" />}
                <span className="relative flex items-center gap-1.5"><Search className="h-4 w-4" /> I'M LOOKING FOR</span>
              </button>
              <button
                data-testid="hero-offering"
                onClick={() => setMode("offering")}
                className={`relative rounded-full px-5 py-2.5 text-sm font-bold transition-all ${mode === "offering" ? "text-white" : "text-slate-600"}`}
              >
                {mode === "offering" && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-sky-600 shadow-md" />}
                <span className="relative flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> I'M OFFERING</span>
              </button>
            </div>

            {/* Search bar */}
            <div className="mt-5 rounded-2xl border border-teal-100 bg-white p-3 shadow-lg shadow-teal-900/5 grid sm:grid-cols-[1fr_auto] gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  data-testid="hero-search-input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="What? e.g. Associate, RCT"
                  className="rounded-xl border-slate-200 focus-visible:ring-teal-600"
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                />
                <Select value={speciality} onValueChange={setSpeciality}>
                  <SelectTrigger data-testid="hero-speciality" className="rounded-xl border-slate-200"><SelectValue placeholder="Speciality" /></SelectTrigger>
                  <SelectContent className="bg-white">{SPECIALITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger data-testid="hero-city" className="rounded-xl border-slate-200"><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent className="bg-white">{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button
                data-testid="hero-search-btn"
                onClick={runSearch}
                className="rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white h-full px-6 font-semibold shadow-sm transition-all"
              >
                <Search className="h-4 w-4 mr-1.5" /> Search
              </Button>
            </div>

            {/* Quick chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              {quick.map((c) => (
                <button
                  key={c}
                  data-testid={`quick-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  onClick={() => navigate(`/opportunities?mode=${mode}&category=${encodeURIComponent(c)}`)}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/60 transition-colors shadow-2xs"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            {/* Centered Register Button above Seeker and Giver boxes */}
            <div className="mb-3 flex justify-center">
              <Button
                data-testid="hero-register-btn"
                onClick={() => navigate("/register")}
                className="rounded-full px-8 h-10 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" /> Register
              </Button>
            </div>

            <div className="mb-3.5 grid grid-cols-2 gap-3">
              <button
                data-testid="hero-register-seeker"
                onClick={() => navigate("/register?role=seeker")}
                className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-teal-200 bg-teal-50/50 px-3.5 py-4 text-center hover:border-teal-600 hover:bg-teal-50 hover:shadow-md transition-all"
              >
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-teal-600 text-white group-hover:scale-105 transition-transform shadow-xs"><Stethoscope className="h-5 w-5" /></span>
                <span className="text-sm font-bold text-slate-900">I am a Dentist / Seeker</span>
                <span className="text-xs text-teal-700 font-semibold">Register &amp; find opportunities</span>
              </button>
              <button
                data-testid="hero-register-giver"
                onClick={() => navigate("/register?role=giver")}
                className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-sky-200 bg-sky-50/50 px-3.5 py-4 text-center hover:border-sky-600 hover:bg-sky-50 hover:shadow-md transition-all"
              >
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-sky-600 text-white group-hover:scale-105 transition-transform shadow-xs"><Building2 className="h-5 w-5" /></span>
                <span className="text-sm font-bold text-slate-900">I am a Clinic / Giver</span>
                <span className="text-xs text-sky-700 font-semibold">Register &amp; post opportunities</span>
              </button>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-teal-100 shadow-xl bg-slate-50">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"
                alt="Modern dental clinic"
                className="w-full h-[330px] object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 backdrop-blur-md p-4 flex items-center gap-3.5 shadow-lg border border-teal-100">
                <span className="grid place-items-center h-11 w-11 rounded-xl bg-teal-600 text-white shrink-0 shadow-xs"><BadgeCheck className="h-6 w-6" /></span>
                <div>
                  <p className="text-sm font-bold text-slate-900">Verified Doctors, Specialists & Clinics</p>
                  <p className="text-xs text-teal-700 font-medium">BDS ✓ · MDS ✓ · DCI Verified ✓ · ISO Clinic ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-14">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Popular Clinical Categories
        </h2>
        <p className="mt-2 text-slate-600">Jump straight into what doctors and dental practices search most.</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {POPULAR.map((p, i) => (
            <motion.button
              key={p.label}
              data-testid={`popular-${p.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(p.to)}
              className="group text-left rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-600/5 transition-all"
            >
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-2xs">
                <p.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-bold text-sm text-slate-900 flex items-center justify-between">
                {p.label}
                <ArrowRight className="h-4 w-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* FEATURED / REALTIME OPPORTUNITIES */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 lg:px-8 py-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
                <Activity className="h-3.5 w-3.5 text-teal-600" /> Live Database Feed
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Latest Verified Opportunities
              </h2>
              <p className="mt-1 text-slate-600">Synced in real time with the Dental Hub Pro clinical directory.</p>
            </div>
            <Button
              data-testid="view-all-opps"
              variant="ghost"
              onClick={() => navigate("/opportunities")}
              className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 font-semibold rounded-full"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((o, i) => <OpportunityCard key={o.id} opp={o} index={i} />)}
          </div>
        </section>
      )}

      {/* FOR DENTISTS / CLINICS — Clean Clinical Teal & Doctor Sky Blue Cards */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-14 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 text-white p-8 shadow-xl shadow-teal-600/15">
          <h3 className="font-heading text-2xl font-extrabold">Advance Your Clinical Career</h3>
          <p className="mt-2 text-teal-100">For BDS, MDS specialists, residents & students.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FOR_DENTISTS.map((f) => (
              <button
                key={f}
                data-testid={`dentist-cta-${f.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                onClick={() => navigate("/register?role=seeker")}
                className="text-left rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-between backdrop-blur-xs"
              >
                {f} <ArrowRight className="h-4 w-4 text-teal-100" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-sky-700 text-white p-8 shadow-xl shadow-sky-600/15">
          <h3 className="font-heading text-2xl font-extrabold">Hire Verified Dental Specialists</h3>
          <p className="mt-2 text-sky-100">For dental clinics, hospitals, colleges & labs.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FOR_CLINICS.map((f) => (
              <button
                key={f}
                data-testid={`clinic-cta-${f.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                onClick={() => navigate(f === "Find Dentists" || f === "Find Specialists" ? "/dentists" : "/post")}
                className="text-left rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-between backdrop-blur-xs"
              >
                {f} <ArrowRight className="h-4 w-4 text-sky-100" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFICATION */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 pb-16">
        <div className="rounded-3xl border border-teal-100 bg-gradient-to-b from-teal-50/40 to-white p-8 text-center shadow-sm">
          <span className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 mb-3">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            A Trust Layer Built for Modern Dentistry
          </h2>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            Every practitioner and dental institution progresses through multi-tier verification — from mobile and email to State Dental Council credentials and clinic registration.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {["Mobile Verified", "Email Verified", "Qualification Submitted", "Credential Verified", "Clinic Verified", "Organisation Verified"].map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white text-teal-700 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
              >
                <BadgeCheck className="h-4 w-4 text-teal-600" />
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
