"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiError } from "@/lib/api";
import { CvUpload } from "@/components/CvUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search, Briefcase, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
} from "lucide-react";
import { ToothIcon } from "@/components/ToothIcon";
import { DesignerEngineeringFields, isDesignerEngineering, validateDesignerEngineering, EMPTY_TESTIMONIAL } from "@/components/DesignerEngineeringFields";
import {
  LOOKING_CATEGORIES, OFFERING_CATEGORIES, SPECIALITIES, QUALIFICATIONS, EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES, AVAILABILITY, STATES, CITIES, SEEKER_PROFILE_TYPES, GIVER_PROFILE_TYPES, PREFERRED_LOCATIONS,
} from "@/lib/constants";

function ChipGroup({ options, selected, onToggle, testidPrefix }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o);
        return (
          <button type="button" key={o} data-testid={`${testidPrefix}-${o.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            onClick={() => onToggle(o)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${active ? "bg-emerald-800 text-white border-emerald-800" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500"}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(null); // seeker | giver
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "seeker" || r === "giver") { setRole(r); setStep(0); }
  }, [searchParams]);
  const [form, setForm] = useState({
    profile_type: "", multi: [], name: "", email: "", phone: "", city: "", state: "", country: "India",
    address: "", pincode: "", cv_url: "", cv_filename: "",
    qualification: "", speciality: "", experience: "", preferred_type: "", preferred_location: "", availability: "", expected_salary: "",
    summary: "", org_name: "", contact_person: "", designation: "", website: "", address: "",
    specialities: [], facilities_text: "", established: "", chairs: "", password: "", confirm: "", agree: false,
    gst_number: "", testimonials: [{ ...EMPTY_TESTIMONIAL }],
  });
  const isDE = role === "giver" && isDesignerEngineering(form);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));

  const steps = role === "seeker"
    ? ["Who are you?", "What are you looking for?", "Professional info", "Preferences", "Create account"]
    : ["What are you offering?", "What to offer?", "Organisation info", "Details", "Create account"];

  const validateBeforeNext = () => {
    if (step === 2) {
      if (role === "seeker" && !form.name.trim()) { toast.error("Name is required"); return false; }
      if (!form.email.trim()) { toast.error("Email is required"); return false; }
      if (!form.phone.trim()) { toast.error("Phone Number is required"); return false; }
      if (!form.city) { toast.error("City is required"); return false; }
      if (!form.address.trim()) { toast.error("Address is required"); return false; }
      if (role === "seeker" && !form.pincode.trim()) { toast.error("Pincode is required"); return false; }
      if (role === "seeker" && !form.cv_url) { toast.error("Please upload your Resume / CV"); return false; }
    }
    if (step === 3 && !form.preferred_location) { toast.error("Preferred Location is required"); return false; }
    if (step === 3 && isDE) { const err = validateDesignerEngineering(form); if (err) { toast.error(err); return false; } }
    return true;
  };
  const next = () => { if (!validateBeforeNext()) return; setStep((s) => Math.min(s + 1, steps.length - 1)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const miss = [];
    if (!form.name.trim()) miss.push("Name");
    if (!form.email.trim()) miss.push("Email");
    if (!form.phone.trim()) miss.push("Phone Number");
    if (!form.city) miss.push("City");
    if (!form.preferred_location) miss.push("Preferred Location");
    if (!form.address.trim()) miss.push("Address");
    if (role === "seeker" && !form.pincode.trim()) miss.push("Pincode");
    if (role === "seeker" && !form.cv_url) miss.push("Resume/CV");
    if (miss.length) { toast.error("Please fill required fields: " + miss.join(", ")); return; }
    if (isDE) { const err = validateDesignerEngineering(form); if (err) { toast.error(err); return; } }
    if (!form.agree) { toast.error("Please accept the Terms & Privacy Policy"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    setBusy(true);
    try {
      const payload = {
        email: form.email, password: form.password, name: form.name, role,
        profile_type: form.profile_type, phone: form.phone, city: form.city, state: form.state, country: form.country,
        address: form.address, pincode: form.pincode, cv_url: form.cv_url, cv_filename: form.cv_filename,
        qualification: form.qualification, speciality: form.speciality, experience: form.experience,
        preferred_type: form.preferred_type, preferred_location: form.preferred_location, availability: form.availability, expected_salary: form.expected_salary,
        summary: form.summary,
        looking_for: role === "seeker" ? form.multi : [],
        offering: role === "giver" ? form.multi : [],
        org_name: form.org_name, contact_person: form.contact_person, designation: form.designation,
        website: form.website, address: form.address, specialities: form.specialities,
        facilities: form.facilities_text ? form.facilities_text.split(",").map((x) => x.trim()).filter(Boolean) : [],
        established: form.established, chairs: form.chairs,
        gst_number: isDE ? form.gst_number.trim().toUpperCase() : null,
        testimonials: isDE ? form.testimonials.filter((t) => t.client_name.trim() && t.contact.trim() && t.feedback.trim()) : [],
      };
      const u = await register(payload);
      toast.success("Account created! Welcome to Dental Opportunity Hub.");
      navigate(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  // ---- Role chooser ----
  if (!role) {
    return (
      <div className="mx-auto max-w-5xl px-4 lg:px-8 py-16">
        <div className="text-center">
          <span className="grid place-items-center h-12 w-12 rounded-2xl bg-emerald-800 text-white mx-auto"><ToothIcon className="h-6 w-6" /></span>
          <h1 className="mt-5 font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Join Dental Hub Pro</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">What brings you here? Choose how you want to use the platform.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <motion.button whileHover={{ y: -4 }} data-testid="choose-seeker" onClick={() => { setRole("seeker"); setStep(0); }}
            className="text-left rounded-3xl border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 hover:border-emerald-600 transition-colors">
            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-emerald-800 text-white"><Search className="h-6 w-6" /></span>
            <h2 className="mt-5 font-heading text-2xl font-bold text-slate-900 dark:text-white">I'M LOOKING FOR</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Find jobs, clinics, partners, courses, MDS opportunities, services and more.</p>
            <span className="mt-6 inline-flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-400">Register as Seeker <ArrowRight className="h-4 w-4" /></span>
          </motion.button>
          <motion.button whileHover={{ y: -4 }} data-testid="choose-giver" onClick={() => { setRole("giver"); setStep(0); }}
            className="text-left rounded-3xl border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 p-8 hover:border-amber-600 transition-colors">
            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-amber-600 text-white"><Briefcase className="h-6 w-6" /></span>
            <h2 className="mt-5 font-heading text-2xl font-bold text-slate-900 dark:text-white">I'M OFFERING</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Post jobs, clinic opportunities, partnerships, courses, services and more.</p>
            <span className="mt-6 inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">Register as Giver <ArrowRight className="h-4 w-4" /></span>
          </motion.button>
        </div>
      </div>
    );
  }

  const profileTypes = role === "seeker" ? SEEKER_PROFILE_TYPES : GIVER_PROFILE_TYPES;
  const multiOptions = role === "seeker" ? LOOKING_CATEGORIES : OFFERING_CATEGORIES;
  const accent = role === "seeker" ? "emerald" : "amber";

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 py-12">
      <div className="flex items-center justify-between">
        <button data-testid="register-change-role" onClick={() => { setRole(null); setStep(0); }} className="text-sm text-slate-500 inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Change role</button>
        <span className={`text-xs font-semibold uppercase tracking-wider ${role === "seeker" ? "text-emerald-700" : "text-amber-700"}`}>{role === "seeker" ? "Seeker Registration" : "Giver Registration"}</span>
      </div>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full transition-colors ${i <= step ? (role === "seeker" ? "bg-emerald-700" : "bg-amber-600") : "bg-slate-200 dark:bg-slate-700"}`} />
          </div>
        ))}
      </div>
      <h1 className="mt-6 font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{steps[step]}</h1>

      <div className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8" data-testid="register-form">
        {step === 0 && (
          <div className="space-y-3">
            <Label>Select your profile type</Label>
            <ChipGroup options={profileTypes} selected={[form.profile_type]} onToggle={(v) => set("profile_type", v)} testidPrefix="ptype" />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <Label>{role === "seeker" ? "What are you looking for? (select all that apply)" : "What do you want to offer? (select all that apply)"}</Label>
            <ChipGroup options={multiOptions} selected={form.multi} onToggle={(v) => toggle("multi", v)} testidPrefix="multi" />
          </div>
        )}

        {step === 2 && role === "seeker" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" testid="reg-name" required><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="rounded-xl" /></Field>
            <Field label="Mobile Number" testid="reg-phone" required><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="rounded-xl" /></Field>
            <Field label="Email" testid="reg-email" required><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="rounded-xl" /></Field>
            <SelectField label="Qualification" value={form.qualification} onChange={(v) => set("qualification", v)} options={QUALIFICATIONS} testid="reg-qualification" />
            <SelectField label="Speciality" value={form.speciality} onChange={(v) => set("speciality", v)} options={SPECIALITIES} testid="reg-speciality" />
            <SelectField label="Experience" value={form.experience} onChange={(v) => set("experience", v)} options={EXPERIENCE_LEVELS} testid="reg-experience" />
            <SelectField label="City" value={form.city} onChange={(v) => set("city", v)} options={CITIES} testid="reg-city" required />
            <SelectField label="State" value={form.state} onChange={(v) => set("state", v)} options={STATES} testid="reg-state" />
            <div className="sm:col-span-2"><Field label="Address" testid="reg-address" required><Input value={form.address} onChange={(e) => set("address", e.target.value)} className="rounded-xl" placeholder="House / street / area" /></Field></div>
            <Field label="Pincode" testid="reg-pincode" required><Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} className="rounded-xl" placeholder="e.g. 500001" /></Field>
            <div className="sm:col-span-2">
              <CvUpload value={form.cv_url} filename={form.cv_filename} required onChange={(url, name) => setForm((f) => ({ ...f, cv_url: url, cv_filename: name }))} />
            </div>
          </div>
        )}

        {step === 2 && role === "giver" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Organisation / Clinic Name" testid="reg-org"><Input value={form.org_name} onChange={(e) => set("org_name", e.target.value)} className="rounded-xl" /></Field>
            <Field label="Contact Person" testid="reg-contact"><Input value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)} className="rounded-xl" /></Field>
            <Field label="Designation" testid="reg-designation"><Input value={form.designation} onChange={(e) => set("designation", e.target.value)} className="rounded-xl" /></Field>
            <Field label="Mobile Number" testid="reg-phone" required><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="rounded-xl" /></Field>
            <Field label="Email" testid="reg-email" required><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="rounded-xl" /></Field>
            <Field label="Website (optional)" testid="reg-website"><Input value={form.website} onChange={(e) => set("website", e.target.value)} className="rounded-xl" /></Field>
            <SelectField label="City" value={form.city} onChange={(v) => set("city", v)} options={CITIES} testid="reg-city" required />
            <SelectField label="State" value={form.state} onChange={(v) => set("state", v)} options={STATES} testid="reg-state" />
            <div className="sm:col-span-2"><Field label="Full Address" testid="reg-address" required><Input value={form.address} onChange={(e) => set("address", e.target.value)} className="rounded-xl" placeholder="Clinic street / area / landmark" /></Field></div>
          </div>
        )}

        {step === 3 && role === "seeker" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <SelectField label="Preferred Opportunity Type" value={form.preferred_type} onChange={(v) => set("preferred_type", v)} options={EMPLOYMENT_TYPES} testid="reg-preferred" />
            <SelectField label="Preferred Location" value={form.preferred_location} onChange={(v) => set("preferred_location", v)} options={PREFERRED_LOCATIONS} testid="reg-preferred-location" required />
            <SelectField label="Availability" value={form.availability} onChange={(v) => set("availability", v)} options={AVAILABILITY} testid="reg-availability" />
            <Field label="Expected Salary / Fee (optional)" testid="reg-salary"><Input value={form.expected_salary} onChange={(e) => set("expected_salary", e.target.value)} className="rounded-xl" placeholder="e.g. ₹40,000/month" /></Field>
            <div className="sm:col-span-2"><Field label="Professional Summary" testid="reg-summary"><Textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} className="rounded-xl" rows={3} placeholder="Tell clinics about yourself…" /></Field></div>
          </div>
        )}

        {step === 3 && role === "giver" && (
          <div className="space-y-4">
            <div className="sm:max-w-sm">
              <SelectField label="Preferred Location" value={form.preferred_location} onChange={(v) => set("preferred_location", v)} options={PREFERRED_LOCATIONS} testid="reg-preferred-location" required />
            </div>
            <div>
              <Label className="mb-2 block">Clinic Specialities</Label>
              <ChipGroup options={SPECIALITIES} selected={form.specialities} onToggle={(v) => toggle("specialities", v)} testidPrefix="cspec" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Years Established (optional)" testid="reg-established"><Input value={form.established} onChange={(e) => set("established", e.target.value)} className="rounded-xl" /></Field>
              <Field label="Number of Dental Chairs (optional)" testid="reg-chairs"><Input value={form.chairs} onChange={(e) => set("chairs", e.target.value)} className="rounded-xl" /></Field>
            </div>
            <Field label="Facilities (comma-separated)" testid="reg-facilities"><Input value={form.facilities_text} onChange={(e) => set("facilities_text", e.target.value)} className="rounded-xl" placeholder="Digital X-Ray, OPG, RVG" /></Field>
            <Field label="About the Organisation" testid="reg-summary"><Textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} className="rounded-xl" rows={3} /></Field>
            {isDE && <DesignerEngineeringFields form={form} setForm={setForm} />}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            {role === "giver" && (
              <Field label="Full Name (contact)" testid="reg-name" required><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="rounded-xl" /></Field>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Password" testid="reg-password"><Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className="rounded-xl" /></Field>
              <Field label="Confirm Password" testid="reg-confirm"><Input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} className="rounded-xl" /></Field>
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Checkbox data-testid="reg-agree" checked={form.agree} onCheckedChange={(v) => set("agree", !!v)} className="mt-0.5" />
              I agree to the Terms &amp; Conditions and Privacy Policy.
            </label>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="ghost" data-testid="register-back" onClick={back} disabled={step === 0} className="rounded-full"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          {step < steps.length - 1 ? (
            <Button type="button" data-testid="register-next" onClick={next} className={`rounded-full text-white ${role === "seeker" ? "bg-emerald-800 hover:bg-emerald-900" : "bg-amber-600 hover:bg-amber-700"}`}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
          ) : (
            <Button type="button" data-testid="register-submit" onClick={submit} disabled={busy} className={`rounded-full text-white ${role === "seeker" ? "bg-emerald-800 hover:bg-emerald-900" : "bg-amber-600 hover:bg-amber-700"}`}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-1" /> Create {role === "seeker" ? "Seeker" : "Giver"} Account</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, testid, required }) {
  return (
    <div data-testid={testid}>
      <Label className="mb-1.5 block">{label}{required && <span className="text-red-500"> *</span>}</Label>
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, options, testid, hidden, required }) {
  if (hidden) return null;
  return (
    <div>
      <Label className="mb-1.5 block">{label}{required && <span className="text-red-500"> *</span>}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger data-testid={testid} className="rounded-xl"><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-900 max-h-64">{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
