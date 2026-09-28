import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { ToothIcon } from "@/components/ToothIcon";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      toast.success("Welcome back!");
      navigate(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000" alt="Dentist" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-emerald-900/60" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="font-heading text-3xl font-bold">One Platform. Every Dental Opportunity.</h2>
          <p className="mt-2 text-emerald-100">Log in to manage your opportunities, applications and profile.</p>
        </div>
      </div>
      <div className="grid place-items-center p-6">
        <form onSubmit={submit} className="w-full max-w-md" data-testid="login-form">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-emerald-800 text-white"><ToothIcon className="h-5 w-5" /></span>
            <span className="font-heading font-extrabold text-lg">Dental Hub <span className="text-amber-600">Pro</span></span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-1 text-slate-500">Log in to your account</p>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-3 py-2 text-xs text-amber-800 dark:text-amber-300" data-testid="login-staff-note">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Login is for authorized <strong>Dental Hub Pro</strong> team members only. Seekers &amp; Givers should use <Link to="/register" className="underline font-semibold">Register</Link>.</span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" data-testid="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 rounded-xl" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" data-testid="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 rounded-xl" placeholder="••••••••" />
            </div>
          </div>

          <Button type="submit" data-testid="login-submit" disabled={busy} className="mt-6 w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white h-11">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><div className="h-px flex-1 bg-slate-200" />OR<div className="h-px flex-1 bg-slate-200" /></div>

          <Button type="button" data-testid="login-google" onClick={googleLogin} variant="outline" className="w-full rounded-xl h-11">
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here? <Link to="/register" data-testid="login-to-register" className="text-emerald-800 font-semibold">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
