"use client";

import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-[#0F172A] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="inline-block bg-white rounded-2xl p-2.5 shadow-sm hover:scale-102 transition-transform">
            <img src="/logo.png" alt="Dental Hub Pro" className="h-12 w-auto object-contain" />
          </Link>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            One Platform. Every Dental Opportunity. India's specialized dental careers, clinic setups, and professional services network.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-sky-400 font-bold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/opportunities" className="hover:text-sky-300 transition-colors">Find Opportunities</Link></li>
            <li><Link to="/dentists" className="hover:text-sky-300 transition-colors">Dentist Directory</Link></li>
            <li><Link to="/clinics" className="hover:text-sky-300 transition-colors">Clinic Directory</Link></li>
            <li><Link to="/post" className="hover:text-sky-300 transition-colors">Post an Opportunity</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-sky-400 font-bold mb-4">Categories</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/opportunities?category=Job" className="hover:text-sky-300 transition-colors">Associate Jobs</Link></li>
            <li><Link to="/opportunities?category=Practice Partnership" className="hover:text-sky-300 transition-colors">Partnerships</Link></li>
            <li><Link to="/opportunities?category=Course" className="hover:text-sky-300 transition-colors">MDS & Fellowships</Link></li>
            <li><Link to="/opportunities?category=Abroad Opportunity" className="hover:text-sky-300 transition-colors">Abroad (UAE / UK)</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-sky-400 font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-sky-300 transition-colors">About Us</Link></li>
            <li><Link to="/clinic-design" className="hover:text-sky-300 transition-colors">Clinic Design & Setup</Link></li>
            <li><Link to="/contact" className="hover:text-sky-300 transition-colors">Contact Support</Link></li>
            <li><Link to="/pricing" className="hover:text-sky-300 transition-colors">Pricing Plans</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 px-4">
        © 2026 Dental Hub Pro · Built for Dental Professionals in India · All rights reserved.
      </div>
    </footer>
  );
}
