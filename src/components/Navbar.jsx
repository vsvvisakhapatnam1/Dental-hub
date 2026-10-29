"use client";

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  ChevronDown,
  Menu,
  PlusCircle,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Stethoscope,
  Sparkles,
} from "lucide-react";

const FIND_OPPS = [
  { label: "All Opportunities", to: "/opportunities" },
  { label: "Dentist Jobs (BDS / MDS)", to: "/opportunities?category=Associate+Dentist" },
  { label: "Visiting Consultants", to: "/opportunities?category=Consultant+Position" },
  { label: "Internships & Fellowships", to: "/opportunities?category=Fellowship" },
  { label: "Clinic Space & Chair Sharing", to: "/opportunities?category=Clinic+Space" },
  { label: "Practice Partnerships", to: "/opportunities?category=Practice+Partnership" },
  { label: "Practice for Sale / Transfer", to: "/opportunities?category=Practice+for+Sale" },
  { label: "Abroad Opportunities", to: "/opportunities?category=Abroad+Opportunity" },
];

const DIRECTORIES = [
  { label: "Dentist & Specialist Directory", to: "/dentists" },
  { label: "Clinic & Hospital Directory", to: "/clinics" },
  { label: "Browse All Listings", to: "/opportunities" },
];

const DENTAL_SERVICES = [
  { label: "Dental Lab Services", to: "/opportunities?category=Dental+Lab" },
  { label: "Dental Equipment & Materials", to: "/products" },
  { label: "Courses & Skill Development", to: "/opportunities?category=Course" },
  { label: "Dental Service Providers", to: "/opportunities?category=Dental+Service" },
];

const CLINIC_SETUP = [
  { label: "Clinic Design & Architecture", to: "/clinic-design" },
  { label: "Dental Chairs & Operatory", to: "/products?cat=Chairs" },
  { label: "Imaging & CBCT / RVG", to: "/products?cat=Imaging" },
  { label: "Turnkey Interior & Setup", to: "/clinic-design#turnkey" },
  { label: "AERB & Licensing Support", to: "/clinic-design#licensing" },
];

function NavDropdown({ label, items, navigate, active }) {
  const slug = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-testid={`nav-dd-${slug}`}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-full text-[13.5px] font-semibold transition-all whitespace-nowrap ${
            active
              ? "bg-teal-50 text-teal-700"
              : "text-slate-700 hover:bg-teal-50/70 hover:text-teal-700"
          }`}
        >
          {label} <ChevronDown className="h-3.5 w-3.5 text-teal-600 opacity-80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 rounded-2xl bg-white p-1.5 border border-slate-200/90 shadow-xl shadow-teal-900/5"
      >
        {items.map((e) => (
          <DropdownMenuItem
            key={e.label}
            data-testid={`${slug}-${e.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            onClick={() => navigate(e.to)}
            className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 focus:bg-teal-50 focus:text-teal-700"
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
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const dashPath = user && user.role === "admin" ? "/admin" : "/dashboard";
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(13,148,136,0.06)]">
      {/* Main Navbar Container — fixed h-20 height with larger logo inside */}
      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Enlarged Brand Logo inside fixed h-20 navbar */}
        <Link
          to="/"
          data-testid="nav-logo"
          className="flex items-center shrink-0 h-full py-0.5 focus:outline-none"
          aria-label="Dental Hub Pro Home"
        >
          <img
            src="/logo.png"
            alt="Dental Hub Pro Logo"
            className="h-[68px] sm:h-[72px] lg:h-[76px] w-auto max-w-[260px] sm:max-w-[310px] object-contain transition-transform duration-200 hover:scale-[1.02]"
          />
        </Link>

        {/* Center: Perfectly Aligned Navigation Pill Container */}
        <nav
          aria-label="Main Navigation"
          className="hidden xl:flex items-center justify-center gap-0.5 rounded-full bg-slate-50/90 border border-slate-200/80 px-2 py-1"
        >
          <NavDropdown
            label="Find Opportunities"
            items={FIND_OPPS}
            navigate={navigate}
            active={location.pathname.startsWith("/opportunities")}
          />

          <Link
            to="/dentists"
            data-testid="nav-dentist-jobs"
            className={`px-3 py-2 rounded-full text-[13.5px] font-semibold transition-all whitespace-nowrap ${
              isActive("/dentists")
                ? "bg-teal-50 text-teal-700"
                : "text-slate-700 hover:bg-teal-50/70 hover:text-teal-700"
            }`}
          >
            Dentists
          </Link>

          <Link
            to="/clinics"
            data-testid="nav-clinics"
            className={`px-3 py-2 rounded-full text-[13.5px] font-semibold transition-all whitespace-nowrap ${
              isActive("/clinics")
                ? "bg-teal-50 text-teal-700"
                : "text-slate-700 hover:bg-teal-50/70 hover:text-teal-700"
            }`}
          >
            Clinics
          </Link>

          <NavDropdown
            label="Dental Services"
            items={DENTAL_SERVICES}
            navigate={navigate}
            active={isActive("/products")}
          />

          <NavDropdown
            label="Clinic Setup"
            items={CLINIC_SETUP}
            navigate={navigate}
            active={isActive("/clinic-design")}
          />

          <Link
            to="/about"
            data-testid="nav-about"
            className={`px-3 py-2 rounded-full text-[13.5px] font-semibold transition-all whitespace-nowrap ${
              isActive("/about")
                ? "bg-teal-50 text-teal-700"
                : "text-slate-700 hover:bg-teal-50/70 hover:text-teal-700"
            }`}
          >
            About
          </Link>

          <Link
            to="/team"
            data-testid="nav-our-team"
            className={`px-3 py-2 rounded-full text-[13.5px] font-semibold transition-all whitespace-nowrap ${
              isActive("/team")
                ? "bg-teal-50 text-teal-700"
                : "text-slate-700 hover:bg-teal-50/70 hover:text-teal-700"
            }`}
          >
            Team
          </Link>

          <Link
            to="/contact"
            data-testid="nav-contact"
            className={`px-3 py-2 rounded-full text-[13.5px] font-semibold transition-all whitespace-nowrap ${
              isActive("/contact")
                ? "bg-teal-50 text-teal-700"
                : "text-slate-700 hover:bg-teal-50/70 hover:text-teal-700"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right: Cleanly Aligned Action Buttons */}
        <div className="hidden xl:flex items-center gap-2.5 shrink-0">
          <Button
            data-testid="nav-looking"
            variant="outline"
            size="sm"
            onClick={() => navigate("/opportunities")}
            className="rounded-full h-10 px-4 border-teal-600/30 bg-teal-50/50 text-teal-700 hover:bg-teal-100/80 hover:border-teal-600 font-semibold transition-all whitespace-nowrap"
          >
            <Search className="h-4 w-4 mr-1.5 text-teal-600" /> Find Jobs
          </Button>

          <Button
            data-testid="nav-post-opportunity"
            size="sm"
            onClick={() => navigate("/post")}
            className="rounded-full h-10 px-4 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold transition-all shadow-sm shadow-teal-600/20 whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" /> Post Opportunity
          </Button>

          <Button
            data-testid="nav-admin-quick"
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className={`rounded-full h-10 px-3.5 font-semibold transition-all whitespace-nowrap ${
              location.pathname.startsWith("/admin")
                ? "bg-sky-600 text-white border-sky-600 hover:bg-sky-700"
                : "border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <ShieldCheck className="h-4 w-4 mr-1 text-sky-600" /> Admin
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-testid="nav-user-menu"
                  className="h-10 w-10 grid place-items-center rounded-full bg-gradient-to-br from-teal-600 to-sky-600 text-white text-sm font-bold shadow-sm hover:opacity-95 transition-opacity"
                  title={user.name || "Account"}
                >
                  {(user.name || "U").charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xl"
              >
                <DropdownMenuLabel className="px-3 py-1.5">
                  <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs font-normal text-slate-500 truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-testid="nav-dashboard"
                  onClick={() => navigate("/dashboard")}
                  className="cursor-pointer rounded-xl px-3 py-2 hover:bg-teal-50 hover:text-teal-700"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2 text-teal-600" /> Member Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid="nav-admin-link"
                  onClick={() => navigate("/admin")}
                  className="cursor-pointer rounded-xl px-3 py-2 hover:bg-sky-50 hover:text-sky-700"
                >
                  <ShieldCheck className="h-4 w-4 mr-2 text-sky-600" /> Admin Control Panel
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid="nav-profile"
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="cursor-pointer rounded-xl px-3 py-2 hover:bg-teal-50 hover:text-teal-700"
                >
                  <User className="h-4 w-4 mr-2 text-teal-600" /> Public Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-testid="nav-logout"
                  onClick={handleLogout}
                  className="cursor-pointer rounded-xl px-3 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                data-testid="nav-login"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="rounded-full font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50"
              >
                Login
              </Button>
              <Button
                data-testid="nav-register"
                size="sm"
                onClick={() => navigate("/register")}
                className="rounded-full h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile & Tablet Menu Drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button
              variant="outline"
              size="icon"
              data-testid="nav-mobile-toggle"
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-80 sm:w-96 bg-white overflow-y-auto border-l border-slate-200 p-5"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-1.5">
              <div className="pb-4 mb-2 border-b border-slate-100 flex items-center justify-between">
                <img src="/logo.png" alt="Dental Hub Pro" className="h-14 w-auto object-contain" />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  data-testid="mnav-looking"
                  variant="outline"
                  onClick={() => go("/opportunities")}
                  className="rounded-xl border-teal-600 text-teal-700 hover:bg-teal-50 h-10 font-semibold text-xs"
                >
                  <Search className="h-3.5 w-3.5 mr-1" /> Find Jobs
                </Button>
                <Button
                  data-testid="mnav-post"
                  onClick={() => go("/post")}
                  className="rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 text-white h-10 font-semibold text-xs shadow-sm"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" /> Post Listing
                </Button>
              </div>

              <Button
                data-testid="mnav-admin-panel"
                variant="outline"
                onClick={() => go("/admin")}
                className="rounded-xl border-sky-200 bg-sky-50/60 text-sky-700 hover:bg-sky-100 h-10 font-semibold justify-start px-3 mb-2"
              >
                <ShieldCheck className="h-4 w-4 mr-2 text-sky-600" /> Admin Panel & Analytics
              </Button>

              <MobileGroup title="Opportunities" items={FIND_OPPS} go={go} />
              <MobileGroup title="Directories" items={DIRECTORIES} go={go} />
              <MobileGroup title="Dental Services" items={DENTAL_SERVICES} go={go} />
              <MobileGroup title="Clinic Setup" items={CLINIC_SETUP} go={go} />

              <div className="mt-1">
                <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  Platform
                </p>
                {[
                  { label: "About Us", to: "/about" },
                  { label: "Our Team", to: "/team" },
                  { label: "Contact", to: "/contact" },
                ].map((n) => (
                  <button
                    key={n.to}
                    onClick={() => go(n.to)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                  >
                    {n.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-200 my-4" />
              {user ? (
                <div className="flex flex-col gap-2">
                  <Button
                    data-testid="mnav-dashboard"
                    variant="outline"
                    onClick={() => go(dashPath)}
                    className="rounded-xl border-teal-600 text-teal-700 font-semibold"
                  >
                    {user.role === "admin" ? "Admin Dashboard" : "Member Dashboard"}
                  </Button>
                  <Button
                    data-testid="mnav-logout"
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="rounded-xl text-red-600"
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    data-testid="mnav-login"
                    variant="outline"
                    onClick={() => go("/login")}
                    className="rounded-xl border-slate-300 font-semibold"
                  >
                    Login
                  </Button>
                  <Button
                    data-testid="mnav-register"
                    onClick={() => go("/register")}
                    className="rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
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
      <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-teal-700">
        {title}
      </p>
      {items.map((e) => (
        <button
          key={e.label}
          onClick={() => go(e.to)}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
        >
          {e.label}
        </button>
      ))}
    </div>
  );
}
