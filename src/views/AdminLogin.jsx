"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Database,
  CheckCircle2,
} from "lucide-react";

const ADMIN_ACCOUNTS = [
  { email: "info@dentalhubpro.com", label: "Primary Admin" },
  { email: "tdvsatishkumar@gmail.com", label: "Dr. Satish Kumar" },
  { email: "vsv.visakhapatnam@gmail.com", label: "VSV Visakhapatnam" },
];

export default function AdminLogin({ onSuccess }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("info@dentalhubpro.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!password.trim()) {
      setErrorMsg("Please enter the admin password.");
      toast.error("Please enter the admin password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/admin/login", {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data) {
        setUser(res.data);
        toast.success("Admin access granted. Welcome to Control Center.");
        if (onSuccess) {
          onSuccess(res.data);
        } else {
          navigate("/admin");
        }
      }
    } catch (err) {
      const msg =
        formatApiError(err.response?.data?.detail) ||
        "Invalid admin password. Please verify and try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] w-full flex items-center justify-center px-4 py-12 bg-gradient-to-b from-teal-50/40 via-white to-sky-50/30">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="relative rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-teal-900/5 transition-all">
          {/* Top Medical Shield Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-sky-600 text-white shadow-lg shadow-teal-600/25 ring-4 ring-teal-50">
            <ShieldCheck className="h-8 w-8" />
          </div>

          {/* Heading & Subtitle */}
          <div className="mt-5 text-center">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Portal
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Restricted management zone. Enter the authorized password to access verified clinics, seekers &amp; platform controls.
            </p>
          </div>

          {/* Live Supabase Connected Badge */}
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-teal-50/90 border border-teal-200/80 px-3 py-1 text-[11.5px] font-semibold text-teal-800">
            <Database className="h-3.5 w-3.5 text-teal-600" />
            <span>Supabase Database Authorization Active</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Quick Admin Profile Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Account
              </label>
              <Input
                data-testid="admin-login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@dentalhubpro.com"
                className="rounded-xl h-11 border-slate-200 focus-visible:ring-teal-500 text-sm"
                required
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ADMIN_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setEmail(acc.email)}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                      email === acc.email
                        ? "bg-teal-600 text-white border-teal-600 font-semibold"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  data-testid="admin-login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  className="rounded-xl h-11 pr-11 border-slate-200 focus-visible:ring-teal-500 text-sm"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Validated in real time against Supabase database.
              </p>
            </div>

            {/* Inline Error Message */}
            {errorMsg && (
              <div
                data-testid="admin-login-error"
                className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700 text-center"
              >
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <Button
              data-testid="admin-login-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-full h-11 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying with Supabase…
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" /> Unlock Admin Panel
                </>
              )}
            </Button>
          </form>

          {/* Footer Back link */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Website
            </Link>
            <Link
              to="/contact"
              className="font-medium text-slate-400 hover:text-teal-700 transition-colors"
            >
              Need Support?
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-4 text-center text-[11.5px] text-slate-400 flex items-center justify-center gap-1">
          <Lock className="h-3 w-3 text-slate-400" />
          <span>Dental Hub Pro · End-to-End Encrypted Admin Session</span>
        </p>
      </div>
    </div>
  );
}
