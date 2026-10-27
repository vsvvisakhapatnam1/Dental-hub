"use client";

import { motion } from "framer-motion";
import { Crown, Users, Briefcase, Building2, Mail, Phone } from "lucide-react";
import { ToothIcon } from "@/components/ToothIcon";

const SECTIONS = [
  {
    key: "md",
    title: "Managing Director",
    icon: Crown,
    accent: "amber",
    blurb: "Vision & leadership of Dental Hub Pro.",
    slots: 1,
  },
  {
    key: "directors",
    title: "Board of Directors",
    icon: Building2,
    accent: "emerald",
    blurb: "Guiding strategy, partnerships and growth.",
    slots: 3,
  },
  {
    key: "employees",
    title: "Our Team & Employees",
    icon: Users,
    accent: "emerald",
    blurb: "The people who make the platform work every day.",
    slots: 6,
  },
];

export default function Team() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative mx-auto max-w-5xl px-4 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            <ToothIcon className="h-3.5 w-3.5" /> Dental Hub Pro
          </span>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-extrabold">Meet Our Team</h1>
          <p className="mt-3 text-emerald-100 max-w-2xl mx-auto text-base">
            The directors, managing director and employees behind Dental Hub Pro.
            Detailed profiles are being prepared — <span className="font-semibold text-white">we'll update this soon.</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 lg:px-8 py-14 space-y-14">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const amber = sec.accent === "amber";
          return (
            <div key={sec.key} data-testid={`team-section-${sec.key}`}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`grid place-items-center h-11 w-11 rounded-xl text-white ${amber ? "bg-amber-600" : "bg-emerald-800"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">{sec.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{sec.blurb}</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: sec.slots }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center"
                  >
                    <div className={`mx-auto h-20 w-20 rounded-full grid place-items-center ${amber ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-700"} dark:bg-slate-800`}>
                      {amber ? <Crown className="h-8 w-8" /> : <Briefcase className="h-8 w-8" />}
                    </div>
                    <p className="mt-4 font-semibold text-slate-800 dark:text-slate-100">Profile coming soon</p>
                    <p className="text-xs text-slate-400 mt-1">Name & role to be updated</p>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-900 text-white p-8 sm:p-10 text-center">
          <h3 className="font-heading text-2xl font-bold">Want to join the Dental Hub Pro team?</h3>
          <p className="mt-2 text-emerald-100">Reach out and we'll get back to you.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
            <a href="mailto:info@dentalhubpro.com" className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors"><Mail className="h-4 w-4" /> info@dentalhubpro.com</a>
            <a href="tel:+918951950389" className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors"><Phone className="h-4 w-4" /> +91-89519 50389</a>
          </div>
        </div>
      </section>
    </div>
  );
}
