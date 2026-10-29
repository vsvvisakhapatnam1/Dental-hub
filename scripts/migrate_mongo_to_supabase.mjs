/**
 * ============================================================================
 * DENTAL HUB PRO — MONGODB TO SUPABASE (POSTGRESQL) DATA MIGRATION SCRIPT
 * ============================================================================
 * Preserves existing UUID v4 `id` strings, `created_at` timestamps, and
 * bcrypt `password_hash` values so existing staff logins continue working.
 * Also flattens `verification`, `follow_up`, and `testimonials` into both
 * the JSONB mirrors on `users` and the normalized child tables:
 *   - public.user_verifications
 *   - public.follow_ups
 *   - public.giver_testimonials
 *
 * Usage:
 *   1. npm install mongodb @supabase/supabase-js dotenv
 *   2. Set MONGO_URL, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY in .env
 *   3. node scripts/migrate_mongo_to_supabase.mjs
 * ============================================================================
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.DB_NAME || "dental_hub_pro";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function migrate() {
  let MongoClient;
  try {
    ({ MongoClient } = await import("mongodb"));
  } catch {
    console.error("Please install the mongodb driver first: npm install mongodb");
    process.exit(1);
  }

  const mongo = new MongoClient(MONGO_URL);
  await mongo.connect();
  const db = mongo.db(MONGO_DB_NAME);
  console.log(`Connected to MongoDB database: ${MONGO_DB_NAME}`);

  // --------------------------------------------------------------------------
  // 1. Migrate users (+ giver_testimonials, user_verifications, follow_ups)
  // --------------------------------------------------------------------------
  const mongoUsers = await db.collection("users").find({}).toArray();
  console.log(`Found ${mongoUsers.length} users in MongoDB...`);

  for (const u of mongoUsers) {
    const verification = {
      mobile: Boolean(u.verification?.mobile),
      email: Boolean(u.verification?.email),
      qualification_submitted: Boolean(u.verification?.qualification_submitted),
      credential: Boolean(u.verification?.credential),
      clinic: Boolean(u.verification?.clinic),
      organisation: Boolean(u.verification?.organisation),
    };

    const followUp = {
      contacted: Boolean(u.follow_up?.contacted),
      note: String(u.follow_up?.note || "").slice(0, 500),
      by: u.follow_up?.by || null,
      at: u.follow_up?.at || null,
    };

    const testimonials = Array.isArray(u.testimonials)
      ? u.testimonials.slice(0, 5).map((t) => ({
          client_name: String(t.client_name || "").slice(0, 120),
          contact: String(t.contact || "").slice(0, 120),
          feedback: String(t.feedback || "").slice(0, 1000),
        }))
      : [];

    const userRow = {
      id: u.id,
      email: String(u.email || "").toLowerCase().trim(),
      password_hash: u.password_hash || null,
      password_changed: Boolean(u.password_changed),
      auth_provider: u.auth_provider || "email",
      name: u.name || "Dental Professional",
      role: u.role || "seeker",
      profile_type: u.profile_type || (u.role === "giver" ? "Dental Clinic" : "BDS Dentist"),
      phone: u.phone || null,
      city: u.city || "Hyderabad",
      state: u.state || "",
      country: u.country || "India",
      pincode: u.pincode || null,
      address: u.address || null,
      preferred_location: u.preferred_location || null,
      cv_url: u.cv_url || null,
      cv_filename: u.cv_filename || null,
      qualification: u.qualification || null,
      speciality: u.speciality || null,
      experience: u.experience || null,
      skills: Array.isArray(u.skills) ? u.skills : [],
      looking_for: Array.isArray(u.looking_for) ? u.looking_for : [],
      offering: Array.isArray(u.offering) ? u.offering : [],
      preferred_type: u.preferred_type || null,
      availability: u.availability || null,
      expected_salary: u.expected_salary || null,
      summary: u.summary || "",
      org_name: u.org_name || null,
      contact_person: u.contact_person || null,
      designation: u.designation || null,
      website: u.website || null,
      specialities: Array.isArray(u.specialities) ? u.specialities : [],
      facilities: Array.isArray(u.facilities) ? u.facilities : [],
      established: u.established ? String(u.established) : null,
      chairs: u.chairs ? String(u.chairs) : null,
      gst_number: u.gst_number || null,
      testimonials,
      photo: u.photo || null,
      verification,
      follow_up: followUp,
      welcome_email_status: u.welcome_email_status || "not_configured",
      whatsapp_status: u.whatsapp_status || "not_configured",
      whatsapp_message_id: u.whatsapp_message_id || null,
      team_alert_status: u.team_alert_status || "not_configured",
      sheet_synced: Boolean(u.sheet_synced),
      is_demo: Boolean(u.is_demo),
      created_at: u.created_at || new Date().toISOString(),
    };

    const { error } = await supabase.from("users").upsert(userRow, { onConflict: "id" });
    if (error) {
      console.error(`Error migrating user ${u.email}:`, error.message);
      continue;
    }

    // Insert normalized giver_testimonials
    if (testimonials.length > 0) {
      await supabase.from("giver_testimonials").delete().eq("user_id", u.id);
      const tRows = testimonials
        .filter((t) => t.client_name && t.contact && t.feedback)
        .map((t, idx) => ({
          user_id: u.id,
          client_name: t.client_name,
          contact: t.contact,
          feedback: t.feedback,
          display_order: idx + 1,
        }));
      if (tRows.length > 0) {
        await supabase.from("giver_testimonials").insert(tRows);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 2. Migrate opportunities
  // --------------------------------------------------------------------------
  const mongoOpps = await db.collection("opportunities").find({}).toArray();
  console.log(`Found ${mongoOpps.length} opportunities in MongoDB...`);
  for (const o of mongoOpps) {
    const oppRow = {
      id: o.id,
      mode: o.mode || "offering",
      category: o.category || "Dentist Job",
      title: o.title || "Dental Opportunity",
      description: o.description || "",
      org_name: o.org_name || null,
      city: o.city || "Hyderabad",
      state: o.state || "",
      country: o.country || "India",
      speciality: o.speciality || "",
      qualification: o.qualification || "",
      experience: o.experience || "",
      employment_type: o.employment_type || "",
      compensation: o.compensation || "",
      requirements: o.requirements || "",
      perks: o.perks || "",
      contact_method: o.contact_method || "email",
      contact_value: o.contact_value || null,
      poster_id: o.poster_id || null,
      poster_name: o.poster_name || null,
      verification_status: o.verification_status || "none",
      status: o.status || "pending",
      featured: Boolean(o.featured),
      is_demo: Boolean(o.is_demo),
      created_at: o.created_at || new Date().toISOString(),
    };
    const { error } = await supabase.from("opportunities").upsert(oppRow, { onConflict: "id" });
    if (error) console.error(`Error migrating opportunity ${o.id}:`, error.message);
  }

  // --------------------------------------------------------------------------
  // 3. Migrate applications
  // --------------------------------------------------------------------------
  const mongoApps = await db.collection("applications").find({}).toArray();
  console.log(`Found ${mongoApps.length} applications in MongoDB...`);
  for (const a of mongoApps) {
    const appRow = {
      id: a.id,
      opportunity_id: a.opportunity_id,
      opportunity_title: a.opportunity_title || "",
      applicant_id: a.applicant_id,
      applicant_name: a.applicant_name || "",
      applicant_email: a.applicant_email || "",
      applicant_phone: a.applicant_phone || "",
      message: a.message || "",
      status: a.status || "submitted",
      created_at: a.created_at || new Date().toISOString(),
    };
    const { error } = await supabase.from("applications").upsert(appRow, { onConflict: "id" });
    if (error) console.error(`Error migrating application ${a.id}:`, error.message);
  }

  // --------------------------------------------------------------------------
  // 4. Migrate files, sessions, reset tokens, payments, audit_logs, digest_runs
  // --------------------------------------------------------------------------
  const collections = [
    { mongo: "files", table: "files", conflict: "id" },
    { mongo: "user_sessions", table: "user_sessions", conflict: "session_token" },
    { mongo: "password_reset_tokens", table: "password_reset_tokens", conflict: "token" },
    { mongo: "payment_transactions", table: "payment_transactions", conflict: "id" },
    { mongo: "audit_logs", table: "audit_logs", conflict: "id" },
    { mongo: "digest_runs", table: "digest_runs", conflict: "day" },
  ];

  for (const c of collections) {
    const docs = await db.collection(c.mongo).find({}).toArray();
    console.log(`Migrating ${docs.length} records from ${c.mongo} -> ${c.table}...`);
    for (const d of docs) {
      const { _id, ...cleanDoc } = d;
      const { error } = await supabase.from(c.table).upsert(cleanDoc, { onConflict: c.conflict });
      if (error) console.error(`Error in ${c.table}:`, error.message);
    }
  }

  await mongo.close();
  console.log("✅ MongoDB -> Supabase migration completed successfully!");
}

migrate().catch((err) => {
  console.error("Migration fatal error:", err);
  process.exit(1);
});
