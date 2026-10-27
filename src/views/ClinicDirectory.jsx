"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { VerificationBadge, topVerification } from "@/components/VerificationBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES } from "@/lib/constants";
import { Search, Loader2, MapPin, Building2, Frown, Stethoscope } from "lucide-react";

const ANY = "__any__";

export default function ClinicDirectory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const p = {};
    if (q) p.q = q;
    if (city) p.city = city;
    try { const { data } = await api.get("/directory/clinics", { params: p }); setList(data); } catch { setList([]); }
    setLoading(false);
  }, [q, city]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Clinic & Organisation Directory</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Discover clinics, institutions, labs and dental service providers.</p>

      <div className="mt-6 grid sm:grid-cols-[1fr_auto] gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input data-testid="clinic-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Clinic / organisation name…" className="pl-10 rounded-xl h-11" />
        </div>
        <Select value={city || ANY} onValueChange={(v) => setCity(v === ANY ? "" : v)}><SelectTrigger data-testid="clinic-city" className="rounded-xl h-11 min-w-[160px]"><SelectValue placeholder="City" /></SelectTrigger><SelectContent className="bg-white dark:bg-slate-900 max-h-64"><SelectItem value={ANY}>All cities</SelectItem>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      </div>

      {loading ? (
        <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>
      ) : list.length === 0 ? (
        <div className="min-h-[40vh] grid place-items-center text-center" data-testid="clinic-empty"><div><Frown className="h-10 w-10 mx-auto text-slate-300" /><p className="mt-3 text-slate-500">No clinics found.</p></div></div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
              data-testid={`clinic-card-${c.id}`} onClick={() => navigate(`/profile/${c.id}`)}
              className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-12 w-12 rounded-xl bg-amber-100 text-amber-700"><Building2 className="h-6 w-6" /></span>
                <div>
                  <p className="font-heading font-semibold text-slate-900 dark:text-white">{c.org_name || c.name}</p>
                  <p className="text-xs text-slate-500">{c.profile_type || "Clinic"}</p>
                </div>
              </div>
              {c.city && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-emerald-700" /> {c.city}, {c.state}</p>}
              {c.specialities?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.specialities.slice(0, 3).map((s) => <span key={s} className="rounded-full bg-emerald-50 text-emerald-800 px-2 py-0.5 text-xs inline-flex items-center gap-1"><Stethoscope className="h-3 w-3" />{s}</span>)}
                </div>
              )}
              <div className="mt-4"><VerificationBadge status={topVerification(c.verification)} /></div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
