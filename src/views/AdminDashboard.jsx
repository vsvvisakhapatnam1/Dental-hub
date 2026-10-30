"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { subscribeToRealtime, isSupabaseConfigured } from "@/lib/supabase";
import { VerificationBadge, topVerification } from "@/components/VerificationBadge";
import { VERIFICATION_LEVELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { FollowUpTracker } from "@/components/FollowUpTracker";
import {
  Loader2,
  Users,
  Briefcase,
  Building2,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  MoreVertical,
  Sparkles,
  QrCode,
  Copy,
  Download,
  Lock,
  Link2,
  FileDown,
  FileSpreadsheet,
  BarChart3,
  Database,
  RefreshCw,
  Search,
  PhoneCall,
  Activity,
  Trash2,
  ChevronRight,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

const CHART_COLORS = ["#0D9488", "#0284C7", "#14B8A6", "#38BDF8", "#0F766E", "#0369A1"];

const SIDEBAR_ITEMS = [
  { key: "analytics", label: "Analytics & Overview", icon: BarChart3, testid: "admin-nav-analytics" },
  { key: "moderation", label: "Opportunities", icon: Briefcase, testid: "admin-tab-moderation" },
  { key: "users", label: "Users & Verification", icon: Users, testid: "admin-tab-users" },
  { key: "followups", label: "Follow-Ups CRM", icon: PhoneCall, testid: "admin-tab-followups" },
  { key: "applications", label: "Applications", icon: FileText, testid: "admin-tab-applications" },
  { key: "database", label: "Realtime DB & Sync", icon: Database, testid: "admin-nav-database" },
  { key: "share", label: "Share, QR & Vault", icon: QrCode, testid: "admin-tab-share" },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState("analytics");
  const [stats, setStats] = useState(null);
  const [opps, setOpps] = useState([]);
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncingDb, setSyncingDb] = useState(false);
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState("Connected · Live listening");
  const [realtimeEvents, setRealtimeEvents] = useState([]);

  const handleLockSession = async () => {
    await logout();
    toast.info("Admin session locked.");
  };

  // Filters for Opportunities & Users
  const [oppSearch, setOppSearch] = useState("");
  const [oppStatusFilter, setOppStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const [s, o, u, a] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/opportunities"),
        api.get("/admin/users"),
        api.get("/admin/applications"),
      ]);
      setStats(s.data);
      setOpps(o.data || []);
      setUsers(u.data || []);
      setApps(a.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get("/admin/sheets/status").then((r) => setSheet(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const unsub = subscribeToRealtime((evt) => {
      const timeStr = new Date().toLocaleTimeString();
      const label = `${evt.table || "database"} · ${evt.action || "SYNC"} at ${timeStr}`;
      setLastRealtimeEvent(label);
      setRealtimeEvents((prev) => [{ id: Date.now(), label, time: timeStr }, ...prev].slice(0, 12));
      load();
    });
    return unsub;
  }, [load]);

  const syncSheet = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post("/admin/sheets/sync");
      toast.success(`Synced ${data.usersSynced || 0} users & ${data.oppsSynced || 0} opportunities to Supabase & Sheets!`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const syncSupabaseNow = async () => {
    setSyncingDb(true);
    try {
      const { data } = await api.post("/admin/supabase/sync");
      if (data.synced) {
        toast.success(`Synced ${data.usersSynced} profiles & ${data.oppsSynced} opportunities to Supabase!`);
      } else {
        toast.info("Local cache synced. Run supabase/schema.sql in Supabase SQL Editor if tables are not yet created.");
      }
      await load();
    } catch {
      toast.error("Database sync encountered an error");
    } finally {
      setSyncingDb(false);
    }
  };

  const setStatus = async (id, status) => {
    try {
      await api.put(`/admin/opportunities/${id}/status`, null, { params: { status } });
      toast.success(`Listing marked as ${status}`);
      load();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const feature = async (id, val) => {
    try {
      await api.put(`/admin/opportunities/${id}/feature`, null, { params: { featured: val } });
      toast.success(val ? "Marked as Featured" : "Removed from Featured");
      load();
    } catch {
      toast.error("Failed to update featured state");
    }
  };

  const deleteOpportunity = async (id) => {
    try {
      await api.delete(`/opportunities/${id}`);
      toast.success("Opportunity deleted from database");
      load();
    } catch {
      toast.error("Could not delete opportunity");
    }
  };

  const verify = async (uid, level, val) => {
    try {
      await api.put(`/admin/users/${uid}/verify`, null, { params: { level, value: val } });
      toast.success(`Verification updated (${level})`);
      load();
    } catch {
      toast.error("Failed to update verification");
    }
  };

  // CSV Export helper
  const exportCsv = (rows, filename) => {
    if (!rows || rows.length === 0) {
      toast.error("No records to export");
      return;
    }
    const headers = Object.keys(rows[0]).filter(
      (k) => typeof rows[0][k] !== "object" || rows[0][k] === null
    );
    const csvLines = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filename}`);
  };

  // Computed Analytics Data for Charts
  const categoryChartData = useMemo(() => {
    const counts = {};
    opps.forEach((o) => {
      const cat = o.category || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.length > 16 ? name.slice(0, 15) + "…" : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [opps]);

  const cityChartData = useMemo(() => {
    const cityMap = {};
    users.forEach((u) => {
      const c = u.city || "Other";
      if (!cityMap[c]) cityMap[c] = { city: c, Dentists: 0, Clinics: 0, Listings: 0 };
      if (u.role === "giver") cityMap[c].Clinics += 1;
      else cityMap[c].Dentists += 1;
    });
    opps.forEach((o) => {
      const c = o.city || "Other";
      if (!cityMap[c]) cityMap[c] = { city: c, Dentists: 0, Clinics: 0, Listings: 0 };
      cityMap[c].Listings += 1;
    });
    return Object.values(cityMap)
      .sort((a, b) => b.Dentists + b.Clinics + b.Listings - (a.Dentists + a.Clinics + a.Listings))
      .slice(0, 6);
  }, [users, opps]);

  const rolePieData = useMemo(() => {
    const dCount = users.filter((u) => u.role === "seeker").length;
    const cCount = users.filter((u) => u.role === "giver").length;
    return [
      { name: "Dentists & Seekers", value: dCount || 1 },
      { name: "Clinics & Givers", value: cCount || 1 },
    ];
  }, [users]);

  const verificationStats = useMemo(() => {
    return VERIFICATION_LEVELS.map((lvl) => {
      const verifiedCount = users.filter((u) => u.verification?.[lvl.key]).length;
      const pct = users.length > 0 ? Math.round((verifiedCount / users.length) * 100) : 0;
      return { ...lvl, count: verifiedCount, pct };
    });
  }, [users]);

  const filteredOpps = useMemo(() => {
    return opps.filter((o) => {
      if (oppStatusFilter !== "all" && (o.status || "published") !== oppStatusFilter) return false;
      if (oppSearch) {
        const q = oppSearch.toLowerCase();
        return (
          (o.title || "").toLowerCase().includes(q) ||
          (o.category || "").toLowerCase().includes(q) ||
          (o.city || "").toLowerCase().includes(q) ||
          (o.org_name || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [opps, oppStatusFilter, oppSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
      if (userSearch) {
        const q = userSearch.toLowerCase();
        return (
          (u.name || "").toLowerCase().includes(q) ||
          (u.org_name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.city || "").toLowerCase().includes(q) ||
          (u.speciality || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, userRoleFilter, userSearch]);

  if (loading) {
    return (
      <div className="min-h-[65vh] grid place-items-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-teal-600" />
          <p className="text-sm font-medium text-slate-500">Connecting to Supabase Realtime Database…</p>
        </div>
      </div>
    );
  }

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join` : "/join";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(joinUrl)}`;
  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl).then(() => toast.success("Join link copied"));
  };

  const STAT_CARDS = [
    { label: "Total Users", value: stats?.users ?? users.length, icon: Users, color: "bg-teal-50 text-teal-600 border-teal-100" },
    { label: "Dentists", value: stats?.dentists ?? users.filter((u) => u.role === "seeker").length, icon: Stethoscope, color: "bg-sky-50 text-sky-600 border-sky-100" },
    { label: "Clinics", value: stats?.clinics ?? users.filter((u) => u.role === "giver").length, icon: Building2, color: "bg-teal-50 text-teal-600 border-teal-100" },
    { label: "Opportunities", value: stats?.opportunities ?? opps.length, icon: Briefcase, color: "bg-sky-50 text-sky-600 border-sky-100" },
    { label: "Pending Review", value: stats?.pending_opportunities ?? opps.filter((o) => o.status === "pending").length, icon: Clock, color: "bg-teal-50 text-teal-600 border-teal-100" },
    { label: "Applications", value: stats?.applications ?? apps.length, icon: FileText, color: "bg-sky-50 text-sky-600 border-sky-100" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Admin Status Header Bar */}
        <div className="rounded-3xl border border-teal-100 bg-white p-5 sm:p-6 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Admin Control Center
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-0.5 text-xs font-bold text-teal-700">
                  <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                  Supabase Realtime Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Live database analytics, listing moderation, multi-tier verification &amp; CRM follow-ups ·{" "}
                <span className="font-medium text-teal-700">{lastRealtimeEvent}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <Button
              data-testid="admin-supabase-sync-btn"
              onClick={syncSupabaseNow}
              disabled={syncingDb}
              variant="outline"
              className="rounded-full border-teal-200 bg-teal-50/60 text-teal-700 hover:bg-teal-100 font-semibold h-9 sm:h-10 text-xs sm:text-sm"
            >
              {syncingDb ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1.5 text-teal-600" />
              )}
              Sync Database
            </Button>

            <Link to="/admin/confidential">
              <Button
                data-testid="open-confidential-top"
                className="rounded-full bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold h-9 sm:h-10 text-xs sm:text-sm shadow-sm"
              >
                <Lock className="h-4 w-4 mr-1.5" /> Confidential Vault
              </Button>
            </Link>

            <Button
              data-testid="admin-lock-session-btn"
              onClick={handleLockSession}
              variant="outline"
              className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Lock className="h-4 w-4 mr-1.5 text-slate-400" /> Lock Panel
            </Button>
          </div>
        </div>

        {/* Main Layout: Perfectly Aligned Left Side-Menu + Right Content Area */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Side-Menu Navigation */}
          <aside className="lg:col-span-3 xl:col-span-2.5 lg:sticky lg:top-24 rounded-3xl border border-slate-200/90 bg-white p-3 shadow-sm">
            <div className="px-3 py-2 mb-1 border-b border-slate-100 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                Admin Navigation
              </p>
              <span className="lg:hidden text-[10px] text-slate-400">Swipe tabs →</span>
            </div>
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.key;
                const badgeCount =
                  item.key === "moderation"
                    ? opps.length
                    : item.key === "users"
                    ? users.length
                    : item.key === "applications"
                    ? apps.length
                    : item.key === "followups"
                    ? users.filter((u) => !u.follow_up?.contacted && !u.is_demo).length
                    : null;

                return (
                  <button
                    key={item.key}
                    data-testid={item.testid}
                    onClick={() => setActiveSection(item.key)}
                    className={`shrink-0 lg:w-full flex items-center justify-between gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      active
                        ? "bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-teal-50/70 hover:text-teal-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-teal-600"}`} />
                      <span>{item.label}</span>
                    </span>
                    {badgeCount !== null && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Database Health Card inside Sidebar */}
            <div className="hidden lg:block mt-4 pt-4 border-t border-slate-100 px-3 pb-2">
              <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-100 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
                  <Database className="h-3.5 w-3.5 text-teal-600" /> Supabase PostgreSQL
                </div>
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                  {isSupabaseConfigured()
                    ? "Realtime channels subscribed to users, opportunities, applications & follow_ups."
                    : "Configure NEXT_PUBLIC_SUPABASE_URL in .env."}
                </p>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="lg:col-span-9 xl:col-span-9.5 space-y-6">
            {/* KPI Stat Cards Row (Always visible for instant insights) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {STAT_CARDS.map((s) => (
                <div
                  key={s.label}
                  data-testid={`stat-${s.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-teal-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className={`grid place-items-center h-9 w-9 rounded-xl border ${s.color}`}>
                      <s.icon className="h-4 w-4" />
                    </span>
                    <TrendingUp className="h-3.5 w-3.5 text-teal-500" />
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-slate-900">{s.value ?? 0}</p>
                  <p className="text-xs font-medium text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Google Sheet & Supabase Sync Bar (Preserves data-testid="admin-sheet-sync-card") */}
            <div
              data-testid="admin-sheet-sync-card"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-white px-5 py-3.5 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
                  <FileSpreadsheet className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    Supabase &amp; Google Sheet Realtime Sync
                  </p>
                  <p data-testid="admin-sheet-sync-status" className="text-xs text-slate-500">
                    {!sheet
                      ? "Checking connection..."
                      : `Connected · ${users.length} profiles & ${opps.length} opportunities synced in database`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  data-testid="admin-sheet-sync-button"
                  onClick={syncSheet}
                  disabled={syncing}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-teal-200 text-teal-700 hover:bg-teal-50 font-semibold"
                >
                  {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync All Records"}
                </Button>
              </div>
            </div>

            {/* ================================================================ */}
            {/* SECTION 1: ANALYTICS & OVERVIEW                                  */}
            {/* ================================================================ */}
            {activeSection === "analytics" && (
              <div className="space-y-6" data-testid="admin-analytics-section">
                {/* Charts Row 1 */}
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Opportunities by Category Bar Chart */}
                  <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-slate-900">
                          Opportunities by Category
                        </h3>
                        <p className="text-xs text-slate-500">
                          Live distribution of clinical job &amp; practice listings in database
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                        {opps.length} Total Listings
                      </span>
                    </div>
                    <div className="space-y-3.5">
                      {categoryChartData.map((item, idx) => {
                        const maxVal = Math.max(...categoryChartData.map((d) => d.count), 1);
                        const widthPct = Math.round((item.count / maxVal) * 100);
                        return (
                          <div key={item.name} className="group">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                              <span className="truncate">{item.name}</span>
                              <span className="font-bold text-teal-700">{item.count} listing{item.count === 1 ? "" : "s"}</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(widthPct, 8)}%`,
                                  backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seekers vs Givers Donut Breakdown */}
                  <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-slate-900">
                        Registered Users Breakdown
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Dentists (Seekers) vs Clinics &amp; Organisations (Givers)
                      </p>
                    </div>
                    {(() => {
                      const dVal = rolePieData[0]?.value || 0;
                      const cVal = rolePieData[1]?.value || 0;
                      const total = Math.max(dVal + cVal, 1);
                      const dPct = Math.round((dVal / total) * 100);
                      const cPct = 100 - dPct;
                      const circumference = 2 * Math.PI * 56;
                      const dStroke = (dPct / 100) * circumference;
                      return (
                        <div className="flex flex-col items-center">
                          <div className="relative h-40 w-40 grid place-items-center">
                            <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
                              <circle
                                cx="70"
                                cy="70"
                                r="56"
                                fill="transparent"
                                stroke="#0284C7"
                                strokeWidth="18"
                              />
                              <circle
                                cx="70"
                                cy="70"
                                r="56"
                                fill="transparent"
                                stroke="#0D9488"
                                strokeWidth="18"
                                strokeDasharray={`${dStroke} ${circumference}`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-2xl font-extrabold text-slate-900">{users.length}</span>
                              <span className="text-[11px] font-medium text-slate-500">Profiles</span>
                            </div>
                          </div>
                          <div className="mt-4 w-full grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                            <div className="rounded-xl bg-teal-50/70 border border-teal-100 p-3 text-center">
                              <p className="text-xs font-semibold text-teal-800">Dentists (Seekers)</p>
                              <p className="text-lg font-extrabold text-teal-700 mt-0.5">
                                {dVal} <span className="text-xs font-normal">({dPct}%)</span>
                              </p>
                            </div>
                            <div className="rounded-xl bg-sky-50/70 border border-sky-100 p-3 text-center">
                              <p className="text-xs font-semibold text-sky-800">Clinics (Givers)</p>
                              <p className="text-lg font-extrabold text-sky-700 mt-0.5">
                                {cVal} <span className="text-xs font-normal">({cPct}%)</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Charts Row 2: City Activity & Verification Funnel */}
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* City-wise Distribution */}
                  <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-slate-900">
                          Top Healthcare Cities Activity
                        </h3>
                        <p className="text-xs text-slate-500">
                          Dentists, Clinics, and Active Opportunities by city
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="inline-flex items-center gap-1 text-teal-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Dentists
                        </span>
                        <span className="inline-flex items-center gap-1 text-sky-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Clinics
                        </span>
                        <span className="inline-flex items-center gap-1 text-sky-500">
                          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Listings
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {cityChartData.map((c) => (
                        <div
                          key={c.city}
                          className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 hover:border-teal-200 transition-colors"
                        >
                          <p className="font-heading font-bold text-sm text-slate-900">{c.city}</p>
                          <div className="mt-3 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Dentists</span>
                              <span className="font-bold text-teal-700">{c.Dentists}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Clinics</span>
                              <span className="font-bold text-sky-700">{c.Clinics}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Opportunities</span>
                              <span className="font-bold text-slate-800">{c.Listings}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification Funnel Progress */}
                  <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                    <h3 className="font-heading font-bold text-lg text-slate-900">
                      6-Tier Verification Coverage
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Percentage of registered profiles verified at each clinical tier
                    </p>
                    <div className="space-y-3.5">
                      {verificationStats.map((v) => (
                        <div key={v.key}>
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                            <span>{v.label}</span>
                            <span className="text-teal-700">
                              {v.count} ({v.pct}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all duration-500"
                              style={{ width: `${Math.max(v.pct, 6)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* SECTION 2: OPPORTUNITIES MODERATION                              */}
            {/* ================================================================ */}
            {activeSection === "moderation" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-slate-900">
                      Opportunities Management
                    </h3>
                    <p className="text-xs text-slate-500">
                      Approve, reject, feature or remove listings synced with Supabase `opportunities` table.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={oppSearch}
                        onChange={(e) => setOppSearch(e.target.value)}
                        placeholder="Search listings…"
                        className="pl-9 rounded-full h-9 w-52 text-xs"
                      />
                    </div>
                    {["all", "published", "pending", "rejected"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOppStatusFilter(st)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize border transition-colors ${
                          oppStatusFilter === st
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportCsv(opps, "dentalhubpro-opportunities.csv")}
                      className="rounded-full text-xs h-9 border-teal-200 text-teal-700"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-x-auto">
                  <div className="sm:hidden px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500">
                    ← Swipe horizontally to view full table →
                  </div>
                  <Table className="min-w-[760px] w-full">
                    <TableHeader>
                      <TableRow className="bg-slate-50/80">
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Organisation</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOpps.map((o) => (
                        <TableRow key={o.id} data-testid={`admin-opp-${o.id}`}>
                          <TableCell className="font-semibold text-slate-900 max-w-[240px] truncate">
                            {o.featured && (
                              <Sparkles className="inline h-3.5 w-3.5 text-sky-500 mr-1" />
                            )}
                            {o.title}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-600">
                            {o.category}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 max-w-[160px] truncate">
                            {o.org_name || o.poster_name}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">{o.city}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                o.status === "published" || !o.status
                                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                                  : o.status === "pending"
                                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {o.status || "published"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" data-testid={`admin-opp-menu-${o.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white rounded-xl border border-slate-200 shadow-lg">
                                <DropdownMenuItem
                                  data-testid={`approve-${o.id}`}
                                  onClick={() => setStatus(o.id, "published")}
                                  className="cursor-pointer"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-teal-600" /> Approve &amp; Publish
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  data-testid={`reject-${o.id}`}
                                  onClick={() => setStatus(o.id, "rejected")}
                                  className="cursor-pointer"
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" /> Reject Listing
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => feature(o.id, !o.featured)}
                                  className="cursor-pointer"
                                >
                                  <Sparkles className="h-4 w-4 mr-2 text-sky-500" />{" "}
                                  {o.featured ? "Unfeature" : "Mark as Featured"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteOpportunity(o.id)}
                                  className="cursor-pointer text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete Listing
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* SECTION 3: USERS & 6-TIER VERIFICATION                           */}
            {/* ================================================================ */}
            {activeSection === "users" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-slate-900">
                      Registered Users &amp; Verification Control
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click any verification pill to grant or revoke clinical credentials in real time.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search name, email, city…"
                        className="pl-9 rounded-full h-9 w-56 text-xs"
                      />
                    </div>
                    {[
                      { k: "all", l: "All Users" },
                      { k: "seeker", l: "Dentists (Seekers)" },
                      { k: "giver", l: "Clinics (Givers)" },
                    ].map((r) => (
                      <button
                        key={r.k}
                        onClick={() => setUserRoleFilter(r.k)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                          userRoleFilter === r.k
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
                        }`}
                      >
                        {r.l}
                      </button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportCsv(users, "dentalhubpro-users.csv")}
                      className="rounded-full text-xs h-9 border-teal-200 text-teal-700"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      data-testid={`admin-user-${u.id}`}
                      className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {u.org_name || u.name}{" "}
                            <span
                              className={`ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                u.role === "giver"
                                  ? "bg-sky-50 text-sky-700"
                                  : "bg-teal-50 text-teal-700"
                              }`}
                            >
                              {u.role === "giver" ? "Clinic / Giver" : "Dentist / Seeker"}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {u.email} · {u.city || "India"} · {u.speciality || u.profile_type}
                          </p>
                        </div>
                        <VerificationBadge status={topVerification(u.verification)} />
                      </div>
                      {u.role !== "admin" && (
                        <div className="mt-3.5 flex flex-wrap gap-2">
                          {VERIFICATION_LEVELS.map((v) => {
                            const on = u.verification?.[v.key];
                            return (
                              <button
                                key={v.key}
                                data-testid={`verify-${u.id}-${v.key}`}
                                onClick={() => verify(u.id, v.key, !on)}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                                  on
                                    ? "bg-teal-50 text-teal-700 border-teal-300 shadow-2xs"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-teal-400 hover:text-teal-700"
                                }`}
                              >
                                <BadgeCheck className={`h-3.5 w-3.5 ${on ? "text-teal-600" : "text-slate-400"}`} />
                                {v.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* SECTION 4: FOLLOW-UPS CRM                                        */}
            {/* ================================================================ */}
            {activeSection === "followups" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-1">
                  Registration Follow-Up CRM
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Track outreach calls and notes for every registered Seeker and Giver (synced with `public.follow_ups`).
                </p>
                <FollowUpTracker
                  users={users}
                  onSaved={(id, fu) =>
                    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, follow_up: fu } : x)))
                  }
                />
              </div>
            )}

            {/* ================================================================ */}
            {/* SECTION 5: APPLICATIONS                                          */}
            {/* ================================================================ */}
            {activeSection === "applications" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-slate-900">
                      Submitted Applications
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time feed of candidate applications across published opportunities.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportCsv(apps, "dentalhubpro-applications.csv")}
                    className="rounded-full text-xs border-teal-200 text-teal-700"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                  </Button>
                </div>
                <div className="rounded-2xl border border-slate-200 overflow-x-auto">
                  <div className="sm:hidden px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500">
                    ← Swipe horizontally to view full table →
                  </div>
                  <Table className="min-w-[760px] w-full">
                    <TableHeader>
                      <TableRow className="bg-slate-50/80">
                        <TableHead>Applicant</TableHead>
                        <TableHead>Opportunity</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apps.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-400 py-10">
                            No applications submitted yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        apps.map((a) => (
                          <TableRow key={a.id} data-testid={`admin-app-${a.id}`}>
                            <TableCell className="font-semibold text-slate-900">
                              {a.applicant_name}
                            </TableCell>
                            <TableCell className="max-w-[220px] truncate text-slate-700">
                              {a.opportunity_title}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {a.applicant_email}
                            </TableCell>
                            <TableCell className="max-w-[220px] truncate text-xs text-slate-500">
                              {a.message || "—"}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {new Date(a.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* SECTION 6: REALTIME DATABASE & SYNC                              */}
            {/* ================================================================ */}
            {activeSection === "database" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
                        <Database className="h-5 w-5 text-teal-600" /> Supabase PostgreSQL Realtime Engine
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        All pages (`Home`, `Find Opportunities`, `Post Opportunity`, `Dentist Directory`, `Clinic Directory`, `Register`, `Admin`) read and write directly to Supabase with real-time event broadcasting.
                      </p>
                    </div>
                    <Button
                      onClick={syncSupabaseNow}
                      disabled={syncingDb}
                      className="rounded-full bg-gradient-to-r from-teal-600 to-sky-600 text-white font-semibold"
                    >
                      {syncingDb ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1.5" />
                      )}
                      Push All Current Website Data to Supabase
                    </Button>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                      <p className="text-xs font-bold uppercase text-teal-700">Table: public.users</p>
                      <p className="mt-1 text-2xl font-extrabold text-slate-900">{users.length} Rows</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Synced with `public_dentists`, `public_clinics`, `user_verifications` &amp; `follow_ups`
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                      <p className="text-xs font-bold uppercase text-sky-700">Table: public.opportunities</p>
                      <p className="mt-1 text-2xl font-extrabold text-slate-900">{opps.length} Rows</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Full-text trigram search indexed (`pg_trgm`)
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                      <p className="text-xs font-bold uppercase text-teal-700">Table: public.applications</p>
                      <p className="mt-1 text-2xl font-extrabold text-slate-900">{apps.length} Rows</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Unique `(opportunity_id, applicant_id)` constraint
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-teal-600" /> Recent Realtime Events
                    </h4>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1.5 max-h-48 overflow-y-auto text-xs font-mono text-slate-700">
                      {realtimeEvents.length === 0 ? (
                        <p className="text-slate-500">Listening for live PostgreSQL changes on `supabase_realtime` publication…</p>
                      ) : (
                        realtimeEvents.map((ev) => (
                          <div key={ev.id} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-0">
                            <span className="text-teal-700 font-semibold">{ev.label}</span>
                            <span className="text-slate-400">{ev.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* SECTION 7: SHARE, QR & CONFIDENTIAL VAULT                        */}
            {/* ================================================================ */}
            {activeSection === "share" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xs">
                  <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                    <QrCode className="h-5 w-5 text-teal-600" /> Join QR Code
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Scan to open the Seeker / Giver registration landing page.
                  </p>
                  <div className="mt-4 inline-block rounded-2xl border border-teal-100 p-3 bg-white shadow-xs">
                    <img src={qrSrc} alt="Join QR code" data-testid="join-qr" className="h-52 w-52" />
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm">
                    <Link2 className="h-4 w-4 text-teal-600 shrink-0" />
                    <span data-testid="join-link" className="truncate">
                      {joinUrl}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2 justify-center flex-wrap">
                    <Button
                      data-testid="copy-join-link"
                      variant="outline"
                      onClick={copyLink}
                      className="rounded-full"
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy link
                    </Button>
                    <a href={qrSrc} download="dentalhubpro-join-qr.png">
                      <Button className="rounded-full bg-teal-600 hover:bg-teal-700 text-white">
                        <Download className="h-4 w-4 mr-1" /> Download QR
                      </Button>
                    </a>
                    <Link to="/flyer" target="_blank">
                      <Button data-testid="open-flyer" variant="outline" className="rounded-full">
                        <FileDown className="h-4 w-4 mr-1" /> Printable Flyer
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-sky-600" /> Confidential Records Vault
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Seeker &amp; Giver personal contact details (phone, email, address, pincode, GSTIN, testimonials, resume) are protected by Row Level Security and accessible only in the password-protected vault.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-teal-600" /> Staff Admin login required
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-teal-600" /> Secondary vault password (`dentalhubpro2026`)
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-teal-600" /> Every access logged in `public.audit_logs`
                    </li>
                  </ul>
                  <Link to="/admin/confidential">
                    <Button
                      data-testid="open-confidential"
                      className="mt-5 rounded-full bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold"
                    >
                      <Lock className="h-4 w-4 mr-1.5" /> Open Confidential Vault
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
