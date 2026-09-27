import { Link } from "react-router-dom";
import { Search, Briefcase, ShieldCheck, Users, Building2, GraduationCap, Globe2, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AUDIENCE = [
  "Dental Students", "BDS Dentists", "MDS Dentists", "Dental Specialists", "Dental Clinics",
  "Dental Institutions", "Training Providers", "Dental Service Providers", "Recruiters / Organisations", "Abroad Opportunity Providers",
];
const PILLARS = [
  { icon: Briefcase, t: "Careers & Jobs", d: "Associate, consultant, visiting and assistant roles across India." },
  { icon: Building2, t: "Practice & Clinics", d: "Clinic space, partnerships, collaborations and practice transfers." },
  { icon: GraduationCap, t: "Education", d: "MDS opportunities, fellowships, certifications and courses." },
  { icon: Globe2, t: "Abroad", d: "International dental opportunities — verify eligibility independently." },
  { icon: Wrench, t: "Services & Labs", d: "Dental labs, equipment and professional service providers." },
  { icon: Users, t: "Professional Network", d: "Discover and connect with dentists, clinics and organisations." },
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14">
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold"><ShieldCheck className="h-3.5 w-3.5" /> About the platform</span>
      <h1 className="mt-5 font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">Not just a job board.<br />A <span className="text-emerald-800">dental opportunity</span> <span className="text-amber-600">marketplace.</span></h1>
      <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 max-w-3xl">Dental Opportunity Hub is an India-first platform connecting the entire dental ecosystem through a simple idea: <strong>I'm Looking For</strong> ↔ <strong>I'm Offering</strong>. Dentists discover jobs, clinics, partners, education and services — while clinics and organisations find the right professionals.</p>

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PILLARS.map((p) => (
          <div key={p.t} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <span className="grid place-items-center h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400"><p.icon className="h-5 w-5" /></span>
            <h3 className="mt-4 font-heading font-bold text-lg text-slate-900 dark:text-white">{p.t}</h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-slate-900 text-white p-8">
        <h2 className="font-heading text-2xl font-bold">Who is it for?</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {AUDIENCE.map((a) => <span key={a} className="rounded-full bg-slate-800 px-3.5 py-1.5 text-sm">{a}</span>)}
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 p-8">
        <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-amber-700" /> A trust-first approach</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Verification badges reflect an actual completed check — from mobile & email to credential, clinic and organisation verification. We never mark a user "verified" merely because a document was uploaded. Listings shown today are sample/demo content for demonstration.</p>
      </div>

      <div className="mt-12 text-center">
        <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Ready to get started?</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/register"><Button className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-white">Join the community <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
          <Link to="/opportunities"><Button variant="outline" className="rounded-full"><Search className="h-4 w-4 mr-1" /> Browse opportunities</Button></Link>
        </div>
      </div>
    </div>
  );
}
