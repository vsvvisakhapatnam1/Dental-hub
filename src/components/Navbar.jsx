"use client";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, LayoutDashboard, LogOut, PlusCircle, ShieldCheck, Mail, Phone, Search } from "lucide-react";
import { ToothIcon } from "@/components/ToothIcon";

const FIND_OPPS = [
  { label: "Jobs", to: "/opportunities?category=Job" },
  { label: "Associate Dentist Jobs", to: "/opportunities?category=Associate Dentist" },
  { label: "Consultant Opportunities", to: "/opportunities?category=Consultant Position" },
  { label: "Clinic Opportunities", to: "/opportunities?category=Clinic Space" },
  { label: "Practice Partnerships", to: "/opportunities?category=Practice Partnership" },
  { label: "Clinic Space", to: "/opportunities?category=Clinic Space" },
  { label: "MDS & Admissions", to: "/opportunities?category=MDS" },
  { label: "Courses & Fellowships", to: "/opportunities?category=Course" },
  { label: "Abroad Opportunities", to: "/opportunities?category=Abroad Opportunity" },
];
const DENTAL_SERVICES = [
  { label: "Dental Labs", to: "/opportunities?category=Dental Lab" },
  { label: "Dental Equipment", to: "/products" },
  { label: "Digital Dentistry", to: "/products" },
  { label: "Practice Management", to: "/opportunities?category=Dental Service" },
  { label: "Marketing Services", to: "/opportunities?category=Dental Service" },
  { label: "Recruitment Services", to: "/opportunities?category=Dental Service" },
  { label: "Training & Consulting", to: "/opportunities?category=Dental Service" },
  { label: "Other Dental Services", to: "/opportunities?category=Other Opportunity" },
];
const CLINIC_SETUP = [
  { label: "Clinic Design", to: "/clinic-design" },
  { label: "Clinic Interiors", to: "/clinic-design" },
  { label: "Dental Equipment", to: "/products" },
  { label: "Clinic Setup Services", to: "/clinic-design" },
  { label: "Technology & Software", to: "/clinic-design" },
  { label: "Practice Management", to: "/clinic-design" },
];
const NAV_LINKS = [
  { label: "Jobs & Opportunities", to: "/opportunities" },
  { label: "Find a Dentist", to: "/dentists" },
  { label: "Find a Clinic", to: "/clinics" },
];
const NAV_END = [
  { label: "About Us", to: "/about" },
  { label: "Team", to: "/team" },
  { label: "Contact Us", to: "/contact" },
];

function NavDropdown({ label, items, navigate }) {
  const slug = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button data-testid={`nav-${slug}`} className="inline-flex items-center gap-1 px-2 py-2 rounded-lg text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
          {label} <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        {items.map((e) => (
          <DropdownMenuItem key={e.label} data-testid={`${slug}-${e.label.toLowerCase().replace(/[^a-z]+/g, "-")}`} onClick={() => navigate(e.to)}>
            {e.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashPath = user && user.role === "admin" ? "/admin" : "/dashboard";
  const handleLogout = async () => { await logout(); navigate("/"); };
  const go = (to) => { setOpen(false); navigate(to); };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[hsl(40_43%_98%/0.85)] dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800">
      <div className="hidden md:block bg-emerald-900 text-white">
        <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-6 h-9 flex items-center justify-end gap-6 text-xs">
          <a href="mailto:info@dentalhubpro.com" data-testid="topbar-email" className="inline-flex items-center gap-1.5 text-emerald-50 hover:text-white transition-colors">
            <Mail className="h-3.5 w-3.5" /> info@dentalhubpro.com
          </a>
          <a href="tel:+918951950389" data-testid="topbar-phone" className="inline-flex items-center gap-1.5 text-emerald-50 hover:text-white transition-colors">
            <Phone className="h-3.5 w-3.5" /> +91-89519 50389
          </a>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 shrink-0">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-emerald-800 text-white">
            <ToothIcon className="h-5 w-5" />
          </span>
          <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
            Dental Hub <span className="text-amber-600">Pro</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5">
          <NavDropdown label="Find Opportunities" items={FIND_OPPS} navigate={navigate} />
          {NAV_LINKS.map((n) => (
            <Link key={n.to} to={n.to} data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="px-2 py-2 rounded-lg text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
              {n.label}
            </Link>
          ))}
          <NavDropdown label="Dental Services" items={DENTAL_SERVICES} navigate={navigate} />
          <NavDropdown label="Clinic Setup" items={CLINIC_SETUP} navigate={navigate} />
          {NAV_END.map((n) => (
            <Link key={n.to} to={n.to} data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="px-2 py-2 rounded-lg text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-2">
          <Button data-testid="nav-looking" variant="outline" size="sm" onClick={() => navigate("/opportunities")} className="rounded-full h-9 px-3 border-emerald-700 text-emerald-800 hover:bg-emerald-50 whitespace-nowrap">
            <Search className="h-4 w-4 mr-1" /> Looking For
          </Button>
          <Button data-testid="nav-post-opportunity" size="sm" onClick={() => navigate("/post")} className="rounded-full h-9 px-3 bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
            <PlusCircle className="h-4 w-4 mr-1" /> Post Opportunity
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="nav-user-menu" className="h-9 w-9 grid place-items-center rounded-full bg-emerald-800 text-white text-sm font-semibold">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="nav-dashboard" onClick={() => navigate(dashPath)}>
                  {user.role === "admin" ? <ShieldCheck className="h-4 w-4 mr-2" /> : <LayoutDashboard className="h-4 w-4 mr-2" />}
                  {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="nav-logout" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" /> Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button data-testid="nav-login" variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-full px-3">Login</Button>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button data-testid="nav-mobile-toggle" aria-label="Toggle Navigation Menu" className="xl:hidden h-10 w-10 grid place-items-center rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800"><Menu className="h-5 w-5" /></button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto bg-white dark:bg-slate-900">
            <div className="flex flex-col gap-1 mt-8">
              <Button data-testid="mnav-looking" variant="outline" onClick={() => go("/opportunities")} className="rounded-full border-emerald-700 text-emerald-800"><Search className="h-4 w-4 mr-1" /> I'm Looking For</Button>
              <Button data-testid="mnav-post" onClick={() => go("/post")} className="rounded-full bg-amber-600 hover:bg-amber-700 text-white mt-2 mb-3"><PlusCircle className="h-4 w-4 mr-1" /> Post an Opportunity</Button>

              <MobileGroup title="Find Opportunities" items={FIND_OPPS} go={go} />
              {NAV_LINKS.map((n) => (
                <button key={n.to} onClick={() => go(n.to)} className="text-left px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800">{n.label}</button>
              ))}
              <MobileGroup title="Dental Services" items={DENTAL_SERVICES} go={go} />
              <MobileGroup title="Clinic Setup" items={CLINIC_SETUP} go={go} />
              {NAV_END.map((n) => (
                <button key={n.to} onClick={() => go(n.to)} className="text-left px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800">{n.label}</button>
              ))}

              <div className="border-t border-slate-200 dark:border-slate-800 my-3" />
              {user ? (
                <>
                  <Button data-testid="mnav-dashboard" variant="outline" onClick={() => go(dashPath)} className="rounded-full">{user.role === "admin" ? "Admin Panel" : "Dashboard"}</Button>
                  <Button data-testid="mnav-logout" variant="ghost" onClick={() => { setOpen(false); handleLogout(); }} className="rounded-full mt-2">Log out</Button>
                </>
              ) : (
                <>
                  <Button data-testid="mnav-login" variant="outline" onClick={() => go("/login")} className="rounded-full">Login</Button>
                  <Button data-testid="mnav-register" onClick={() => go("/register")} className="rounded-full bg-emerald-800 text-white mt-2">Register</Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function MobileGroup({ title, items, go }) {
  return (
    <div className="mt-1">
      <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      {items.map((e) => (
        <button key={e.label} onClick={() => go(e.to)} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800">{e.label}</button>
      ))}
    </div>
  );
}
