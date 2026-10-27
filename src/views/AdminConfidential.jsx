"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Lock, Loader2, ShieldAlert, FileText, Unlock, ArrowLeft, History, CheckCircle2, XCircle, Search, Briefcase } from "lucide-react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function AdminConfidential() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);

  const unlock = async (e) => {
    e?.preventDefault();
    if (!password) { toast.error("Enter the confidential password"); return; }
    setBusy(true);
    try {
      const res = await api.post("/admin/confidential", { password });
      setData(res.data);
      try { const lg = await api.get("/admin/confidential/logs"); setLogs(lg.data); } catch { /* noop */ }
      toast.success("Access granted");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Access denied");
    } finally {
      setBusy(false);
    }
  };

  const lock = () => { setData(null); setPassword(""); };

  if (!data) {
    return (
      <div className="min-h-[75vh] grid place-items-center px-4">
        <form onSubmit={unlock} className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <span className="grid place-items-center h-14 w-14 rounded-2xl bg-red-600 text-white mx-auto"><Lock className="h-7 w-7" /></span>
          <h1 className="mt-5 font-heading text-2xl font-bold text-slate-900 dark:text-white">Confidential Records</h1>
          <p className="mt-2 text-sm text-slate-500">Admin access only. Enter the confidential password to view Seeker & Giver personal details.</p>
          <Input
            data-testid="confidential-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Confidential password"
            className="mt-5 rounded-xl text-center"
          />
          <Button data-testid="confidential-unlock" type="submit" disabled={busy} className="mt-4 w-full rounded-full bg-emerald-800 hover:bg-emerald-900">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Unlock className="h-4 w-4 mr-1" /> Unlock</>)}
          </Button>
          <Link to="/admin" className="mt-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-800"><ArrowLeft className="h-4 w-4" /> Back to Admin</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><ShieldAlert className="h-7 w-7 text-red-600" /> Confidential Records</h1>
        <Button data-testid="confidential-lock" variant="outline" onClick={lock} className="rounded-full"><Lock className="h-4 w-4 mr-1" /> Lock again</Button>
      </div>
      <p className="mt-2 text-sm text-slate-500">Private contact details — handle with care. Do not share outside the Dental Hub Pro team.</p>

      <div className="mt-8" data-testid="conf-seekers-section">
        <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Search className="h-5 w-5 text-emerald-800" /> Seekers <span className="text-sm font-normal text-slate-400">({data.seeker_count})</span></h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead>
                <TableHead>City</TableHead><TableHead>Address</TableHead><TableHead>Pincode</TableHead>
                <TableHead>Qualification</TableHead><TableHead>Speciality</TableHead>
                <TableHead>Pref. Location</TableHead><TableHead>Resume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.seekers.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-slate-400 py-8">No seekers yet</TableCell></TableRow>}
              {data.seekers.map((u) => (
                <TableRow key={u.id} data-testid={`conf-seeker-${u.id}`}>
                  <TableCell className="font-medium">{u.name || "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell>{u.city || "—"}, {u.state || ""}</TableCell>
                  <TableCell className="max-w-[180px] truncate" title={u.address}>{u.address || "—"}</TableCell>
                  <TableCell>{u.pincode || "—"}</TableCell>
                  <TableCell>{u.qualification || "—"}</TableCell>
                  <TableCell>{u.speciality || "—"}</TableCell>
                  <TableCell>{u.preferred_location || "—"}</TableCell>
                  <TableCell>
                    {u.cv_url
                      ? <a href={`${BACKEND}${u.cv_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-800 font-medium hover:underline"><FileText className="h-4 w-4" /> View</a>
                      : <span className="text-slate-400">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-10" data-testid="conf-givers-section">
        <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Briefcase className="h-5 w-5 text-amber-600" /> Givers <span className="text-sm font-normal text-slate-400">({data.giver_count})</span></h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisation</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead>
                <TableHead>Phone</TableHead><TableHead>City</TableHead><TableHead>Address</TableHead>
                <TableHead>Website</TableHead><TableHead>Offering</TableHead><TableHead>GST Number</TableHead><TableHead>Testimonials</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.givers.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-slate-400 py-8">No givers yet</TableCell></TableRow>}
              {data.givers.map((u) => (
                <TableRow key={u.id} data-testid={`conf-giver-${u.id}`}>
                  <TableCell className="font-medium">{u.org_name || u.name || "—"}</TableCell>
                  <TableCell>{u.name || u.contact_person || "—"}{u.designation ? ` (${u.designation})` : ""}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell>{u.city || "—"}, {u.state || ""}</TableCell>
                  <TableCell className="max-w-[180px] truncate" title={u.address}>{u.address || "—"}</TableCell>
                  <TableCell className="max-w-[140px] truncate">{u.website || "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={(u.offering || []).join(", ")}>{(u.offering || []).join(", ") || "—"}</TableCell>
                  <TableCell data-testid={`conf-giver-gst-${u.id}`}>{u.gst_number || "—"}</TableCell>
                  <TableCell className="min-w-[240px] text-xs" data-testid={`conf-giver-testimonials-${u.id}`}>
                    {(u.testimonials || []).length === 0 ? "—" : u.testimonials.map((t, i) => (
                      <p key={i} className="mb-1"><strong>{t.client_name}</strong> ({t.contact}): {t.feedback}</p>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-10" data-testid="confidential-access-log">
        <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><History className="h-5 w-5 text-slate-500" /> Access Log</h2>
        <p className="mt-1 text-sm text-slate-500">Recent attempts to open this confidential page (latest 50).</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow><TableHead>When</TableHead><TableHead>Admin</TableHead><TableHead>Result</TableHead><TableHead>IP</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-6">No access records yet</TableCell></TableRow>}
              {logs.map((l, i) => (
                <TableRow key={i} data-testid={`access-log-${i}`}>
                  <TableCell>{l.created_at ? new Date(l.created_at).toLocaleString() : "—"}</TableCell>
                  <TableCell>{l.admin_email || "—"}</TableCell>
                  <TableCell>
                    {l.success
                      ? <span className="inline-flex items-center gap-1 text-emerald-700 font-medium"><CheckCircle2 className="h-4 w-4" /> Granted</span>
                      : <span className="inline-flex items-center gap-1 text-red-600 font-medium"><XCircle className="h-4 w-4" /> Denied</span>}
                  </TableCell>
                  <TableCell className="text-slate-500">{l.ip || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
