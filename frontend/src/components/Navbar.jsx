import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, LayoutDashboard, LogOut, PlusCircle, ShieldCheck, Mail, Phone } from "lucide-react";
import { ToothIcon } from "@/components/ToothIcon";

const EXPLORE = [
  { label: "Jobs", to: "/opportunities?category=Job" },
  { label: "Clinic Opportunities", to: "/opportunities?category=Clinic Space" },
  { label: "Practice & Partnerships", to: "/opportunities?category=Practice Partnership" },
  { label: "Education & Courses", to: "/opportunities?category=Course" },
  { label: "Abroad Opportunities", to: "/opportunities?category=Abroad Opportunity" },
  { label: "Dental Services", to: "/opportunities?category=Dental Service" },
];

const NAV = [
  { label: "Opportunities", to: "/opportunities" },
  { label: "Dentists", to: "/dentists" },
  { label: "Clinics", to: "/clinics" },
  { label: "Products", to: "/products" },
  { label: "Clinic Design", to: "/clinic-design" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashPath = user && user.role === "admin" ? "/admin" : "/dashboard";

  const handleLogout = async () => { await logout(); navigate("/"); };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[hsl(40_43%_98%/0.85)] dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800">
      <div className="hidden md:block bg-emerald-900 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 h-9 flex items-center justify-end gap-6 text-xs">
          <a href="mailto:info@dentalhubpro.com" data-testid="topbar-email" className="inline-flex items-center gap-1.5 text-emerald-50 hover:text-white transition-colors">
            <Mail className="h-3.5 w-3.5" /> info@dentalhubpro.com
          </a>
          <a href="tel:+918951950389" data-testid="topbar-phone" className="inline-flex items-center gap-1.5 text-emerald-50 hover:text-white transition-colors">
            <Phone className="h-3.5 w-3.5" /> +91-89519 50389
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 shrink-0">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-emerald-800 text-white">
            <ToothIcon className="h-5 w-5" />
          </span>
          <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
            Dental Hub <span className="text-amber-600">Pro</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button data-testid="nav-explore" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors">
                Explore <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
              {EXPLORE.map((e) => (
                <DropdownMenuItem key={e.label} data-testid={`explore-${e.label.toLowerCase().replace(/[^a-z]+/g, "-")}`} onClick={() => navigate(e.to)}>
                  {e.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button data-testid="nav-post-opportunity" onClick={() => navigate("/post")} className="rounded-full bg-amber-600 hover:bg-amber-700 text-white">
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
            <>
              <Button data-testid="nav-login" variant="ghost" onClick={() => navigate("/login")} className="rounded-full">Login</Button>
              <Button data-testid="nav-register" onClick={() => navigate("/register")} className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-white">Register</Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button data-testid="nav-mobile-toggle" className="lg:hidden h-10 w-10 grid place-items-center rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800"><Menu className="h-5 w-5" /></button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-white dark:bg-slate-900">
            <div className="flex flex-col gap-1 mt-8">
              <Button data-testid="mnav-post" onClick={() => { setOpen(false); navigate("/post"); }} className="rounded-full bg-amber-600 hover:bg-amber-700 text-white mb-3">
                <PlusCircle className="h-4 w-4 mr-1" /> Post Opportunity
              </Button>
              {[...NAV, ...EXPLORE].map((n) => (
                <Link key={n.to + n.label} to={n.to} onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800">
                  {n.label}
                </Link>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-800 my-3" />
              {user ? (
                <>
                  <Button data-testid="mnav-dashboard" variant="outline" onClick={() => { setOpen(false); navigate(dashPath); }} className="rounded-full">
                    {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                  </Button>
                  <Button data-testid="mnav-logout" variant="ghost" onClick={() => { setOpen(false); handleLogout(); }} className="rounded-full mt-2">Log out</Button>
                </>
              ) : (
                <>
                  <Button data-testid="mnav-login" variant="outline" onClick={() => { setOpen(false); navigate("/login"); }} className="rounded-full">Login</Button>
                  <Button data-testid="mnav-register" onClick={() => { setOpen(false); navigate("/register"); }} className="rounded-full bg-emerald-800 text-white mt-2">Register</Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
