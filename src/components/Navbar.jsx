"use client";

import { useState, useEffect } from "react";
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
  User,
  LogOut,
  LayoutDashboard,
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

const PRODUCT_OPTIONS = [
  { label: "Dental Equipment", to: "/product" },
  { label: "Dental Materials", to: "/product" },
  { label: "Cosmetic", to: "/product" },
  { label: "Drugs", to: "/product" },
];

const CLINIC_SETUP = [
  { label: "Clinic Design & Architecture", to: "/clinic-design" },
  { label: "Dental Chairs & Operatory", to: "/clinic-design" },
  { label: "Imaging & CBCT / RVG", to: "/clinic-design" },
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

  // Auto-logout from admin panel when navigating to any non-admin route
  useEffect(() => {
    if (user && user.role === "admin" && !location.pathname.startsWith("/admin")) {
      logout();
    }
  }, [location.pathname, user, logout]);

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
      {/* Main Navbar Container — fixed h-20 height with logo and perfectly aligned items */}
      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link
          to="/"
          data-testid="nav-logo"
          className="flex items-center shrink-0 py-1 focus:outline-none"
          aria-label="Dental Hub Home"
        >
          <img
            src="/logo.png"
            alt="Dental Hub Logo"
            className="h-12 sm:h-14 lg:h-[62px] w-auto max-w-[85px] sm:max-w-[95px] lg:max-w-[105px] object-contain object-left transition-transform duration-200 hover:scale-105"
          />
        </Link>

        {/* Center: Main Navigation Pill Container */}
        <nav
          aria-label="Main Navigation"
          className="hidden xl:flex items-center justify-center gap-0.5 rounded-full bg-slate-50/90 border border-slate-200/80 px-2.5 py-1"
        >
          {/* 1st Option: About */}
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

          {/* 2nd Option: Find Opportunities */}
          <NavDropdown
            label="Find Opportunities"
            items={FIND_OPPS}
            navigate={navigate}
            active={location.pathname.startsWith("/opportunities")}
          />

          {/* 3rd Option: Dentists */}
          <Link
            to="/dentists"
            data-testid="nav-dentists"
            className={`px-3 py-2 rounded-full text-[13.5px] font-semibold transition-all whitespace-nowrap ${
              isActive("/dentists")
                ? "bg-teal-50 text-teal-700"
                : "text-slate-700 hover:bg-teal-50/70 hover:text-teal-700"
            }`}
          >
            Dentists
          </Link>

          {/* 4th Option: Clinics */}
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

          {/* 5th Option: Product */}
          <NavDropdown
            label="Product"
            items={PRODUCT_OPTIONS}
            navigate={navigate}
            active={location.pathname.startsWith("/product")}
          />

          {/* 6th Option: Clinic Setup */}
          <NavDropdown
            label="Clinic Setup"
            items={CLINIC_SETUP}
            navigate={navigate}
            active={isActive("/clinic-design")}
          />

          {/* 7th Option: Team */}
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

          {/* 8th Option: Contact */}
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

        {/* Right: Auth Action */}
        <div className="hidden xl:flex items-center gap-2.5 shrink-0">
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
            <Button
              data-testid="nav-login"
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
              className="rounded-full h-10 px-5 font-semibold text-slate-700 border-slate-200 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50 transition-all"
            >
              Login
            </Button>
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
                <img src="/logo.png" alt="Dental Hub" className="h-14 w-auto object-contain" />
              </div>

              {/* 1st Option: About Us */}
              <button
                onClick={() => go("/about")}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
              >
                About Us
              </button>

              {/* 2nd Option: Opportunities */}
              <MobileGroup title="Opportunities" items={FIND_OPPS} go={go} />

              {/* 3rd Option: Directories */}
              <MobileGroup title="Directories" items={DIRECTORIES} go={go} />

              {/* 4th Option: Product */}
              <MobileGroup title="Product" items={PRODUCT_OPTIONS} go={go} />

              {/* 5th Option: Clinic Setup */}
              <MobileGroup title="Clinic Setup" items={CLINIC_SETUP} go={go} />

              {/* Platform Links */}
              <div className="mt-1">
                <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  Platform
                </p>
                {[
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
                <Button
                  data-testid="mnav-login"
                  variant="outline"
                  onClick={() => go("/login")}
                  className="rounded-xl border-slate-300 font-semibold w-full h-11"
                >
                  Login
                </Button>
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
