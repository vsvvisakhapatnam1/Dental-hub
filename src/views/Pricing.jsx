"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Loader2, Briefcase, Star, Rocket, ShieldCheck } from "lucide-react";

const ICONS = { job_listing: Briefcase, featured_listing: Star, recruitment_package: Rocket };
const FEATURES = {
  job_listing: ["1 verified listing", "Visible in search & category pages", "Applications to your dashboard"],
  featured_listing: ["Top of search results", "Highlighted card + badge", "7 days boosted visibility"],
  recruitment_package: ["Multiple listings", "Priority placement", "Candidate shortlisting support"],
};

export default function Pricing() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api.get("/payments/packages").then((r) => setPackages(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const buy = async (pkg) => {
    setBusyId(pkg.id);
    try {
      const res = await api.post("/payments/checkout", {
        package_id: pkg.id,
        origin_url: window.location.origin,
        user_id: user?.id || null,
      });
      window.location.href = res.data.checkout_url;
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not start checkout");
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-emerald-900 text-white">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"><ShieldCheck className="h-3.5 w-3.5" /> Secure payments by Stripe</span>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-extrabold">Plans for Clinics & Organisations</h1>
          <p className="mt-3 text-emerald-100 max-w-2xl mx-auto">Post opportunities, feature your listings and hire faster. Dentists & students always browse and apply for free.</p>
          <p className="mt-2 text-xs text-emerald-200/80">Demo pricing in USD · Test mode — use card 4242 4242 4242 4242</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 lg:px-8 py-14">
        {loading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg, i) => {
              const Icon = ICONS[pkg.id] || Briefcase;
              const highlight = pkg.id === "featured_listing";
              return (
                <motion.div
                  key={pkg.id}
                  data-testid={`pricing-card-${pkg.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-3xl border p-7 flex flex-col ${highlight ? "border-amber-400 ring-2 ring-amber-300 bg-amber-50/40 dark:bg-amber-950/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"}`}
                >
                  {highlight && <span className="self-start mb-3 rounded-full bg-amber-500 text-white text-xs font-bold px-3 py-1">Most Popular</span>}
                  <span className={`grid place-items-center h-12 w-12 rounded-2xl text-white ${highlight ? "bg-amber-600" : "bg-emerald-800"}`}><Icon className="h-6 w-6" /></span>
                  <h3 className="mt-4 font-heading text-xl font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{pkg.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${pkg.amount.toFixed(2)}</span>
                    <span className="text-sm text-slate-400">one-time</span>
                  </div>
                  <ul className="mt-5 space-y-2 flex-1">
                    {(FEATURES[pkg.id] || []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <Button
                    data-testid={`pricing-buy-${pkg.id}`}
                    onClick={() => buy(pkg)}
                    disabled={busyId === pkg.id}
                    className={`mt-6 rounded-full ${highlight ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-800 hover:bg-emerald-900"} text-white`}
                  >
                    {busyId === pkg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy Now"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
