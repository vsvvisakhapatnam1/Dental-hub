"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { VerificationBadge, topVerification } from "@/components/VerificationBadge";
import { VERIFICATION_LEVELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search, Briefcase, Building2, HeartHandshake, GraduationCap, Globe2, Wrench, PlusCircle,
  Loader2, Users, CheckCircle2, XCircle, Trash2, FileText, MapPin, ArrowRight,
} from "lucide-react";

const SEEKER_ACTIONS = [
  { label: "Find Jobs", icon: Briefcase, to: "/opportunities?mode=offering&category=Job" },
  { label: "Find Clinics", icon: Building2, to: "/clinics" },
  { label: "Find Partners", icon: HeartHandshake, to: "/opportunities?category=Practice Partnership" },
  { label: "Find Courses", icon: GraduationCap, to: "/opportunities?category=Course" },
  { label: "Explore Abroad", icon: Globe2, to: "/opportunities?category=Abroad Opportunity" },
  { label: "Find Services", icon: Wrench, to: "/opportunities?category=Dental Service" },
];
const GIVER_ACTIONS = [
  { label: "Post Job", icon: PlusCircle, to: "/post" },
  { label: "Find Dentists", icon: Users, to: "/dentists" },
  { label: "Post Partnership", icon: HeartHandshake, to: "/post" },
  { label: "Post Clinic Opportunity", icon: Building2, to: "/post" },
  { label: "Offer Service", icon: Wrench, to: "/post" },
];

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const isGiver = user?.role === "giver";
  const [myOpps, setMyOpps] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [recos, setRecos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/my/opportunities").then((r) => setMyOpps(r.data)).catch(() => {}),
      api.get("/my/applications").then((r) => setMyApps(r.data)).catch(() => {}),
      api.get("/opportunities", { params: { mode: isGiver ? "looking" : "offering", limit: 4 } }).then((r) => setRecos(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [isGiver]);

  const completeness = (() => {
    const fields = isGiver
      ? ["org_name", "city", "state", "phone", "summary", "specialities"]
      : ["name", "city", "state", "phone", "qualification", "speciality", "experience", "summary"];
    const filled = fields.filter((k) => { const v = user?.[k]; return Array.isArray(v) ? v.length > 0 : !!v; }).length;
    return Math.round((filled / fields.length) * 100);
  })();

  const actions = isGiver ? GIVER_ACTIONS : SEEKER_ACTIONS;

  const del = async (id) => {
    try { await api.delete(`/opportunities/${id}`); setMyOpps((o) => o.filter((x) => x.id !== id)); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">Welcome, {user?.name} 👋</h1>
          <div className="mt-1 flex items-center gap-2"><VerificationBadge status={topVerification(user?.verification)} /><span className="text-sm text-slate-500">{isGiver ? "Giver" : "Seeker"} account</span></div>
        </div>
        <Button data-testid="dash-post" onClick={() => navigate("/post")} className="rounded-full bg-amber-600 hover:bg-amber-700 text-white"><PlusCircle className="h-4 w-4 mr-1" /> Post Opportunity</Button>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Profile Completeness</p>
          <div className="mt-3 flex items-center gap-3"><Progress value={completeness} className="h-2" /><span className="text-sm font-bold text-emerald-800">{completeness}%</span></div>
          <VerifyDialog user={user} onDone={refresh} />
        </div>
        <Stat label={isGiver ? "Active Listings" : "Applications Sent"} value={isGiver ? myOpps.length : myApps.length} icon={isGiver ? Briefcase : FileText} />
        <Stat label={isGiver ? "Total Applicants" : "Saved & Recommended"} value={isGiver ? myOpps.reduce((a, b) => a + (b.application_count || 0), 0) : recos.length} icon={Users} />
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">{isGiver ? "What do you want to do?" : "What are you looking for?"}</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((a) => (
            <button key={a.label} data-testid={`dash-action-${a.label.toLowerCase().replace(/[^a-z]+/g, "-")}`} onClick={() => navigate(a.to)}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-emerald-600 hover:shadow-md transition-all text-left">
              <a.icon className="h-5 w-5 text-emerald-800" /><p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">{a.label}</p>
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue={isGiver ? "listings" : "applications"} className="mt-10">
        <TabsList className="rounded-full bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="listings" data-testid="tab-listings" className="rounded-full">My Listings</TabsTrigger>
          <TabsTrigger value="applications" data-testid="tab-applications" className="rounded-full">{isGiver ? "Applicants" : "My Applications"}</TabsTrigger>
          <TabsTrigger value="recommended" data-testid="tab-recommended" className="rounded-full">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {myOpps.length === 0 ? <Empty text="You haven't posted any opportunities yet." cta="Post one now" onClick={() => navigate("/post")} /> : (
            <div className="space-y-3">
              {myOpps.map((o) => (
                <div key={o.id} data-testid={`my-opp-${o.id}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{o.title}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{o.city} · <span className={`font-medium ${o.status === "published" ? "text-emerald-700" : o.status === "pending" ? "text-amber-600" : "text-red-600"}`}>{o.status}</span> · {o.application_count || 0} applicants</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/opportunities/${o.id}`)} className="rounded-full">View</Button>
                    <Button size="sm" variant="ghost" data-testid={`del-opp-${o.id}`} onClick={() => del(o.id)} className="rounded-full text-red-600"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          {isGiver ? <GiverApplicants opps={myOpps} /> : (
            myApps.length === 0 ? <Empty text="You haven't applied to anything yet." cta="Browse opportunities" onClick={() => navigate("/opportunities")} /> : (
              <div className="space-y-3">{myApps.map((a) => (
                <div key={a.id} data-testid={`my-app-${a.id}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between">
                  <div><p className="font-semibold text-slate-900 dark:text-white">{a.opportunity_title}</p><p className="text-sm text-slate-500">Applied {new Date(a.created_at).toLocaleDateString()} · {a.status}</p></div>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/opportunities/${a.opportunity_id}`)} className="rounded-full">View <ArrowRight className="h-4 w-4 ml-1" /></Button>
                </div>
              ))}</div>
            )
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-6">
          {recos.length === 0 ? <Empty text="No recommendations yet." /> : (
            <div className="grid md:grid-cols-2 gap-4">{recos.map((o) => (
              <div key={o.id} onClick={() => navigate(`/opportunities/${o.id}`)} className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-md">
                <p className="text-xs font-semibold text-emerald-800">{o.category}</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{o.title}</p><p className="text-sm text-slate-500">{o.city}, {o.state}</p>
              </div>
            ))}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
      <span className="grid place-items-center h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400"><Icon className="h-6 w-6" /></span>
      <div><p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p><p className="text-sm text-slate-500">{label}</p></div>
    </div>
  );
}

function Empty({ text, cta, onClick }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
      <p className="text-slate-500">{text}</p>
      {cta && <Button onClick={onClick} variant="outline" className="mt-4 rounded-full">{cta}</Button>}
    </div>
  );
}

function GiverApplicants({ opps }) {
  const [apps, setApps] = useState({});
  useEffect(() => {
    opps.forEach((o) => {
      if ((o.application_count || 0) > 0) api.get(`/opportunities/${o.id}/applications`).then((r) => setApps((p) => ({ ...p, [o.id]: r.data }))).catch(() => {});
    });
  }, [opps]);
  const withApps = opps.filter((o) => (o.application_count || 0) > 0);
  if (withApps.length === 0) return <Empty text="No applicants yet." />;
  return (
    <div className="space-y-6">
      {withApps.map((o) => (
        <div key={o.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="font-semibold text-slate-900 dark:text-white">{o.title}</p>
          <div className="mt-3 space-y-2">
            {(apps[o.id] || []).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <div><p className="text-sm font-medium">{a.applicant_name}</p><p className="text-xs text-slate-500">{a.applicant_email} · {a.message || "No message"}</p></div>
                <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VerifyDialog({ user, onDone }) {
  const [busy, setBusy] = useState(false);
  const submit = async (level) => {
    setBusy(true);
    try { await api.put("/auth/profile", {}); toast.info("Verification workflow is a demo. Admin verifies documents in production."); }
    finally { setBusy(false); }
  };
  const done = Object.values(user?.verification || {}).filter(Boolean).length;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" data-testid="verify-wizard" className="mt-3 w-full rounded-xl text-emerald-800 text-sm">Verification ({done}/6) →</Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-slate-900">
        <DialogHeader><DialogTitle>Verification Status</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {VERIFICATION_LEVELS.map((v) => (
            <div key={v.key} className="flex items-center gap-2 text-sm">
              {user?.verification?.[v.key] ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-slate-300" />}
              <span className={user?.verification?.[v.key] ? "" : "text-slate-400"}>{v.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">Verification badges reflect an actual completed check by our admin team, not merely a document upload.</p>
      </DialogContent>
    </Dialog>
  );
}
