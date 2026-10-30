"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PhoneCall, CheckCircle2, Circle } from "lucide-react";

const FILTERS = [
  { key: "pending", label: "Not contacted" },
  { key: "done", label: "Contacted" },
  { key: "all", label: "All" },
];

const FollowUpRow = ({ u, onSaved }) => {
  const [note, setNote] = useState(u.follow_up?.note || "");
  const contacted = !!u.follow_up?.contacted;

  const save = async (value) => {
    try {
      const { data } = await api.put(`/admin/users/${u.id}/followup`, { contacted: value, note });
      onSaved(u.id, data);
      toast.success(value ? "Marked as contacted" : "Marked as not contacted");
    } catch { toast.error("Could not update"); }
  };

  return (
    <div data-testid={`followup-row-${u.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 truncate">{u.org_name || u.name} <span className="text-xs font-normal text-slate-400">· {u.role === "giver" ? "Giver" : "Seeker"}</span></p>
        <p className="text-sm text-slate-500 truncate">
          <a href={`tel:${u.phone}`} data-testid={`followup-phone-${u.id}`} className="text-teal-700 font-medium hover:underline">{u.phone || "—"}</a> · {u.city || "—"} · {new Date(u.created_at).toLocaleDateString()}
        </p>
        {contacted && <p className="text-xs text-slate-400 mt-0.5" data-testid={`followup-meta-${u.id}`}>Contacted by {u.follow_up.by} on {new Date(u.follow_up.at).toLocaleString()}</p>}
      </div>
      <Input data-testid={`followup-note-${u.id}`} value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== (u.follow_up?.note || "") && save(contacted)} placeholder="Add a note (optional)" className="md:max-w-xs rounded-xl" />
      <Button data-testid={`followup-toggle-${u.id}`} onMouseDown={(e) => e.preventDefault()} onClick={() => save(!contacted)} variant="outline"
        className={`rounded-full shrink-0 ${contacted ? "border-teal-300 bg-teal-50 text-teal-800" : "border-amber-300 bg-amber-50 text-amber-800"}`}>
        {contacted ? <CheckCircle2 className="h-4 w-4 mr-1 text-teal-600" /> : <Circle className="h-4 w-4 mr-1" />}
        {contacted ? "Contacted" : "Not contacted"}
      </Button>
    </div>
  );
};

export const FollowUpTracker = ({ users, onSaved }) => {
  const [filter, setFilter] = useState("pending");
  const regs = users.filter((u) => (u.role === "seeker" || u.role === "giver") && !u.is_demo);
  const pending = regs.filter((u) => !u.follow_up?.contacted).length;
  const shown = regs.filter((u) => filter === "all" || (filter === "done" ? u.follow_up?.contacted : !u.follow_up?.contacted));

  return (
    <div data-testid="followup-tracker">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-slate-600 flex items-center gap-2" data-testid="followup-summary">
          <PhoneCall className="h-4 w-4 text-teal-600" /> {pending} of {regs.length} registrations waiting for follow-up
        </p>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} data-testid={`followup-filter-${f.key}`} onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${filter === f.key ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-700"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {shown.length === 0 ? <p className="text-center text-slate-400 py-8" data-testid="followup-empty">Nothing here.</p> :
          shown.map((u) => <FollowUpRow key={u.id} u={u} onSaved={onSaved} />)}
      </div>
    </div>
  );
};
