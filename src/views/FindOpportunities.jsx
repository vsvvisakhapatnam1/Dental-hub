"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { subscribeToRealtime } from "@/lib/supabase";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ALL_CATEGORIES, SPECIALITIES, CITIES, STATES, EXPERIENCE_LEVELS, EMPLOYMENT_TYPES } from "@/lib/constants";
import { Search, SlidersHorizontal, Loader2, X, Frown } from "lucide-react";

const ANY = "__any__";

export default function FindOpportunities() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState([]);

  const [mode, setMode] = useState(params.get("mode") || "");
  const [q, setQ] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [speciality, setSpeciality] = useState(params.get("speciality") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [state, setState] = useState(params.get("state") || "");
  const [experience, setExperience] = useState("");
  const [employment, setEmployment] = useState("");
  const [verified, setVerified] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const p = {};
    if (mode) p.mode = mode;
    if (q) p.q = q;
    if (category) p.category = category;
    if (speciality) p.speciality = speciality;
    if (city) p.city = city;
    if (state) p.state = state;
    if (experience) p.experience = experience;
    if (employment) p.employment_type = employment;
    if (verified) p.verified = true;
    try {
      const { data } = await api.get("/opportunities", { params: p });
      setOpps(data);
    } catch { setOpps([]); }
    setLoading(false);
  }, [mode, q, category, speciality, city, state, experience, employment, verified]);

  useEffect(() => {
    fetchData();
    const unsub = subscribeToRealtime(() => fetchData());
    return unsub;
  }, [fetchData]);

  const applyQuery = () => {
    const np = new URLSearchParams();
    if (mode) np.set("mode", mode);
    if (q) np.set("q", q);
    if (category) np.set("category", category);
    if (speciality) np.set("speciality", speciality);
    if (city) np.set("city", city);
    setParams(np);
  };

  const reset = () => {
    setMode(""); setQ(""); setCategory(""); setSpeciality(""); setCity(""); setState(""); setExperience(""); setEmployment(""); setVerified(false);
    setParams(new URLSearchParams());
  };

  const Filters = () => (
    <div className="space-y-5" data-testid="filters-panel">
      <FilterSelect label="Mode" value={mode} onChange={setMode} options={[{ v: "looking", l: "Looking For" }, { v: "offering", l: "Offering" }]} raw testid="filter-mode" />
      <FilterSelect label="Category" value={category} onChange={setCategory} options={ALL_CATEGORIES} testid="filter-category" />
      <FilterSelect label="Speciality" value={speciality} onChange={setSpeciality} options={SPECIALITIES} testid="filter-speciality" />
      <FilterSelect label="City" value={city} onChange={setCity} options={CITIES} testid="filter-city" />
      <FilterSelect label="State" value={state} onChange={setState} options={STATES} testid="filter-state" />
      <FilterSelect label="Experience" value={experience} onChange={setExperience} options={EXPERIENCE_LEVELS} testid="filter-experience" />
      <FilterSelect label="Employment Type" value={employment} onChange={setEmployment} options={EMPLOYMENT_TYPES} testid="filter-employment" />
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <Checkbox data-testid="filter-verified" checked={verified} onCheckedChange={(v) => setVerified(!!v)} /> Verified only
      </label>
      <Button variant="ghost" data-testid="filter-reset" onClick={reset} className="w-full rounded-xl text-slate-500"><X className="h-4 w-4 mr-1" /> Reset filters</Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Find Dental Opportunities</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Search across jobs, partnerships, clinic space, education, abroad and services.</p>

      <div className="mt-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input data-testid="search-input" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyQuery()} placeholder="Search title, clinic, speciality…" className="pl-10 rounded-xl h-11" />
        </div>
        <Button data-testid="search-btn" onClick={applyQuery} className="rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white h-11 px-6 font-semibold shadow-xs">Search</Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" data-testid="mobile-filters-btn" className="lg:hidden rounded-xl h-11"><SlidersHorizontal className="h-4 w-4" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-white dark:bg-slate-900 overflow-y-auto">
            <h3 className="font-heading font-bold text-lg mt-4 mb-4">Filters</h3>
            <Filters />
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-8 grid lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-teal-600" /> Filters</h3>
            <Filters />
          </div>
        </aside>

        <div className="lg:col-span-9">
          {loading ? (
            <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
          ) : opps.length === 0 ? (
            <div className="min-h-[40vh] grid place-items-center text-center" data-testid="empty-state">
              <div>
                <Frown className="h-10 w-10 mx-auto text-slate-300" />
                <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">No opportunities found</p>
                <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                <Button onClick={reset} variant="outline" className="mt-4 rounded-full">Clear filters</Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4" data-testid="results-count">{opps.length} opportunit{opps.length === 1 ? "y" : "ies"} found</p>
              <div className="grid md:grid-cols-2 gap-6">
                {opps.map((o, i) => <OpportunityCard key={o.id} opp={o} index={i} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, raw, testid }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs uppercase tracking-wide text-slate-500">{label}</Label>
      <Select value={value || ANY} onValueChange={(v) => onChange(v === ANY ? "" : v)}>
        <SelectTrigger data-testid={testid} className="rounded-xl"><SelectValue placeholder="Any" /></SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-900 max-h-64">
          <SelectItem value={ANY}>Any</SelectItem>
          {options.map((o) => raw ? <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem> : <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
