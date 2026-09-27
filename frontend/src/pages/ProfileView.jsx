import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { VerificationBadge, topVerification } from "@/components/VerificationBadge";
import { VERIFICATION_LEVELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/OpportunityCard";
import {
  Loader2, MapPin, GraduationCap, Award, Clock, ArrowLeft, Building2, CheckCircle2, XCircle,
  Briefcase, Sparkles, Globe,
} from "lucide-react";

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [u, setU] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState([]);

  useEffect(() => {
    api.get(`/directory/user/${id}`).then(({ data }) => setU(data)).catch(() => setU(false)).finally(() => setLoading(false));
    api.get("/opportunities", { params: { limit: 100 } }).then(({ data }) => setOpps(data.filter((o) => o.poster_id === id))).catch(() => {});
  }, [id]);

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;
  if (!u) return <div className="min-h-[60vh] grid place-items-center text-slate-500">Profile not found.</div>;

  const isClinic = u.role === "giver";

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-10">
      <button data-testid="profile-back" onClick={() => navigate(-1)} className="text-sm text-slate-500 inline-flex items-center gap-1 mb-6"><ArrowLeft className="h-4 w-4" /> Back</button>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <span className={`grid place-items-center h-20 w-20 rounded-2xl text-white text-2xl font-bold overflow-hidden ${isClinic ? "bg-amber-600" : "bg-emerald-800"}`}>
            {u.photo ? <img src={u.photo} alt={u.name} className="h-full w-full object-cover" /> : isClinic ? <Building2 className="h-9 w-9" /> : (u.name || "U").charAt(0)}
          </span>
          <div className="flex-1">
            <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">{isClinic ? (u.org_name || u.name) : u.name}</h1>
            <p className="mt-1 text-slate-500">{u.profile_type} {u.qualification && `· ${u.qualification}`}</p>
            <div className="mt-3"><VerificationBadge status={topVerification(u.verification)} size="md" /></div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          {u.speciality && <Info icon={GraduationCap} label="Speciality" value={u.speciality} />}
          {u.city && <Info icon={MapPin} label="Location" value={`${u.city}, ${u.state || ""}`} />}
          {u.experience && <Info icon={Clock} label="Experience" value={u.experience} />}
          {u.availability && <Info icon={Award} label="Availability" value={u.availability} />}
          {u.preferred_type && <Info icon={Briefcase} label="Preferred Type" value={u.preferred_type} />}
          {u.website && <Info icon={Globe} label="Website" value={u.website} />}
          {u.established && <Info icon={Building2} label="Established" value={u.established} />}
          {u.chairs && u.chairs !== "0" && <Info icon={Sparkles} label="Dental Chairs" value={u.chairs} />}
        </div>

        {u.summary && (
          <div className="mt-6">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">About</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">{u.summary}</p>
          </div>
        )}

        {(u.skills?.length > 0 || u.specialities?.length > 0) && (
          <div className="mt-6">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">{isClinic ? "Specialities" : "Skills"}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(isClinic ? u.specialities : u.skills).map((s) => <span key={s} className="rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-sm">{s}</span>)}
            </div>
          </div>
        )}

        {u.facilities?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Facilities</h3>
            <div className="mt-2 flex flex-wrap gap-2">{u.facilities.map((s) => <span key={s} className="rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-sm">{s}</span>)}</div>
          </div>
        )}

        {(u.looking_for?.length > 0 || u.offering?.length > 0) && (
          <div className="mt-6">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">{isClinic ? "Offering" : "Looking For"}</h3>
            <div className="mt-2 flex flex-wrap gap-2">{(isClinic ? u.offering : u.looking_for).map((s) => <span key={s} className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700">{s}</span>)}</div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Verification Status</h3>
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            {VERIFICATION_LEVELS.map((v) => (
              <div key={v.key} className="flex items-center gap-2 text-sm">
                {u.verification?.[v.key] ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-slate-300" />}
                <span className={u.verification?.[v.key] ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {opps.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Active Listings</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">{opps.map((o, i) => <OpportunityCard key={o.id} opp={o} index={i} />)}</div>
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 flex items-center gap-3">
      <span className="grid place-items-center h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400"><Icon className="h-4 w-4" /></span>
      <div><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-medium text-slate-800 dark:text-slate-100 break-all">{value}</p></div>
    </div>
  );
}
