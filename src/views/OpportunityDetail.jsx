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
    if (!user) { toast.error("Please register to apply"); navigate("/register"); return; }
    setApplying(true);
    try {
      await api.post("/applications", { opportunity_id: id, message: msg });
      setApplied(true);
      toast.success("Application submitted to database!");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not apply");
    } finally { setApplying(false); }
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
  if (!opp) return <div className="min-h-[60vh] grid place-items-center text-slate-500">Opportunity not found. <Link to="/opportunities" className="text-teal-700 ml-1 font-semibold">Browse all</Link></div>;

  const looking = opp.mode === "looking";
  const waLink = opp.contact_method === "whatsapp" && opp.contact_value ? `https://wa.me/${opp.contact_value.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, I'm interested in your listing: " + opp.title)}` : null;
  const mailLink = opp.contact_value ? `mailto:${opp.contact_value}?subject=${encodeURIComponent("Enquiry: " + opp.title)}` : null;

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-10">
      <button data-testid="back-btn" onClick={() => navigate(-1)} className="text-sm text-slate-500 inline-flex items-center gap-1 mb-6 hover:text-teal-700 transition-colors"><ArrowLeft className="h-4 w-4" /> Back</button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${looking ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-teal-50 text-teal-700 border border-teal-200"}`}>{looking ? "Looking" : "Offering"} · {opp.category}</span>
          <h1 className="mt-3 font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">{opp.title}</h1>
          <p className="mt-2 text-lg text-slate-600">{opp.org_name || opp.poster_name}</p>
          <div className="mt-3"><VerificationBadge status={opp.verification_status} size="md" /></div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Info icon={MapPin} label="Location" value={`${opp.city}${opp.state ? ", " + opp.state : ""}`} />
            <Info icon={GraduationCap} label="Speciality" value={opp.speciality || "General"} />
            <Info icon={Award} label="Qualification" value={opp.qualification} />
            <Info icon={Clock} label="Experience" value={opp.experience} />
            <Info icon={Briefcase} label="Type" value={opp.employment_type} />
            <Info icon={IndianRupee} label="Compensation" value={opp.compensation} />
          </div>

          <Section icon={Briefcase} title="Overview">{opp.description || "No detailed description provided."}</Section>
          {opp.requirements && <Section icon={ListChecks} title="Requirements">{opp.requirements}</Section>}
          {opp.perks && <Section icon={Gift} title="Perks & Benefits">{opp.perks}</Section>}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-heading font-bold text-lg text-slate-900">Interested in this opportunity?</h3>
            <p className="mt-1 text-sm text-slate-500">Apply on platform or reach out directly.</p>

            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="apply-btn" disabled={applied} className="mt-4 w-full rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white">
                  {applied ? <><CheckCircle2 className="h-4 w-4 mr-1" /> Applied</> : <><Send className="h-4 w-4 mr-1" /> Apply Now</>}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader><DialogTitle>Apply / Express Interest</DialogTitle></DialogHeader>
                {applied ? (
                  <div className="py-6 text-center"><CheckCircle2 className="h-10 w-10 text-teal-600 mx-auto" /><p className="mt-2 font-semibold">Application submitted!</p></div>
                ) : (
                  <>
                    <Textarea data-testid="apply-message" value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} className="rounded-xl" placeholder="Add a short message (optional)…" />
                    <DialogFooter>
                      <Button data-testid="apply-submit" onClick={apply} disabled={applying} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
                        {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {waLink && <a href={waLink} target="_blank" rel="noreferrer"><Button data-testid="whatsapp-btn" variant="outline" className="mt-3 w-full rounded-xl border-slate-200 hover:border-teal-500"><MessageCircle className="h-4 w-4 mr-1 text-[#25D366]" /> WhatsApp</Button></a>}
            {mailLink && <a href={mailLink}><Button data-testid="email-btn" variant="outline" className="mt-3 w-full rounded-xl border-slate-200 hover:border-teal-500"><Mail className="h-4 w-4 mr-1 text-teal-600" /> Email</Button></a>}
            {opp.poster_id && <Button data-testid="view-poster" variant="ghost" onClick={() => navigate(`/profile/${opp.poster_id}`)} className="mt-3 w-full rounded-xl text-teal-700 hover:bg-teal-50">View Profile</Button>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  if (!value || value === "-") return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3">
      <span className="grid place-items-center h-9 w-9 rounded-lg bg-teal-50 text-teal-600"><Icon className="h-4 w-4" /></span>
      <div><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-medium text-slate-800">{value}</p></div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mt-8">
      <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2"><Icon className="h-5 w-5 text-teal-600" /> {title}</h3>
      <p className="mt-2 text-slate-600 leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}
