"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Briefcase, ArrowRight, ShieldCheck } from "lucide-react";
import { ToothIcon } from "@/components/ToothIcon";

export default function Join() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[85vh] bg-emerald-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="relative mx-auto max-w-4xl px-4 lg:px-8 py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
          <ToothIcon className="h-3.5 w-3.5" /> Dental Hub Pro
        </span>
        <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-extrabold">Join Dental Hub Pro</h1>
        <p className="mt-3 text-emerald-100 max-w-xl mx-auto">
          One platform. Every dental opportunity. Choose how you'd like to get started.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-5 text-left">
          <motion.button
            data-testid="join-seeker"
            whileHover={{ y: -4 }}
            onClick={() => navigate("/register?role=seeker")}
            className="group rounded-3xl bg-white text-slate-900 p-7 shadow-xl text-left"
          >
            <span className="grid place-items-center h-14 w-14 rounded-2xl bg-emerald-800 text-white"><Search className="h-7 w-7" /></span>
            <h2 className="mt-5 font-heading text-2xl font-extrabold">I'm a Seeker</h2>
            <p className="mt-2 text-sm text-slate-500">Find jobs, clinics, partners, courses, MDS & services. Build your profile and apply.</p>
            <span className="mt-4 inline-flex items-center gap-2 font-semibold text-emerald-800">Register as Seeker <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
          </motion.button>

          <motion.button
            data-testid="join-giver"
            whileHover={{ y: -4 }}
            onClick={() => navigate("/register?role=giver")}
            className="group rounded-3xl bg-white text-slate-900 p-7 shadow-xl text-left"
          >
            <span className="grid place-items-center h-14 w-14 rounded-2xl bg-amber-600 text-white"><Briefcase className="h-7 w-7" /></span>
            <h2 className="mt-5 font-heading text-2xl font-extrabold">I'm a Giver</h2>
            <p className="mt-2 text-sm text-slate-500">Post jobs, partnerships, clinic space, courses & services. Reach verified dental professionals.</p>
            <span className="mt-4 inline-flex items-center gap-2 font-semibold text-amber-700">Register as Giver <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
          </motion.button>
        </div>

        <p className="mt-8 inline-flex items-center gap-2 text-xs text-emerald-200">
          <ShieldCheck className="h-4 w-4" /> Your details are kept private and are only accessible to the Dental Hub Pro team.
        </p>
      </div>
    </div>
  );
}
