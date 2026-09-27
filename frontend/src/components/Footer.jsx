import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-emerald-700 text-white"><Stethoscope className="h-5 w-5" /></span>
            <span className="font-heading font-extrabold text-lg text-white">Dental<span className="text-amber-500">Hub</span></span>
          </div>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">One Platform. Every Dental Opportunity. India's dental opportunity & professional services marketplace.</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/opportunities" className="hover:text-amber-400">Find Opportunities</Link></li>
            <li><Link to="/dentists" className="hover:text-amber-400">Dentist Directory</Link></li>
            <li><Link to="/clinics" className="hover:text-amber-400">Clinic Directory</Link></li>
            <li><Link to="/post" className="hover:text-amber-400">Post an Opportunity</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Categories</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/opportunities?category=Job" className="hover:text-amber-400">Jobs</Link></li>
            <li><Link to="/opportunities?category=Practice Partnership" className="hover:text-amber-400">Partnerships</Link></li>
            <li><Link to="/opportunities?category=Course" className="hover:text-amber-400">Education</Link></li>
            <li><Link to="/opportunities?category=Abroad Opportunity" className="hover:text-amber-400">Abroad</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-amber-400">About</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400">Contact</Link></li>
            <li><Link to="/register" className="hover:text-amber-400">Join the Community</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 px-4">
        © 2026 Dental Opportunity Hub · India-first · Sample/demo listings shown for demonstration. Not a patient healthcare service.
      </div>
    </footer>
  );
}
