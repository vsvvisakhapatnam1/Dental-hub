"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { VerificationBadge } from "@/components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, GraduationCap, IndianRupee, ArrowUpRight, Sparkles, Search } from "lucide-react";

export function OpportunityCard({ opp, index = 0 }) {
  const navigate = useNavigate();
  const looking = opp.mode === "looking";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      data-testid={`opportunity-card-${opp.id}`}
      onClick={() => navigate(`/opportunities/${opp.id}`)}
      className="group cursor-pointer relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-teal-600/5 hover:border-teal-400/60 hover:-translate-y-1 transition-all"
    >
      {opp.featured && (
        <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-600 to-sky-600 text-white text-[11px] font-bold px-3 py-0.5 shadow-xs">
          <Sparkles className="h-3 w-3 text-teal-100" /> Featured
        </span>
      )}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
            looking
              ? "bg-sky-50 text-sky-700 border border-sky-200/70"
              : "bg-teal-50 text-teal-700 border border-teal-200/70"
          }`}
        >
          {looking ? <Search className="h-3 w-3 text-sky-600" /> : <Briefcase className="h-3 w-3 text-teal-600" />}
          {looking ? "Looking" : "Offering"} · {opp.category}
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
      </div>
      <h3 className="font-heading font-bold text-lg text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
        {opp.title}
      </h3>
      <p className="mt-1 text-sm font-medium text-slate-500">
        {opp.org_name || opp.poster_name}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-4 w-4 text-teal-600" />
          {opp.city}{opp.state ? `, ${opp.state}` : ""}
        </span>
        {opp.speciality && (
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="h-4 w-4 text-sky-600" />
            {opp.speciality}
          </span>
        )}
        {opp.employment_type && (
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-4 w-4 text-teal-600" />
            {opp.employment_type}
          </span>
        )}
      </div>

      {opp.compensation && opp.compensation !== "-" && (
        <div className="mt-3.5 inline-flex items-center gap-1 rounded-lg bg-teal-50/70 px-2.5 py-1 text-sm font-bold text-teal-800">
          <IndianRupee className="h-4 w-4 text-teal-600" />
          {opp.compensation}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <VerificationBadge status={opp.verification_status} testid={`opp-verify-${opp.id}`} />
        <Button
          size="sm"
          variant="ghost"
          data-testid={`opp-view-${opp.id}`}
          className="text-teal-700 hover:bg-teal-50 hover:text-teal-800 font-semibold rounded-full"
        >
          View Details
        </Button>
      </div>
    </motion.div>
  );
}
