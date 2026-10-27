"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setSent(data.message);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not send reset link");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <div className="w-full max-w-md" data-testid="forgot-password-page">
        <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">Forgot password</h1>
        <p className="mt-1 text-slate-500">Enter your team email and we'll send you a reset link.</p>
        {sent ? (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" data-testid="forgot-password-success">
            <MailCheck className="h-5 w-5 shrink-0" /><span>{sent}</span>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4" data-testid="forgot-password-form">
            <div>
              <Label htmlFor="fp-email">Email</Label>
              <Input id="fp-email" data-testid="forgot-password-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 rounded-xl" placeholder="you@example.com" />
            </div>
            <Button type="submit" data-testid="forgot-password-submit" disabled={busy} className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white h-11">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" data-testid="forgot-password-back-login" className="text-emerald-800 font-semibold">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
