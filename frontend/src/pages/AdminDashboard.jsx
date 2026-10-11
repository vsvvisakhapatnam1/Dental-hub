import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { VerificationBadge, topVerification } from "@/components/VerificationBadge";
import { VERIFICATION_LEVELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Loader2, Users, Briefcase, Building2, FileText, Clock, ShieldCheck, CheckCircle2, XCircle,
  BadgeCheck, MoreVertical, Sparkles, QrCode, Copy, Download, Lock, Link2, FileDown, FileSpreadsheet,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [opps, setOpps] = useState([]);
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { api.get("/admin/sheets/status").then((r) => setSheet(r.data)).catch(() => {}); }, []);

  const syncSheet = async () => {
    setSyncing(true);
    try { const { data } = await api.post("/admin/sheets/sync"); toast.success(`Syncing ${data.pending} record(s) to Google Sheet`); }
    catch (e) { toast.error(e.response?.data?.detail || "Sync failed"); }
    finally { setSyncing(false); }
  };

  const load = useCallback(async () => {
    const [s, o, u, a] = await Promise.all([
      api.get("/admin/stats"), api.get("/admin/opportunities"), api.get("/admin/users"), api.get("/admin/applications"),
    ]);
    setStats(s.data); setOpps(o.data); setUsers(u.data); setApps(a.data);
    setLoading(false);
  }, []);

  useEffect(() => { load().catch(() => setLoading(false)); }, [load]);

  const setStatus = async (id, status) => {
    try { await api.put(`/admin/opportunities/${id}/status`, null, { params: { status } }); toast.success(`Marked ${status}`); load(); } catch { toast.error("Failed"); }
  };
  const feature = async (id, val) => {
    try { await api.put(`/admin/opportunities/${id}/feature`, null, { params: { featured: val } }); toast.success(val ? "Featured" : "Unfeatured"); load(); } catch { toast.error("Failed"); }
  };
  const verify = async (uid, level, val) => {
    try { await api.put(`/admin/users/${uid}/verify`, null, { params: { level, value: val } }); toast.success("Updated"); load(); } catch { toast.error("Failed"); }
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;

  const joinUrl = `${window.location.origin}/join`;
  const qrSrc = `${process.env.REACT_APP_BACKEND_URL}/api/qr/join`;
  const copyLink = () => { navigator.clipboard.writeText(joinUrl).then(() => toast.success("Join link copied")); };

  const STAT_CARDS = [
    { label: "Total Users", value: stats?.users, icon: Users },
    { label: "Dentists", value: stats?.dentists, icon: Users },
    { label: "Clinics", value: stats?.clinics, icon: Building2 },
    { label: "Opportunities", value: stats?.opportunities, icon: Briefcase },
    { label: "Pending Review", value: stats?.pending_opportunities, icon: Clock },
    { label: "Applications", value: stats?.applications, icon: FileText },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-emerald-800" /> Admin Dashboard</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Moderate listings, manage verification and monitor marketplace activity.</p>

      <div data-testid="admin-sheet-sync-card" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-emerald-800" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Google Sheet &amp; Drive sync</p>
            <p data-testid="admin-sheet-sync-status" className="text-xs text-slate-500">
              {!sheet ? "Checking..." : !sheet.configured ? "Not connected yet" : sheet.reachable === false ? "Connected, but Google is not responding" : `Connected - ${sheet.pending} record(s) waiting to sync`}
            </p>
          </div>
        </div>
        <Button data-testid="admin-sheet-sync-button" onClick={syncSheet} disabled={syncing || !sheet?.configured} variant="outline" className="rounded-full">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync now"}
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <s.icon className="h-5 w-5 text-emerald-800" />
            <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">{s.value ?? 0}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="moderation" className="mt-10">
        <TabsList className="rounded-full bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="moderation" data-testid="admin-tab-moderation" className="rounded-full">Opportunities</TabsTrigger>
          <TabsTrigger value="users" data-testid="admin-tab-users" className="rounded-full">Users & Verification</TabsTrigger>
          <TabsTrigger value="applications" data-testid="admin-tab-applications" className="rounded-full">Applications</TabsTrigger>
          <TabsTrigger value="share" data-testid="admin-tab-share" className="rounded-full">Share & QR</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="mt-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {opps.map((o) => (
                  <TableRow key={o.id} data-testid={`admin-opp-${o.id}`}>
                    <TableCell className="font-medium max-w-[220px] truncate">{o.featured && <Sparkles className="inline h-3.5 w-3.5 text-amber-500 mr-1" />}{o.title}</TableCell>
                    <TableCell>{o.category}</TableCell>
                    <TableCell>{o.city}</TableCell>
                    <TableCell><span className={`text-xs font-semibold ${o.status === "published" ? "text-emerald-700" : o.status === "pending" ? "text-amber-600" : "text-red-600"}`}>{o.status}</span></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button size="sm" variant="ghost" data-testid={`admin-opp-menu-${o.id}`}><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900">
                          <DropdownMenuItem data-testid={`approve-${o.id}`} onClick={() => setStatus(o.id, "published")}><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" /> Approve</DropdownMenuItem>
                          <DropdownMenuItem data-testid={`reject-${o.id}`} onClick={() => setStatus(o.id, "rejected")}><XCircle className="h-4 w-4 mr-2 text-red-600" /> Reject</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => feature(o.id, !o.featured)}><Sparkles className="h-4 w-4 mr-2 text-amber-500" /> {o.featured ? "Unfeature" : "Feature"}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} data-testid={`admin-user-${u.id}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{u.org_name || u.name} <span className="text-xs font-normal text-slate-400">· {u.role}</span></p>
                    <p className="text-sm text-slate-500 truncate">{u.email} · {u.city || "—"}</p>
                  </div>
                  <VerificationBadge status={topVerification(u.verification)} />
                </div>
                {u.role !== "admin" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {VERIFICATION_LEVELS.map((v) => {
                      const on = u.verification?.[v.key];
                      return (
                        <button key={v.key} data-testid={`verify-${u.id}-${v.key}`} onClick={() => verify(u.id, v.key, !on)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${on ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-white text-slate-500 border-slate-200 hover:border-emerald-400"}`}>
                          <BadgeCheck className="h-3 w-3" />{v.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Applicant</TableHead><TableHead>Opportunity</TableHead><TableHead>Email</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {apps.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">No applications yet.</TableCell></TableRow> :
                  apps.map((a) => (
                    <TableRow key={a.id} data-testid={`admin-app-${a.id}`}>
                      <TableCell className="font-medium">{a.applicant_name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{a.opportunity_title}</TableCell>
                      <TableCell>{a.applicant_email}</TableCell>
                      <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="share" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2"><QrCode className="h-5 w-5 text-emerald-800" /> Join QR Code</h3>
              <p className="mt-1 text-sm text-slate-500">Scan to open the Seeker / Giver join page.</p>
              <div className="mt-4 inline-block rounded-2xl border border-slate-200 dark:border-slate-700 p-3 bg-white">
                <img src={qrSrc} alt="Join QR code" data-testid="join-qr" className="h-52 w-52" />
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
                <Link2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span data-testid="join-link" className="truncate">{joinUrl}</span>
              </div>
              <div className="mt-3 flex gap-2 justify-center flex-wrap">
                <Button data-testid="copy-join-link" variant="outline" onClick={copyLink} className="rounded-full"><Copy className="h-4 w-4 mr-1" /> Copy link</Button>
                <a href={qrSrc} download="dentalhubpro-join-qr.png"><Button className="rounded-full bg-emerald-800 hover:bg-emerald-900"><Download className="h-4 w-4 mr-1" /> Download QR</Button></a>
                <Link to="/flyer" target="_blank"><Button data-testid="open-flyer" variant="outline" className="rounded-full"><FileDown className="h-4 w-4 mr-1" /> Printable Flyer</Button></Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Lock className="h-5 w-5 text-red-600" /> Confidential Records</h3>
              <p className="mt-2 text-sm text-slate-500">Seeker &amp; Giver personal contact details (phone, email, address, resume) are kept private and are only accessible on a separate, password-protected page.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Admin login required</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Extra confidential password</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Resume / CV view access</li>
              </ul>
              <Link to="/admin/confidential"><Button data-testid="open-confidential" className="mt-5 rounded-full bg-red-600 hover:bg-red-700"><Lock className="h-4 w-4 mr-1" /> Open Confidential Page</Button></Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
