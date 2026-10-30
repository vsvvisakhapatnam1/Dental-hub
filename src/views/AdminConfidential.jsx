"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Lock,
  Loader2,
  ShieldAlert,
  FileText,
  Unlock,
  ArrowLeft,
  History,
  CheckCircle2,
  XCircle,
  Search,
  Briefcase,
  ExternalLink,
} from "lucide-react";

export default function AdminConfidential() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);

  const unlock = async (e) => {
    e?.preventDefault();
    if (!password) {
      toast.error("Enter the confidential password");
      return;
    }
    setBusy(true);
    try {
      const res = await api.post("/admin/confidential", { password });
      setData(res.data);
      try {
        const lg = await api.get("/admin/confidential/logs");
        setLogs(lg.data || []);
      } catch {
        /* noop */
      }
      toast.success("Confidential vault unlocked");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Access denied");
    } finally {
      setBusy(false);
    }
  };

  const lock = () => {
    setData(null);
    setPassword("");
  };

  if (!data) {
    return (
      <div className="min-h-[78vh] grid place-items-center px-4 py-8 bg-gradient-to-b from-teal-50/30 via-white to-sky-50/30">
        <form
          onSubmit={unlock}
          className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-9 text-center shadow-xl shadow-teal-900/5"
        >
          <div className="grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white mx-auto shadow-md shadow-red-500/25 ring-4 ring-red-50">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Confidential Records Vault
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Restricted database vault. Enter the confidential password (<span className="font-semibold text-teal-700">dentalhubpro2026</span>) to view private contact information for Seekers &amp; Givers.
          </p>
          <Input
            data-testid="confidential-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter confidential password"
            autoFocus
            className="mt-6 rounded-xl text-center h-11 border-slate-200 focus-visible:ring-teal-500 text-sm"
          />
          <Button
            data-testid="confidential-unlock"
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-full h-11 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold shadow-md shadow-teal-600/20"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Authorizing with Supabase…
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-2" /> Unlock Confidential Vault
              </>
            )}
          </Button>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Dashboard
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Bar */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20">
              <ShieldAlert className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Confidential Records Vault
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Private contact numbers, personal addresses, CV documents, and tax filings — handle with strict confidentiality.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              data-testid="confidential-lock"
              variant="outline"
              onClick={lock}
              className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold h-10"
            >
              <Lock className="h-4 w-4 mr-1.5 text-slate-500" /> Lock Vault
            </Button>
            <Link to="/admin">
              <Button
                variant="outline"
                className="rounded-full border-teal-200 bg-teal-50/60 text-teal-700 hover:bg-teal-100 font-semibold h-10"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5 text-teal-600" /> Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 1: Seekers Table */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm" data-testid="conf-seekers-section">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                <Search className="h-5 w-5 text-teal-600" /> Registered Seekers &amp; Candidates
                <span className="text-xs font-bold rounded-full bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-0.5 ml-1">
                  {data.seeker_count} total
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete candidate profiles including direct phone, address, and uploaded resumes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <div className="sm:hidden px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500">
              ← Swipe horizontally to view all 10 candidate columns →
            </div>
            <Table className="min-w-[980px] w-full">
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-bold text-slate-700">Name</TableHead>
                  <TableHead className="font-bold text-slate-700">Email</TableHead>
                  <TableHead className="font-bold text-slate-700">Phone</TableHead>
                  <TableHead className="font-bold text-slate-700">City &amp; State</TableHead>
                  <TableHead className="font-bold text-slate-700">Address</TableHead>
                  <TableHead className="font-bold text-slate-700">Pincode</TableHead>
                  <TableHead className="font-bold text-slate-700">Qualification</TableHead>
                  <TableHead className="font-bold text-slate-700">Speciality</TableHead>
                  <TableHead className="font-bold text-slate-700">Pref. Location</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Resume / CV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.seekers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-slate-400 py-10">
                      No seekers currently registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.seekers.map((u) => (
                    <TableRow key={u.id} data-testid={`conf-seeker-${u.id}`}>
                      <TableCell className="font-semibold text-slate-900">{u.name || "—"}</TableCell>
                      <TableCell className="text-xs text-slate-600">{u.email}</TableCell>
                      <TableCell className="text-xs">
                        {u.phone ? (
                          <a href={`tel:${u.phone}`} className="text-teal-700 font-semibold hover:underline">
                            {u.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {u.city || "—"}{u.state ? `, ${u.state}` : ""}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs text-slate-500" title={u.address}>
                        {u.address || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{u.pincode || "—"}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-700">{u.qualification || "—"}</TableCell>
                      <TableCell className="text-xs text-teal-700 font-medium">{u.speciality || "—"}</TableCell>
                      <TableCell className="text-xs text-slate-600">{u.preferred_location || "—"}</TableCell>
                      <TableCell className="text-right">
                        {u.cv_url ? (
                          <a
                            href={u.cv_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" /> View CV
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Section 2: Givers Table */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm" data-testid="conf-givers-section">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-sky-600" /> Registered Clinics &amp; Employers
                <span className="text-xs font-bold rounded-full bg-sky-50 border border-sky-200 text-sky-700 px-2.5 py-0.5 ml-1">
                  {data.giver_count} total
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Practice management, primary point of contact, GSTIN registration, and client references.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <div className="sm:hidden px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500">
              ← Swipe horizontally to view all clinic records →
            </div>
            <Table className="min-w-[980px] w-full">
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-bold text-slate-700">Organisation</TableHead>
                  <TableHead className="font-bold text-slate-700">Contact Person</TableHead>
                  <TableHead className="font-bold text-slate-700">Email</TableHead>
                  <TableHead className="font-bold text-slate-700">Phone</TableHead>
                  <TableHead className="font-bold text-slate-700">City &amp; State</TableHead>
                  <TableHead className="font-bold text-slate-700">Address</TableHead>
                  <TableHead className="font-bold text-slate-700">Website</TableHead>
                  <TableHead className="font-bold text-slate-700">Offering</TableHead>
                  <TableHead className="font-bold text-slate-700">GST Number</TableHead>
                  <TableHead className="font-bold text-slate-700">Testimonials</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.givers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-slate-400 py-10">
                      No clinics currently registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.givers.map((u) => (
                    <TableRow key={u.id} data-testid={`conf-giver-${u.id}`}>
                      <TableCell className="font-semibold text-slate-900">{u.org_name || u.name || "—"}</TableCell>
                      <TableCell className="text-xs">
                        {u.name || u.contact_person || "—"}
                        {u.designation ? <span className="text-slate-400 block text-[11px]">{u.designation}</span> : null}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{u.email}</TableCell>
                      <TableCell className="text-xs">
                        {u.phone ? (
                          <a href={`tel:${u.phone}`} className="text-sky-700 font-semibold hover:underline">
                            {u.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {u.city || "—"}{u.state ? `, ${u.state}` : ""}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs text-slate-500" title={u.address}>
                        {u.address || "—"}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-xs">
                        {u.website ? (
                          <a
                            href={u.website.startsWith("http") ? u.website : `https://${u.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Visit
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs font-medium text-teal-700" title={(u.offering || []).join(", ")}>
                        {(u.offering || []).join(", ") || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono" data-testid={`conf-giver-gst-${u.id}`}>
                        {u.gst_number || "—"}
                      </TableCell>
                      <TableCell className="min-w-[220px] text-xs" data-testid={`conf-giver-testimonials-${u.id}`}>
                        {(u.testimonials || []).length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          u.testimonials.map((t, i) => (
                            <p key={i} className="mb-1 leading-snug">
                              <strong>{t.client_name}</strong> ({t.contact}): {t.feedback}
                            </p>
                          ))
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Section 3: Access Log */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm" data-testid="confidential-access-log">
          <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" /> Security Access Log
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Realtime security audit trail of all confidential vault access attempts.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <Table className="min-w-[620px] w-full">
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-bold text-slate-700">Timestamp</TableHead>
                  <TableHead className="font-bold text-slate-700">Admin Account</TableHead>
                  <TableHead className="font-bold text-slate-700">Result</TableHead>
                  <TableHead className="font-bold text-slate-700">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400 py-6 text-xs">
                      No security audit records logged yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((l, i) => (
                    <TableRow key={i} data-testid={`access-log-${i}`}>
                      <TableCell className="text-xs text-slate-600">
                        {l.created_at ? new Date(l.created_at).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-900">{l.admin_email || "—"}</TableCell>
                      <TableCell className="text-xs">
                        {l.success ? (
                          <span className="inline-flex items-center gap-1 text-teal-700 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <XCircle className="h-3.5 w-3.5" /> Denied
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-500">{l.ip || "127.0.0.1"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
