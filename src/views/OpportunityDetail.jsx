"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { VerificationBadge } from "@/components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MapPin, Briefcase, GraduationCap, IndianRupee, Clock, ArrowLeft, Loader2, CheckCircle2,
  MessageCircle, Mail, Send, Award, ListChecks, Gift,
} from "lucide-react";

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    api.get(`/opportunities/${id}`).then(({ data }) => setOpp(data)).catch(() => setOpp(false)).finally(() => setLoading(false));
  }, [id]);

  const apply = async () => {
    if (!user) { toast.error("Please log in to apply"); navigate("/login"); return; }
    setApplying(true);
    try {
      await api.post("/applications", { opportunity_id: id, message: msg });
      setApplied(true);
      toast.success("Application submitted!");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not apply");
    } finally { setApplying(false); }
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;
  if (!opp) return <div className="min-h-[60vh] grid place-items-center text-slate-500">Opportunity not found. <Link to="/opportunities" className="text-emerald-800 ml-1">Browse all</Link></div>;

  const looking = opp.mode === "looking";
  const waLink = opp.contact_method === "whatsapp" && opp.contact_value ? `https://wa.me/${opp.contact_value.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, I'm interested in your listing: " + opp.title)}` : null;
  const mailLink = opp.contact_value ? `mailto:${opp.contact_value}?subject=${encodeURIComponent("Enquiry: " + opp.title)}` : null;

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-10">
      <button data-testid="back-btn" onClick={() => navigate(-1)} className="text-sm text-slate-500 inline-flex items-center gap-1 mb-6"><ArrowLeft className="h-4 w-4" /> Back</button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${looking ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-800"}`}>{looking ? "Looking" : "Offering"} · {opp.category}</span>
          <h1 className="mt-3 font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{opp.title}</h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">{opp.org_name || opp.poster_name}</p>
          <div className="mt-3"><VerificationBadge status={opp.verification_status} size="md" /></div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <Info icon={MapPin} label="Location" value={`${opp.city || "-"}, ${opp.state || ""}`} />
            <Info icon={GraduationCap} label="Speciality" value={opp.speciality} />
            <Info icon={Award} label="Qualification" value={opp.qualification} />
            <Info icon={Clock} label="Experience" value={opp.experience} />
            <Info icon={Briefcase} label="Employment Type" value={opp.employment_type} />
            <Info icon={IndianRupee} label="Compensation" value={opp.compensation} />
          </div>

          {opp.description && <Section icon={ListChecks} title="Description">{opp.description}</Section>}
          {opp.requirements && <Section icon={ListChecks} title="Requirements">{opp.requirements}</Section>}
          {opp.perks && <Section icon={Gift} title="Perks">{opp.perks}</Section>}
          <p className="mt-8 text-xs text-slate-400">Posted {new Date(opp.created_at).toLocaleDateString()} {opp.is_demo && "· Sample/demo listing"}</p>
        </div>

        <aside>
          <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <p className="font-heading font-bold text-lg text-slate-900 dark:text-white">Interested?</p>
            <p className="text-sm text-slate-500 mt-1">Apply in-app or reach out directly.</p>

            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="apply-btn" disabled={applied} className="mt-4 w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white">
                  {applied ? <><CheckCircle2 className="h-4 w-4 mr-1" /> Applied</> : <><Send className="h-4 w-4 mr-1" /> Apply Now</>}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-slate-900">
                <DialogHeader><DialogTitle>Apply / Express Interest</DialogTitle></DialogHeader>
                {applied ? (
                  <div className="py-6 text-center"><CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" /><p className="mt-2 font-semibold">Application submitted!</p></div>
                ) : (
                  <>
                    <Textarea data-testid="apply-message" value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} className="rounded-xl" placeholder="Add a short message (optional)…" />
                    <DialogFooter>
                      <Button data-testid="apply-submit" onClick={apply} disabled={applying} className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white">
                        {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {waLink && <a href={waLink} target="_blank" rel="noreferrer"><Button data-testid="whatsapp-btn" variant="outline" className="mt-3 w-full rounded-xl"><MessageCircle className="h-4 w-4 mr-1" /> WhatsApp</Button></a>}
            {mailLink && <a href={mailLink}><Button data-testid="email-btn" variant="outline" className="mt-3 w-full rounded-xl"><Mail className="h-4 w-4 mr-1" /> Email</Button></a>}
            {opp.poster_id && <Button data-testid="view-poster" variant="ghost" onClick={() => navigate(`/profile/${opp.poster_id}`)} className="mt-3 w-full rounded-xl text-emerald-800">View Profile</Button>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  if (!value || value === "-") return null;
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 flex items-center gap-3">
      <span className="grid place-items-center h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400"><Icon className="h-4 w-4" /></span>
      <div><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-medium text-slate-800 dark:text-slate-100">{value}</p></div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mt-8">
      <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"><Icon className="h-5 w-5 text-emerald-700" /> {title}</h3>
      <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}
