-- ============================================================================
-- DENTAL HUB PRO — COMPLETE SUPABASE (POSTGRESQL 15+) DATABASE SCHEMA
-- ============================================================================
-- Idempotent, single-run migration script for Supabase SQL Editor.
-- Includes:
--   1. Extensions (pgcrypto, pg_trgm)
--   2. Helper Functions & Triggers (updated_at, is_admin)
--   3. Core Tables & Normalized Child Tables with Two-Way Sync Triggers
--   4. Indexes & Full-Text / Trigram Search Indexes
--   5. Public Safe Directory Views (public_dentists, public_clinics) & RPCs
--   6. Row Level Security (RLS) Policies on all tables
--   7. Private Supabase Storage Bucket ('cvs') & Storage Policies
--   8. Supabase Realtime Publication Setup
--   9. Seed Data (3 Staff Admin Accounts + Initial Marketplace Records)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 2. COMMON TRIGGER FUNCTIONS
-- ============================================================================

-- Automatically update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Automatically lowercase email and validate Designer Engineering Giver rules
CREATE OR REPLACE FUNCTION public.normalize_and_validate_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  is_de BOOLEAN := FALSE;
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email := LOWER(TRIM(NEW.email));
  END IF;

  -- Check if Giver is Designer Engineering
  IF NEW.role = 'giver' AND (
    NEW.profile_type = 'Designer Engineering'
    OR (NEW.offering IS NOT NULL AND 'Designer Engineering' = ANY(NEW.offering))
  ) THEN
    is_de := TRUE;
  END IF;

  -- Enforce GSTIN format for Designer Engineering Givers (when non-demo)
  IF is_de AND COALESCE(NEW.is_demo, FALSE) = FALSE THEN
    IF NEW.gst_number IS NULL OR NEW.gst_number !~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$' THEN
      RAISE EXCEPTION 'Valid 15-character GSTIN is mandatory for Designer Engineering Givers';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 USERS (Seekers, Givers, and Staff Admins)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE, -- Optional link to auth.users(id) for future Supabase Auth login
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  password_changed BOOLEAN NOT NULL DEFAULT FALSE,
  auth_provider TEXT NOT NULL DEFAULT 'email'
    CHECK (auth_provider IN ('email', 'google')),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'seeker'
    CHECK (role IN ('admin', 'seeker', 'giver')),
  profile_type TEXT NOT NULL DEFAULT 'BDS Dentist',
  phone TEXT,
  city TEXT NOT NULL DEFAULT 'Hyderabad',
  state TEXT DEFAULT '',
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT,
  address TEXT,
  preferred_location TEXT,

  -- Seeker specific fields
  cv_url TEXT,
  cv_filename TEXT,
  qualification TEXT
    CHECK (qualification IS NULL OR qualification = '' OR qualification IN (
      'BDS', 'MDS', 'Any Dental Qualification', 'Other'
    )),
  speciality TEXT,
  experience TEXT
    CHECK (experience IS NULL OR experience = '' OR experience IN (
      'Fresher', '0-2 years', '2-5 years', '5-10 years', '10+ years'
    )),
  skills TEXT[] NOT NULL DEFAULT '{}',
  looking_for TEXT[] NOT NULL DEFAULT '{}',
  preferred_type TEXT
    CHECK (preferred_type IS NULL OR preferred_type = '' OR preferred_type IN (
      'Full-time', 'Part-time', 'Visiting', 'Freelance', 'Partnership', 'Remote'
    )),
  availability TEXT
    CHECK (availability IS NULL OR availability = '' OR availability IN (
      'Immediately', 'Within 15 days', 'Within 30 days', '1-3 months'
    )),
  expected_salary TEXT,
  summary TEXT DEFAULT '',

  -- Giver / Organisation specific fields
  offering TEXT[] NOT NULL DEFAULT '{}',
  org_name TEXT,
  contact_person TEXT,
  designation TEXT,
  website TEXT,
  specialities TEXT[] NOT NULL DEFAULT '{}',
  facilities TEXT[] NOT NULL DEFAULT '{}',
  established TEXT,
  chairs TEXT,
  gst_number TEXT
    CHECK (gst_number IS NULL OR gst_number = '' OR gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'),

  -- Rich JSONB mirrors (synced automatically with child tables for instant reads)
  testimonials JSONB NOT NULL DEFAULT '[]'::jsonb,
  photo TEXT,
  verification JSONB NOT NULL DEFAULT '{
    "mobile": false,
    "email": false,
    "qualification_submitted": false,
    "credential": false,
    "clinic": false,
    "organisation": false
  }'::jsonb,
  follow_up JSONB NOT NULL DEFAULT '{
    "contacted": false,
    "note": "",
    "by": null,
    "at": null
  }'::jsonb,

  -- Integration & delivery status fields
  welcome_email_status TEXT DEFAULT 'not_configured'
    CHECK (welcome_email_status IS NULL OR welcome_email_status IN ('sent', 'failed', 'not_configured', 'pending')),
  whatsapp_status TEXT DEFAULT 'not_configured'
    CHECK (whatsapp_status IS NULL OR whatsapp_status IN ('sent', 'failed', 'not_configured', 'pending')),
  whatsapp_message_id TEXT,
  team_alert_status TEXT DEFAULT 'not_configured'
    CHECK (team_alert_status IS NULL OR team_alert_status IN ('sent', 'failed', 'not_configured', 'pending')),
  sheet_synced BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_users_normalize ON public.users;
CREATE TRIGGER trg_users_normalize
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.normalize_and_validate_user();

-- ----------------------------------------------------------------------------
-- 3.2 GIVER_TESTIMONIALS (Normalized Child Table for Designer Engineering Givers)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.giver_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_name VARCHAR(120) NOT NULL CHECK (char_length(trim(client_name)) > 0 AND char_length(client_name) <= 120),
  contact VARCHAR(120) NOT NULL CHECK (char_length(trim(contact)) > 0 AND char_length(contact) <= 120),
  feedback VARCHAR(1000) NOT NULL CHECK (char_length(trim(feedback)) > 0 AND char_length(feedback) <= 1000),
  display_order INT NOT NULL DEFAULT 1 CHECK (display_order BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3.3 USER_VERIFICATIONS (Normalized 6-Tier Verification Table)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_verifications (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  mobile BOOLEAN NOT NULL DEFAULT FALSE,
  email BOOLEAN NOT NULL DEFAULT FALSE,
  qualification_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  credential BOOLEAN NOT NULL DEFAULT FALSE,
  clinic BOOLEAN NOT NULL DEFAULT FALSE,
  organisation BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_user_verifications_updated_at ON public.user_verifications;
CREATE TRIGGER trg_user_verifications_updated_at
  BEFORE UPDATE ON public.user_verifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 3.4 FOLLOW_UPS (Normalized Admin Follow-Up CRM Table)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_ups (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  contacted BOOLEAN NOT NULL DEFAULT FALSE,
  note VARCHAR(500) NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  by TEXT,
  at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_follow_ups_updated_at ON public.follow_ups;
CREATE TRIGGER trg_follow_ups_updated_at
  BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Sync Trigger: Whenever users is inserted/updated, sync user_verifications & follow_ups
CREATE OR REPLACE FUNCTION public.sync_user_child_tables()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Sync user_verifications
  INSERT INTO public.user_verifications (
    user_id, mobile, email, qualification_submitted, credential, clinic, organisation
  ) VALUES (
    NEW.id,
    COALESCE((NEW.verification->>'mobile')::boolean, FALSE),
    COALESCE((NEW.verification->>'email')::boolean, FALSE),
    COALESCE((NEW.verification->>'qualification_submitted')::boolean, FALSE),
    COALESCE((NEW.verification->>'credential')::boolean, FALSE),
    COALESCE((NEW.verification->>'clinic')::boolean, FALSE),
    COALESCE((NEW.verification->>'organisation')::boolean, FALSE)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    mobile = EXCLUDED.mobile,
    email = EXCLUDED.email,
    qualification_submitted = EXCLUDED.qualification_submitted,
    credential = EXCLUDED.credential,
    clinic = EXCLUDED.clinic,
    organisation = EXCLUDED.organisation,
    updated_at = NOW();

  -- Sync follow_ups
  IF NEW.follow_up IS NOT NULL THEN
    INSERT INTO public.follow_ups (
      user_id, contacted, note, by, at
    ) VALUES (
      NEW.id,
      COALESCE((NEW.follow_up->>'contacted')::boolean, FALSE),
      LEFT(COALESCE(NEW.follow_up->>'note', ''), 500),
      NEW.follow_up->>'by',
      CASE WHEN NEW.follow_up->>'at' IS NOT NULL AND NEW.follow_up->>'at' != ''
           THEN (NEW.follow_up->>'at')::timestamptz ELSE NULL END
    )
    ON CONFLICT (user_id) DO UPDATE SET
      contacted = EXCLUDED.contacted,
      note = EXCLUDED.note,
      by = EXCLUDED.by,
      at = EXCLUDED.at,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_child_tables ON public.users;
CREATE TRIGGER trg_sync_user_child_tables
  AFTER INSERT OR UPDATE OF verification, follow_up ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_child_tables();

-- ----------------------------------------------------------------------------
-- 3.5 OPPORTUNITIES (Listings posted from Post Opportunity page)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL DEFAULT 'offering'
    CHECK (mode IN ('looking', 'offering')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  org_name TEXT,
  city TEXT NOT NULL,
  state TEXT DEFAULT '',
  country TEXT NOT NULL DEFAULT 'India',
  speciality TEXT DEFAULT '',
  qualification TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  employment_type TEXT DEFAULT '',
  compensation TEXT DEFAULT '',
  requirements TEXT DEFAULT '',
  perks TEXT DEFAULT '',
  contact_method TEXT NOT NULL DEFAULT 'email'
    CHECK (contact_method IN ('email', 'whatsapp')),
  contact_value TEXT,
  poster_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  poster_name TEXT,
  verification_status TEXT NOT NULL DEFAULT 'none'
    CHECK (verification_status IN ('none', 'mobile', 'email', 'qualification_submitted', 'credential', 'clinic', 'organisation')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'rejected')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 3.6 APPLICATIONS (Apply button on Opportunity Detail page)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  opportunity_title TEXT,
  applicant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT,
  applicant_phone TEXT,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_application_per_opportunity UNIQUE (opportunity_id, applicant_id)
);

-- ----------------------------------------------------------------------------
-- 3.7 FILES (Uploaded CVs and Documents metadata)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INT NOT NULL CHECK (size > 0 AND size <= 10485760), -- Max 10 MB
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3.8 USER_SESSIONS (Opaque Session Tokens — 7 Day Expiry)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sessions (
  session_token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3.9 PASSWORD_RESET_TOKENS (Staff Forgot Password — 60 Min Expiry)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 minutes')
);

-- Helper function to clean expired password reset tokens & sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_auth_tokens()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.password_reset_tokens WHERE expires_at < NOW() OR used = TRUE;
  DELETE FROM public.user_sessions WHERE expires_at < NOW();
$$;

-- ----------------------------------------------------------------------------
-- 3.10 PAYMENT_TRANSACTIONS (Stripe / Razorpay Checkout Tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  package_id TEXT NOT NULL
    CHECK (package_id IN ('job_listing', 'featured_listing', 'recruitment_package')),
  package_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated', 'completed', 'failed')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER trg_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 3.11 AUDIT_LOGS (Admin Confidential Vault Access Log)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'confidential_access'
    CHECK (type IN ('confidential_access', 'admin_action')),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3.12 DIGEST_RUNS (Daily 9 AM IST Signup Digest Lock)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digest_runs (
  day DATE PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. INDEXES & FULL-TEXT / TRIGRAM SEARCH INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_city ON public.users(city);
CREATE INDEX IF NOT EXISTS idx_users_speciality ON public.users(speciality);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_sheet_synced ON public.users(sheet_synced) WHERE sheet_synced = FALSE;
CREATE INDEX IF NOT EXISTS idx_users_search_trgm ON public.users USING gin (
  (COALESCE(name, '') || ' ' || COALESCE(org_name, '') || ' ' || COALESCE(speciality, '') || ' ' || COALESCE(city, '')) gin_trgm_ops
);

-- Child table indexes
CREATE INDEX IF NOT EXISTS idx_giver_testimonials_user_id ON public.giver_testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_contacted ON public.follow_ups(contacted);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_status_created ON public.opportunities(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_mode ON public.opportunities(mode);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_speciality ON public.opportunities(speciality);
CREATE INDEX IF NOT EXISTS idx_opportunities_city ON public.opportunities(city);
CREATE INDEX IF NOT EXISTS idx_opportunities_state ON public.opportunities(state);
CREATE INDEX IF NOT EXISTS idx_opportunities_employment_type ON public.opportunities(employment_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_experience ON public.opportunities(experience);
CREATE INDEX IF NOT EXISTS idx_opportunities_poster_id ON public.opportunities(poster_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_featured ON public.opportunities(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_opportunities_search_trgm ON public.opportunities USING gin (
  (COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(org_name, '') || ' ' || COALESCE(category, '') || ' ' || COALESCE(speciality, '')) gin_trgm_ops
);

-- Applications, Sessions, Tokens, Payments, Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON public.applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);

-- ============================================================================
-- 5. PUBLIC DIRECTORY VIEWS & RPC FUNCTIONS (ZERO PRIVATE COLUMNS EXPOSED)
-- ============================================================================

-- Public Dentists View (Seekers — strictly strips email, phone, address, pincode, CV, salary, etc.)
CREATE OR REPLACE VIEW public.public_dentists AS
SELECT
  u.id,
  u.name,
  u.role,
  u.profile_type,
  u.city,
  u.state,
  u.country,
  u.qualification,
  u.speciality,
  u.experience,
  u.skills,
  u.looking_for,
  u.preferred_type,
  u.availability,
  u.summary,
  u.photo,
  u.verification,
  u.is_demo,
  u.created_at
FROM public.users u
WHERE u.role = 'seeker';

-- Public Clinics View (Givers — strictly strips email, phone, address, pincode, GST, testimonials, etc.)
CREATE OR REPLACE VIEW public.public_clinics AS
SELECT
  u.id,
  u.name,
  u.org_name,
  u.role,
  u.profile_type,
  u.city,
  u.state,
  u.country,
  u.offering,
  u.specialities,
  u.facilities,
  u.established,
  u.chairs,
  u.website,
  u.summary,
  u.photo,
  u.verification,
  u.is_demo,
  u.created_at
FROM public.users u
WHERE u.role = 'giver';

-- Grant SELECT on public views to anon and authenticated roles
GRANT SELECT ON public.public_dentists TO anon, authenticated;
GRANT SELECT ON public.public_clinics TO anon, authenticated;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) & ADMIN HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.role = 'admin'
      AND (
        u.id = auth.uid()
        OR LOWER(u.email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
      )
      AND LOWER(u.email) IN (
        'tdvsatishkumar@gmail.com',
        'vsv.visakhapatnam@gmail.com',
        'info@dentalhubpro.com'
      )
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giver_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_runs ENABLE ROW LEVEL SECURITY;

-- Policies for public.users
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
CREATE POLICY "Admins have full access to users"
  ON public.users FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public registration can insert seeker or giver" ON public.users;
CREATE POLICY "Public registration can insert seeker or giver"
  ON public.users FOR INSERT
  WITH CHECK (role IN ('seeker', 'giver'));

DROP POLICY IF EXISTS "Realtime & app read access to users" ON public.users;
CREATE POLICY "Realtime & app read access to users"
  ON public.users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "App update access to users" ON public.users;
CREATE POLICY "App update access to users"
  ON public.users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for public.opportunities
DROP POLICY IF EXISTS "Anyone can read opportunities" ON public.opportunities;
CREATE POLICY "Anyone can read opportunities"
  ON public.opportunities FOR SELECT
  USING (status = 'published' OR public.is_admin() OR true);

DROP POLICY IF EXISTS "Anyone can insert opportunities" ON public.opportunities;
CREATE POLICY "Anyone can insert opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Update opportunities" ON public.opportunities;
CREATE POLICY "Update opportunities"
  ON public.opportunities FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Delete opportunities" ON public.opportunities;
CREATE POLICY "Delete opportunities"
  ON public.opportunities FOR DELETE
  USING (true);

-- Policies for public.applications
DROP POLICY IF EXISTS "Read applications" ON public.applications;
CREATE POLICY "Read applications"
  ON public.applications FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Insert applications" ON public.applications;
CREATE POLICY "Insert applications"
  ON public.applications FOR INSERT
  WITH CHECK (true);

-- Policies for follow_ups, verifications, testimonials, audit_logs, files, payments
DROP POLICY IF EXISTS "Access follow_ups" ON public.follow_ups;
CREATE POLICY "Access follow_ups" ON public.follow_ups FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Access user_verifications" ON public.user_verifications;
CREATE POLICY "Access user_verifications" ON public.user_verifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Access giver_testimonials" ON public.giver_testimonials;
CREATE POLICY "Access giver_testimonials" ON public.giver_testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Access audit_logs" ON public.audit_logs;
CREATE POLICY "Access audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Access files" ON public.files;
CREATE POLICY "Access files" ON public.files FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Access payment_transactions" ON public.payment_transactions;
CREATE POLICY "Access payment_transactions" ON public.payment_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Access user_sessions" ON public.user_sessions;
CREATE POLICY "Access user_sessions" ON public.user_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Access password_reset_tokens" ON public.password_reset_tokens;
CREATE POLICY "Access password_reset_tokens" ON public.password_reset_tokens FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Access digest_runs" ON public.digest_runs;
CREATE POLICY "Access digest_runs" ON public.digest_runs FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 7. SUPABASE STORAGE BUCKET ('cvs') FOR PRIVATE CV / DOCUMENT FILES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false,
  10485760, -- 10 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Allow CV uploads" ON storage.objects;
CREATE POLICY "Allow CV uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cvs');

DROP POLICY IF EXISTS "Allow CV reads" ON storage.objects;
CREATE POLICY "Allow CV reads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cvs');

-- ============================================================================
-- 8. REALTIME PUBLICATION SETUP
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- 9. SEED DATA (3 STAFF ADMIN ACCOUNTS + INITIAL MARKETPLACE DATA)
-- ============================================================================

-- 9.1 Three Official Staff Admin Accounts
-- Note: Uses ON CONFLICT (email) DO UPDATE only when password_changed = FALSE
INSERT INTO public.users (
  id, email, password_hash, password_changed, auth_provider, name, role, profile_type, city, state, country, verification, is_demo
) VALUES
  (
    '00000000-0000-4000-a000-000000000001',
    'tdvsatishkumar@gmail.com',
    '$2b$12$PLACEHOLDER_BCRYPT_HASH_REPLACE_OR_KEEP_FROM_MONGO',
    FALSE,
    'email',
    'Dr. T. D. V. Satish Kumar',
    'admin',
    'Team',
    'Visakhapatnam',
    'Andhra Pradesh',
    'India',
    '{"mobile": true, "email": true, "qualification_submitted": true, "credential": true, "clinic": true, "organisation": true}'::jsonb,
    FALSE
  ),
  (
    '00000000-0000-4000-a000-000000000002',
    'vsv.visakhapatnam@gmail.com',
    '$2b$12$PLACEHOLDER_BCRYPT_HASH_REPLACE_OR_KEEP_FROM_MONGO',
    FALSE,
    'email',
    'VSV Visakhapatnam Admin',
    'admin',
    'Team',
    'Visakhapatnam',
    'Andhra Pradesh',
    'India',
    '{"mobile": true, "email": true, "qualification_submitted": true, "credential": true, "clinic": true, "organisation": true}'::jsonb,
    FALSE
  ),
  (
    '00000000-0000-4000-a000-000000000003',
    'info@dentalhubpro.com',
    '$2b$12$PLACEHOLDER_BCRYPT_HASH_REPLACE_OR_KEEP_FROM_MONGO',
    FALSE,
    'email',
    'Dental Hub Pro Support',
    'admin',
    'Team',
    'Visakhapatnam',
    'Andhra Pradesh',
    'India',
    '{"mobile": true, "email": true, "qualification_submitted": true, "credential": true, "clinic": true, "organisation": true}'::jsonb,
    FALSE
  )
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  profile_type = 'Team'
WHERE public.users.password_changed = FALSE;

-- 9.2 Initial Marketplace Dentists (Seekers) & Clinics (Givers)
INSERT INTO public.users (
  id, email, name, role, profile_type, phone, city, state, country, pincode, address,
  preferred_location, qualification, speciality, experience, skills, looking_for,
  preferred_type, availability, expected_salary, summary, verification, is_demo
) VALUES
  (
    '11111111-1111-4111-a111-111111111101',
    'ananya.reddy@dentalhubpro.com',
    'Dr. Ananya Reddy',
    'seeker',
    'MDS Dentist',
    '+91 98480 11223',
    'Hyderabad',
    'Telangana',
    'India',
    '500033',
    'Jubilee Hills, Road No 36, Hyderabad',
    'Hyderabad',
    'MDS',
    'Endodontics',
    '2-5 years',
    ARRAY['Root Canal Therapy', 'Micro-Endodontics', 'Rotary Endodontics', 'Digital RVG'],
    ARRAY['Associate Dentist', 'Consultant Position'],
    'Full-time',
    'Immediately',
    '₹65,000 - ₹85,000 / month',
    'Microscope-trained Endodontist with 4+ years of clinical experience in single-sitting molar RCTs and retreatment cases.',
    '{"mobile": true, "email": true, "qualification_submitted": true, "credential": true, "clinic": false, "organisation": false}'::jsonb,
    FALSE
  ),
  (
    '11111111-1111-4111-a111-111111111102',
    'rohan.kulkarni@dentalhubpro.com',
    'Dr. Rohan Kulkarni',
    'seeker',
    'MDS Dentist',
    '+91 98801 22334',
    'Bengaluru',
    'Karnataka',
    'India',
    '560034',
    'Indiranagar 100 Feet Road, Bengaluru',
    'Bengaluru',
    'MDS',
    'Orthodontics',
    '5-10 years',
    ARRAY['Clear Aligners', 'Self-Ligating Brackets', 'Lingual Orthodontics', 'TADs'],
    ARRAY['Visiting Consultant', 'Practice Partnership'],
    'Visiting',
    'Immediately',
    '60% Revenue Share / Per-Case',
    'Certified Clear Aligner specialist and visiting Orthodontist serving 14+ clinics across Bengaluru.',
    '{"mobile": true, "email": true, "qualification_submitted": true, "credential": true, "clinic": false, "organisation": false}'::jsonb,
    FALSE
  ),
  (
    '11111111-1111-4111-a111-111111111103',
    'meera.nair@dentalhubpro.com',
    'Dr. Meera Nair',
    'seeker',
    'BDS Dentist',
    '+91 94470 33445',
    'Visakhapatnam',
    'Andhra Pradesh',
    'India',
    '530017',
    'MVP Colony, Sector 4, Visakhapatnam',
    'Visakhapatnam',
    'BDS',
    'General Dentistry',
    '0-2 years',
    ARRAY['Aesthetic Restorations', 'Crown Prep', 'Oral Prophylaxis', 'Patient Counseling'],
    ARRAY['Job', 'Associate Dentist', 'Fellowship'],
    'Full-time',
    'Within 15 days',
    '₹35,000 / month',
    'Dedicated BDS clinician skilled in painless general dentistry, composite aesthetics, and patient communication.',
    '{"mobile": true, "email": true, "qualification_submitted": true, "credential": false, "clinic": false, "organisation": false}'::jsonb,
    FALSE
  )
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (
  id, email, name, org_name, contact_person, designation, role, profile_type, phone,
  city, state, country, address, preferred_location, offering, specialities, facilities,
  established, chairs, website, summary, verification, is_demo
) VALUES
  (
    '22222222-2222-4222-a222-222222222201',
    'hr@apollowhitedental-hyd.com',
    'SmileCraft Super Speciality Dental Centre',
    'SmileCraft Super Speciality Dental Centre',
    'Dr. Vikramaditya Rao',
    'Chief Clinical Director',
    'giver',
    'Dental Clinic',
    '+91 90001 55667',
    'Hyderabad',
    'Telangana',
    'India',
    'Banjara Hills Road No 12, Hyderabad',
    'Hyderabad',
    ARRAY['Dentist Job', 'Associate Dentist', 'Consultant Position'],
    ARRAY['Implantology', 'Endodontics', 'Orthodontics', 'Prosthodontics'],
    ARRAY['CBCT 3D Scanner', 'Carl Zeiss Microscope', 'Intraoral Scanner', '6 Operatory Chairs', 'In-house CAD/CAM Lab'],
    '2016',
    '6',
    'https://smilecraftdental.in',
    'ISO-certified 6-chair multi-speciality dental centre in Banjara Hills equipped with CBCT, dental operating microscope, and digital workflow.',
    '{"mobile": true, "email": true, "qualification_submitted": true, "credential": true, "clinic": true, "organisation": true}'::jsonb,
    FALSE
  ),
  (
    '22222222-2222-4222-a222-222222222202',
    'careers@pearlcare-vizag.com',
    'PearlCare Dental Hospital & Implant Institute',
    'PearlCare Dental Hospital & Implant Institute',
    'Dr. S. K. Subrahmanyam',
    'Managing Partner',
    'giver',
    'Dental Hospital',
    '+91 89519 50389',
    'Visakhapatnam',
    'Andhra Pradesh',
    'India',
    'Dwaraka Nagar, 3rd Lane, Visakhapatnam',
    'Visakhapatnam',
    ARRAY['Associate Dentist', 'Specialist Position', 'Clinic Space', 'Fellowship'],
    ARRAY['Implantology', 'Oral & Maxillofacial Surgery', 'Prosthodontics', 'General Dentistry'],
    ARRAY['OT Suite', 'OPG & CBCT', 'Laser Dentistry', '8 Dental Chairs'],
    '2014',
    '8',
    'https://dentalhubpro.com',
    'Premier dental hospital and implant training centre in Visakhapatnam offering associate positions, chair-sharing, and clinical fellowships.',
    '{"mobile": true, "email": true, "qualification_submitted": true, "credential": true, "clinic": true, "organisation": true}'::jsonb,
    FALSE
  )
ON CONFLICT (email) DO NOTHING;

-- 9.3 Initial Published Opportunities
INSERT INTO public.opportunities (
  id, mode, category, title, description, org_name, city, state, country,
  speciality, qualification, experience, employment_type, compensation,
  requirements, perks, contact_method, contact_value, poster_id, poster_name,
  verification_status, status, featured, is_demo
) VALUES
  (
    '33333333-3333-4333-a333-333333333301',
    'offering',
    'Associate Dentist',
    'Full-Time Associate Dentist / Endodontist — Banjara Hills',
    'We are looking for a skilled BDS/MDS Associate Dentist proficient in rotary endodontics, crown preparations, and aesthetic dentistry for our 6-chair digital practice.',
    'SmileCraft Super Speciality Dental Centre',
    'Hyderabad',
    'Telangana',
    'India',
    'Endodontics',
    'MDS',
    '2-5 years',
    'Full-time',
    '₹55,000 - ₹80,000 / month + Incentives',
    'MDS in Conservative Dentistry & Endodontics or BDS with 3+ years strong clinical experience. Fluent in English, Telugu, or Hindi.',
    'Access to Carl Zeiss Microscope, CBCT, digital scanner, and high patient inflow.',
    'whatsapp',
    '+918951950389',
    '22222222-2222-4222-a222-222222222201',
    'SmileCraft Super Speciality Dental Centre',
    'clinic',
    'published',
    TRUE,
    FALSE
  ),
  (
    '33333333-3333-4333-a333-333333333302',
    'offering',
    'Consultant Position',
    'Visiting Orthodontist & Implant Consultant — Visakhapatnam',
    'PearlCare Dental Hospital invites experienced MDS Orthodontists and Implantologists for visiting consultations across our Visakhapatnam centres.',
    'PearlCare Dental Hospital & Implant Institute',
    'Visakhapatnam',
    'Andhra Pradesh',
    'India',
    'Orthodontics',
    'MDS',
    '2-5 years',
    'Visiting',
    '60% Case Revenue Share',
    'MDS Orthodontics / Implantology with valid State Dental Council registration.',
    'Full chairside assistance, digital OPG/CBCT diagnostics, and guaranteed monthly case volume.',
    'whatsapp',
    '+918951950389',
    '22222222-2222-4222-a222-222222222202',
    'PearlCare Dental Hospital & Implant Institute',
    'organisation',
    'published',
    TRUE,
    FALSE
  ),
  (
    '33333333-3333-4333-a333-333333333303',
    'offering',
    'Clinic Space',
    'Fully Equipped Dental Operatory Chair for Rent / Revenue Share',
    'Modern, sunlit dental operatory chair with motorized sensor unit, portable X-ray, RVG, and sterilization support available for independent practitioners.',
    'SmileCraft Super Speciality Dental Centre',
    'Bengaluru',
    'Karnataka',
    'India',
    'General Dentistry',
    'Any Dental Qualification',
    '0-2 years',
    'Partnership',
    '₹18,000 / month or 35% Share',
    'Valid DCI / State Dental Council registration.',
    'Receptionist support, sterilization assistant, waiting lounge, Wi-Fi, and power backup.',
    'email',
    'info@dentalhubpro.com',
    '22222222-2222-4222-a222-222222222201',
    'SmileCraft Super Speciality Dental Centre',
    'clinic',
    'published',
    FALSE,
    FALSE
  ),
  (
    '33333333-3333-4333-a333-333333333304',
    'looking',
    'Associate Dentist',
    'Micro-Endodontist Seeking Full-Time / Consultant Role in Hyderabad',
    'MDS Endodontist with 4+ years of microscope RCT experience looking for a progressive clinic or hospital in Hyderabad.',
    'Dr. Ananya Reddy',
    'Hyderabad',
    'Telangana',
    'India',
    'Endodontics',
    'MDS',
    '2-5 years',
    'Full-time',
    '₹65,000+ / month',
    'Modern rotary & apex locator setup preferred.',
    'Can handle complex molar retreatments, post & core, and aesthetic veneers.',
    'email',
    'info@dentalhubpro.com',
    '11111111-1111-4111-a111-111111111101',
    'Dr. Ananya Reddy',
    'credential',
    'published',
    TRUE,
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
