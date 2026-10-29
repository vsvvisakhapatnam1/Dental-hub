"use client";

import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-teal-100 bg-gradient-to-b from-white via-teal-50/30 to-sky-50/40 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Dental Hub Pro" className="h-16 w-auto object-contain" />
          </Link>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            One Platform. Every Dental Opportunity. India's specialized dental careers, clinic setups, and verified healthcare network.
          </p>
          <div className="mt-4 space-y-1.5 text-xs text-slate-500">
            <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-teal-600" /> +91-89519 50389</p>
            <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-teal-600" /> info@dentalhubpro.com</p>
            <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-teal-600" /> Pan-India Healthcare Network</p>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-teal-700 font-bold mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm font-medium">
            <li><Link to="/opportunities" className="text-slate-600 hover:text-teal-700 transition-colors">Find Opportunities</Link></li>
            <li><Link to="/dentists" className="text-slate-600 hover:text-teal-700 transition-colors">Dentist Directory</Link></li>
            <li><Link to="/clinics" className="text-slate-600 hover:text-teal-700 transition-colors">Clinic Directory</Link></li>
            <li><Link to="/post" className="text-slate-600 hover:text-teal-700 transition-colors">Post an Opportunity</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-teal-700 font-bold mb-4">Clinical Categories</h4>
          <ul className="space-y-2.5 text-sm font-medium">
            <li><Link to="/opportunities?category=Associate+Dentist" className="text-slate-600 hover:text-teal-700 transition-colors">Associate Dentist Jobs</Link></li>
            <li><Link to="/opportunities?category=Consultant+Position" className="text-slate-600 hover:text-teal-700 transition-colors">Visiting Consultants</Link></li>
            <li><Link to="/opportunities?category=Practice+Partnership" className="text-slate-600 hover:text-teal-700 transition-colors">Practice Partnerships</Link></li>
            <li><Link to="/opportunities?category=Fellowship" className="text-slate-600 hover:text-teal-700 transition-colors">MDS & Fellowships</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-teal-700 font-bold mb-4">Platform & Admin</h4>
          <ul className="space-y-2.5 text-sm font-medium">
            <li><Link to="/about" className="text-slate-600 hover:text-teal-700 transition-colors">About Us</Link></li>
            <li><Link to="/clinic-design" className="text-slate-600 hover:text-teal-700 transition-colors">Clinic Design & Setup</Link></li>
            <li><Link to="/products" className="text-slate-600 hover:text-teal-700 transition-colors">Dental Equipment</Link></li>
            <li><Link to="/contact" className="text-slate-600 hover:text-teal-700 transition-colors">Contact Support</Link></li>
            <li><Link to="/admin" className="inline-flex items-center gap-1 text-teal-700 font-semibold hover:underline"><ShieldCheck className="h-3.5 w-3.5" /> Admin Portal</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-teal-100/80 bg-white/80 py-5 text-center text-xs text-slate-500 px-4">
        © 2026 Dental Hub Pro · Built for Dentists, Doctors & Healthcare Institutions in India · All rights reserved.
      </div>
    </footer>
  );
}
