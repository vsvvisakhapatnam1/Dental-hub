"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Construction, Sparkles } from "lucide-react";

export default function ProductPage() {
  return (
    <div className="min-h-[78vh] w-full flex items-center justify-center px-4 py-12 sm:py-20 bg-gradient-to-b from-teal-50/30 via-white to-sky-50/30">
      <div className="w-full max-w-xl text-center">
        {/* Animated Badge Icon */}
        <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-600 to-sky-600 text-white shadow-xl shadow-teal-600/20 ring-8 ring-teal-50">
          <Construction className="h-10 w-10 sm:h-12 sm:w-12" />
        </div>

        {/* Main "Under Construction" Heading */}
        <h1
          data-testid="product-under-construction"
          className="mt-8 font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900"
        >
          Under Construction
        </h1>

        {/* Subtitle & Categories Preview */}
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
          Our verified dental marketplace for <span className="font-semibold text-teal-700">Dental Equipment</span>,{" "}
          <span className="font-semibold text-sky-700">Dental Materials</span>,{" "}
          <span className="font-semibold text-teal-700">Cosmetic</span>, and{" "}
          <span className="font-semibold text-sky-700">Drugs</span> is currently under active development.
        </p>

        {/* Category tags preview */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {["Dental Equipment", "Dental Materials", "Cosmetic", "Drugs"].map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-slate-50 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Back Link / Home Action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button
              variant="outline"
              className="rounded-full h-11 px-6 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-sm w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Home
            </Button>
          </Link>
          <Link to="/opportunities">
            <Button className="rounded-full h-11 px-6 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 w-full sm:w-auto">
              Browse Opportunities
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
