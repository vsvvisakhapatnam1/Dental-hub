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
      className="group cursor-pointer relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg hover:border-[#1D70B8]/40 hover:-translate-y-1 transition-all"
    >
      {opp.featured && (
        <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-[#5C3A21] text-white text-[11px] font-bold px-3 py-0.5 shadow-xs">
          <Sparkles className="h-3 w-3 text-amber-300" /> Featured
        </span>
      )}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
            looking
              ? "bg-blue-50 text-[#1D70B8] border border-blue-200/60"
              : "bg-[#FBF8F5] text-[#5C3A21] border border-[#5C3A21]/20"
          }`}
        >
          {looking ? <Search className="h-3 w-3 text-[#1D70B8]" /> : <Briefcase className="h-3 w-3 text-[#5C3A21]" />}
          {looking ? "Looking" : "Offering"} · {opp.category}
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#1D70B8] transition-colors" />
      </div>
      <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white leading-snug group-hover:text-[#1D70B8] transition-colors">
        {opp.title}
      </h3>
      <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
        {opp.org_name || opp.poster_name}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-4 w-4 text-[#1D70B8]" />
          {opp.city}, {opp.state}
        </span>
        {opp.speciality && (
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="h-4 w-4 text-[#1D70B8]" />
            {opp.speciality}
          </span>
        )}
        {opp.employment_type && (
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-4 w-4 text-[#5C3A21]" />
            {opp.employment_type}
          </span>
        )}
      </div>

      {opp.compensation && opp.compensation !== "-" && (
        <div className="mt-3.5 inline-flex items-center gap-1 text-sm font-bold text-[#5C3A21] dark:text-amber-400">
          <IndianRupee className="h-4 w-4" />
          {opp.compensation}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
        <VerificationBadge status={opp.verification_status} testid={`opp-verify-${opp.id}`} />
        <Button
          size="sm"
          variant="ghost"
          data-testid={`opp-view-${opp.id}`}
          className="text-[#1D70B8] hover:bg-blue-50 font-semibold"
        >
          View Details
        </Button>
      </div>
    </motion.div>
  );
}
