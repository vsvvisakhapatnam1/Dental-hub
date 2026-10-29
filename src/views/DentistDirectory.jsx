"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { subscribeToRealtime } from "@/lib/supabase";
import { VerificationBadge, topVerification } from "@/components/VerificationBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPECIALITIES, CITIES } from "@/lib/constants";
import { Search, Loader2, MapPin, GraduationCap, Frown, UserRound } from "lucide-react";

const ANY = "__any__";

export default function DentistDirectory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [city, setCity] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const p = {};
    if (q) p.q = q;
    if (speciality) p.speciality = speciality;
    if (city) p.city = city;
    try { const { data } = await api.get("/directory/dentists", { params: p }); setList(data); } catch { setList([]); }
    setLoading(false);
  }, [q, speciality, city]);

  useEffect(() => {
    fetchData();
    const unsub = subscribeToRealtime(() => fetchData());
    return unsub;
  }, [fetchData]);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">Dentist & Specialist Directory</h1>
      <p className="mt-2 text-slate-600">Discover verified dental professionals across India. Personal contact details are kept confidential.</p>

      <div className="mt-6 grid sm:grid-cols-[1fr_auto_auto] gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input data-testid="dentist-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, qualification, skill…" className="pl-10 rounded-xl h-11" />
        </div>
        <Select value={speciality || ANY} onValueChange={(v) => setSpeciality(v === ANY ? "" : v)}><SelectTrigger data-testid="dentist-speciality" className="rounded-xl h-11 min-w-[160px]"><SelectValue placeholder="Speciality" /></SelectTrigger><SelectContent className="bg-white max-h-64"><SelectItem value={ANY}>All specialities</SelectItem>{SPECIALITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        <Select value={city || ANY} onValueChange={(v) => setCity(v === ANY ? "" : v)}><SelectTrigger data-testid="dentist-city" className="rounded-xl h-11 min-w-[140px]"><SelectValue placeholder="City" /></SelectTrigger><SelectContent className="bg-white max-h-64"><SelectItem value={ANY}>All cities</SelectItem>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      </div>

      {loading ? (
        <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
      ) : list.length === 0 ? (
        <div className="min-h-[40vh] grid place-items-center text-center" data-testid="dentist-empty"><div><Frown className="h-10 w-10 mx-auto text-slate-300" /><p className="mt-3 text-slate-500">No dentists found.</p></div></div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
              data-testid={`dentist-card-${d.id}`} onClick={() => navigate(`/profile/${d.id}`)}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-xl hover:shadow-teal-600/5 hover:border-teal-400/60 hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-12 w-12 rounded-full bg-gradient-to-br from-teal-600 to-sky-600 text-white font-bold overflow-hidden shadow-xs">
                  {d.photo ? <img src={d.photo} alt={d.name} className="h-full w-full object-cover" /> : (d.name || "D").charAt(0)}
                </span>
                <div>
                  <p className="font-heading font-bold text-slate-900">{d.name}</p>
                  <p className="text-xs text-teal-700 font-medium">{d.profile_type} · {d.qualification}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                {d.speciality && <p className="inline-flex items-center gap-1.5 mr-4"><GraduationCap className="h-4 w-4 text-teal-600" /> {d.speciality}</p>}
                {d.city && <p className="inline-flex items-center gap-1.5 mr-4"><MapPin className="h-4 w-4 text-sky-600" /> {d.city}{d.state ? `, ${d.state}` : ""}</p>}
                {d.experience && <p className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4 text-teal-600" /> {d.experience}</p>}
              </div>
              <div className="mt-4"><VerificationBadge status={topVerification(d.verification)} /></div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
