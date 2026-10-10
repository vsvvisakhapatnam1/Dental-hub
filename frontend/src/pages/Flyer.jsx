import { useEffect } from "react";
import { Printer, Search, Briefcase, Mail, Phone, CheckCircle2 } from "lucide-react";
import { ToothIcon } from "@/components/ToothIcon";

const QR_SRC = `${process.env.REACT_APP_BACKEND_URL}/api/qr/join`;

export default function Flyer() {
  useEffect(() => { document.title = "Dental Hub Pro — Join Flyer"; }, []);
  const joinUrl = `${window.location.origin}/join`;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4">
      <div className="no-print max-w-[800px] mx-auto mb-5 flex justify-end">
        <button
          data-testid="flyer-print"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 font-semibold"
        >
          <Printer className="h-5 w-5" /> Print / Save as PDF
        </button>
      </div>

      <div className="print-flyer mx-auto w-[800px] max-w-full bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-10 py-8 text-center relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative flex items-center justify-center gap-3">
            <span className="grid place-items-center h-12 w-12 rounded-xl bg-white/15"><ToothIcon className="h-7 w-7" /></span>
            <span className="font-heading text-3xl font-extrabold">Dental Hub <span className="text-amber-400">Pro</span></span>
          </div>
          <p className="relative mt-2 text-emerald-100 text-sm tracking-wide">ONE PLATFORM. EVERY DENTAL OPPORTUNITY.</p>
        </div>

        {/* Body */}
        <div className="px-10 py-9 text-center">
          <h1 className="font-heading text-4xl font-extrabold leading-tight">Scan to Join India's<br />Dental Opportunity Marketplace</h1>
          <p className="mt-3 text-slate-500">Jobs · Clinics · Partnerships · MDS & Courses · Services · Abroad</p>

          <div className="mt-7 flex items-center justify-center">
            <div className="rounded-2xl border-4 border-emerald-800 p-3 bg-white">
              <img src={QR_SRC} alt="Scan to join" className="h-56 w-56" />
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-emerald-800 break-all">{joinUrl}</p>

          {/* Two audiences */}
          <div className="mt-8 grid grid-cols-2 gap-5 text-left">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-emerald-800 text-white"><Search className="h-5 w-5" /></span>
                <span className="font-heading text-lg font-bold">For Dentists & Students</span>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" /> Find jobs & associate roles</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" /> Practice partners & clinic space</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" /> MDS, courses & abroad options</li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-amber-600 text-white"><Briefcase className="h-5 w-5" /></span>
                <span className="font-heading text-lg font-bold">For Clinics & Institutions</span>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" /> Hire dentists & specialists</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" /> Post partnerships & services</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" /> Reach verified professionals</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 text-white px-10 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-amber-400" /> info@dentalhubpro.com</span>
          <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-amber-400" /> +91-89519 50389</span>
        </div>
      </div>
    </div>
  );
}
