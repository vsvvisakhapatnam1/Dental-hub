"use client";

import { CheckCircle2, ShieldCheck, Building2, BadgeCheck, Smartphone, Mail } from "lucide-react";

const MAP = {
  organisation: { label: "Organisation Verified", cls: "bg-teal-50 text-teal-800 border-teal-200", Icon: BadgeCheck },
  clinic: { label: "Clinic Verified", cls: "bg-sky-50 text-sky-800 border-sky-200", Icon: Building2 },
  credential: { label: "Credential Verified", cls: "bg-teal-50 text-teal-700 border-teal-200", Icon: ShieldCheck },
  qualification_submitted: { label: "Qualification Submitted", cls: "bg-sky-50 text-sky-700 border-sky-200", Icon: CheckCircle2 },
  email: { label: "Email Verified", cls: "bg-slate-50 text-slate-700 border-slate-200", Icon: Mail },
  mobile: { label: "Mobile Verified", cls: "bg-slate-50 text-slate-700 border-slate-200", Icon: Smartphone },
  none: { label: "Registered", cls: "bg-slate-50 text-slate-600 border-slate-200", Icon: CheckCircle2 },
};

export function VerificationBadge({ status = "none", size = "sm", testid }) {
  const v = MAP[status] || MAP.none;
  const { Icon } = v;
  return (
    <span
      data-testid={testid || `verification-badge-${status}`}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-semibold ${v.cls} ${size === "sm" ? "text-xs" : "text-sm"}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {v.label}
    </span>
  );
}

export function topVerification(verification = {}) {
  const order = ["organisation", "clinic", "credential", "qualification_submitted", "email", "mobile"];
  for (const k of order) if (verification?.[k]) return k;
  return "none";
}
