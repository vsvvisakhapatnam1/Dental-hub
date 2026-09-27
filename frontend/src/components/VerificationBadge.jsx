import { CheckCircle2, ShieldCheck, Building2, BadgeCheck, Smartphone, Mail } from "lucide-react";

const MAP = {
  organisation: { label: "Organisation Verified", cls: "bg-amber-100 text-amber-900 border-amber-300", Icon: BadgeCheck },
  clinic: { label: "Clinic Verified", cls: "bg-teal-100 text-teal-900 border-teal-300", Icon: Building2 },
  credential: { label: "Credential Verified", cls: "bg-emerald-100 text-emerald-800 border-emerald-300", Icon: ShieldCheck },
  qualification_submitted: { label: "Qualification Submitted", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
  email: { label: "Email Verified", cls: "bg-blue-50 text-blue-800 border-blue-200", Icon: Mail },
  mobile: { label: "Mobile Verified", cls: "bg-blue-50 text-blue-800 border-blue-200", Icon: Smartphone },
  none: { label: "Registered", cls: "bg-slate-100 text-slate-600 border-slate-200", Icon: CheckCircle2 },
};

export function VerificationBadge({ status = "none", size = "sm", testid }) {
  const v = MAP[status] || MAP.none;
  const { Icon } = v;
  return (
    <span
      data-testid={testid || `verification-badge-${status}`}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium ${v.cls} ${size === "sm" ? "text-xs" : "text-sm"}`}
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
