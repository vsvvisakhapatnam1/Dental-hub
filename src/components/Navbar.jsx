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
        <button
          data-testid={`nav-${slug}`}
          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-[13px] font-semibold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#1D70B8] transition-colors whitespace-nowrap"
        >
          {label} <ChevronDown className="h-3.5 w-3.5 text-[#1D70B8]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl">
        {items.map((e) => (
          <DropdownMenuItem
            key={e.label}
            data-testid={`${slug}-${e.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            onClick={() => navigate(e.to)}
            className="cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#1D70B8]"
          >
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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800">
      {/* Top Utility Bar in Rich Dental Blue */}
      <div className="hidden md:block bg-[#16508C] text-white">
        <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-6 h-9 flex items-center justify-between text-xs font-medium">
          <span className="text-blue-100 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            India's Specialized Dental Career & Practice Marketplace
          </span>
          <div className="flex items-center gap-6">
            <a href="mailto:info@dentalhubpro.com" data-testid="topbar-email" className="inline-flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors">
              <Mail className="h-3.5 w-3.5 text-sky-300" /> info@dentalhubpro.com
            </a>
            <a href="tel:+918951950389" data-testid="topbar-phone" className="inline-flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors">
              <Phone className="h-3.5 w-3.5 text-sky-300" /> +91-89519 50389
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-6 h-20 flex items-center justify-between gap-3">
        {/* Brand Logo matching user uploaded asset */}
        <Link to="/" data-testid="nav-logo" className="flex items-center shrink-0 py-1" aria-label="Dental Hub Pro Home">
          <img
            src="/logo.png"
            alt="Dental Hub Pro Logo"
            className="h-12 sm:h-14 lg:h-16 w-auto max-w-[220px] sm:max-w-[270px] object-contain transition-transform hover:scale-102"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-0.5">
          <NavDropdown label="Find Opportunities" items={FIND_OPPS} navigate={navigate} />
          {NAV_LINKS.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="px-2.5 py-2 rounded-lg text-[13px] font-semibold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#1D70B8] transition-colors whitespace-nowrap"
            >
              {n.label}
            </Link>
          ))}
          <NavDropdown label="Dental Services" items={DENTAL_SERVICES} navigate={navigate} />
          <NavDropdown label="Clinic Setup" items={CLINIC_SETUP} navigate={navigate} />
          {NAV_END.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="px-2.5 py-2 rounded-lg text-[13px] font-semibold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#1D70B8] transition-colors whitespace-nowrap"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons: Blue and Warm Brown */}
        <div className="hidden xl:flex items-center gap-2.5">
          <Button
            data-testid="nav-looking"
            variant="outline"
            size="sm"
            onClick={() => navigate("/opportunities")}
            className="rounded-full h-10 px-4 border-[#1D70B8] text-[#1D70B8] hover:bg-blue-50 hover:border-[#16508C] font-semibold transition-all whitespace-nowrap"
          >
            <Search className="h-4 w-4 mr-1.5 text-[#1D70B8]" /> Looking For
          </Button>

          <Button
            data-testid="nav-post-opportunity"
            size="sm"
            onClick={() => navigate("/post")}
            className="rounded-full h-10 px-4 bg-[#5C3A21] hover:bg-[#472B17] text-white font-semibold transition-all shadow-sm whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" /> Post Opportunity
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-testid="nav-user-menu"
                  className="h-10 w-10 grid place-items-center rounded-full bg-[#1D70B8] text-white text-sm font-bold shadow-sm hover:bg-[#16508C] transition-colors"
                >
                  {(user.name || "U").charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <DropdownMenuLabel className="truncate font-semibold">{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="nav-dashboard" onClick={() => navigate(dashPath)} className="cursor-pointer">
                  {user.role === "admin" ? <ShieldCheck className="h-4 w-4 mr-2 text-[#1D70B8]" /> : <LayoutDashboard className="h-4 w-4 mr-2 text-[#1D70B8]" />}
                  {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="nav-logout" onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              data-testid="nav-login"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="rounded-full h-10 px-4 font-semibold text-slate-800 hover:text-[#1D70B8] hover:bg-blue-50"
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile Navigation Drawer Trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              data-testid="nav-mobile-toggle"
              aria-label="Toggle Navigation Menu"
              className="xl:hidden h-11 w-11 grid place-items-center rounded-xl border border-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-6 w-6 text-[#1D70B8]" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto bg-white dark:bg-slate-900 p-6">
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center justify-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <img src="/logo.png" alt="Dental Hub Pro" className="h-12 w-auto object-contain" />
              </div>

              <Button
                data-testid="mnav-looking"
                variant="outline"
                onClick={() => go("/opportunities")}
                className="rounded-full border-[#1D70B8] text-[#1D70B8] hover:bg-blue-50 h-10 font-semibold mt-2"
              >
                <Search className="h-4 w-4 mr-1.5" /> I'm Looking For
              </Button>
              <Button
                data-testid="mnav-post"
                onClick={() => go("/post")}
                className="rounded-full bg-[#5C3A21] hover:bg-[#472B17] text-white h-10 font-semibold mb-3 shadow-sm"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" /> Post an Opportunity
              </Button>

              <MobileGroup title="Find Opportunities" items={FIND_OPPS} go={go} />
              {NAV_LINKS.map((n) => (
                <button
                  key={n.to}
                  onClick={() => go(n.to)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#1D70B8]"
                >
                  {n.label}
                </button>
              ))}
              <MobileGroup title="Dental Services" items={DENTAL_SERVICES} go={go} />
              <MobileGroup title="Clinic Setup" items={CLINIC_SETUP} go={go} />
              {NAV_END.map((n) => (
                <button
                  key={n.to}
                  onClick={() => go(n.to)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#1D70B8]"
                >
                  {n.label}
                </button>
              ))}

              <div className="border-t border-slate-200 dark:border-slate-800 my-4" />
              {user ? (
                <>
                  <Button
                    data-testid="mnav-dashboard"
                    variant="outline"
                    onClick={() => go(dashPath)}
                    className="rounded-full border-[#1D70B8] text-[#1D70B8] font-semibold"
                  >
                    {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                  </Button>
                  <Button
                    data-testid="mnav-logout"
                    variant="ghost"
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="rounded-full text-red-600 mt-1"
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    data-testid="mnav-login"
                    variant="outline"
                    onClick={() => go("/login")}
                    className="rounded-full border-slate-300 font-semibold"
                  >
                    Login
                  </Button>
                  <Button
                    data-testid="mnav-register"
                    onClick={() => go("/register")}
                    className="rounded-full bg-[#1D70B8] text-white font-semibold hover:bg-[#16508C]"
                  >
                    Register
                  </Button>
                </div>
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
      <p className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-[#5C3A21] dark:text-amber-300">{title}</p>
      {items.map((e) => (
        <button
          key={e.label}
          onClick={() => go(e.to)}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#1D70B8]"
        >
          {e.label}
        </button>
      ))}
    </div>
  );
}
