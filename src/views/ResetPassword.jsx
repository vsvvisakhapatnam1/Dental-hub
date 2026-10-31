"use client";

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, password });
      toast.success(data.message);
      navigate("/");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <div className="w-full max-w-md" data-testid="reset-password-page">
        <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">Set a new password</h1>
        {!token ? (
          <p className="mt-4 text-sm text-red-600" data-testid="reset-password-missing-token">This reset link is invalid. Please request a new one.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4" data-testid="reset-password-form">
            <div>
              <Label htmlFor="rp-pass">New password</Label>
              <Input id="rp-pass" data-testid="reset-password-new" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 rounded-xl" placeholder="At least 8 characters" />
            </div>
            <div>
              <Label htmlFor="rp-confirm">Confirm password</Label>
              <Input id="rp-confirm" data-testid="reset-password-confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5 rounded-xl" />
            </div>
            <Button type="submit" data-testid="reset-password-submit" disabled={busy} className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white h-11">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/forgot-password" data-testid="reset-password-request-new" className="text-emerald-800 font-semibold">Request a new link</Link>
        </p>
      </div>
    </div>
  );
}
