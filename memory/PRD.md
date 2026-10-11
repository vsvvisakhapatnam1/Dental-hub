# Dental Hub Pro — PRD

## Original problem statement
"Dental Opportunity Hub" – a two-sided marketplace connecting dental professionals (Seekers) with clinics, institutions and service providers (Givers). Categories: Jobs, Practice Partnerships, Clinic Space, Courses, Services. MVP: Seeker/Giver registration, public directory, opportunity listings, admin management.

## Architecture
React + FastAPI (`/app/backend/server.py`) + MongoDB. Opaque session tokens (cookie + Bearer). Integrations: Emergent Object Storage (CVs), Stripe (test mode), Emergent Google Auth (staff only), Google Sheets sync (inactive, no creds), Emergent Resend email (`email_service.py`).

## Implemented
- MVP: registration flows, directory, opportunities, admin dashboard + confidential page, WhatsApp widget, QR/Join/Flyer, Stripe pricing, security fixes, Google sign-in (staff only)
- 2026-10-10: Forgot/reset password for staff via real email (Resend, sender "Dental Hub Pro", reply-to vsv.visakhapatnam@gmail.com). Single-use 60-min tokens, 60s resend throttle, sessions revoked on reset. Admin seed no longer overwrites a reset password.
- 2026-10-10: Pricing & Plans hidden from menu (/pricing route kept for later)

- 2026-10-11: Google Sheet + Drive sync through Google Apps Script web app (`/app/docs/google_apps_script.gs`). Backend env GOOGLE_APPS_SCRIPT_URL + GAS_SHARED_SECRET. Seekers go to the "Seeker list" tab and Givers to "Giver list"; seeker CVs are uploaded to the Drive folder "Dental Hub Pro - CVs", and the Drive link goes into the Resume/CV column. Duplicates are skipped by Record ID. Existing users are backfilled on startup (users.sheet_synced flag). Admin dashboard has a sync card with status and a Sync now button (GET /api/admin/sheets/status, POST /api/admin/sheets/sync). Service-account sync is kept as a fallback. Tested against a local mock only.
- 2026-10-11: Removed 13 leftover test accounts and 2 TEST listings so they don't reach the real Sheet.

- 2026-10-11: Registration welcome. After every Seeker/Giver signup, an email is sent through Resend with the thank-you line plus a short summary (name, role, city). A WhatsApp template message is also sent through the Meta Cloud API (`whatsapp.py`; template `registration_thank_you`, language `en`, 1 body variable = name). WhatsApp does nothing until META_ACCESS_TOKEN and META_PHONE_NUMBER_ID are set. Results are saved on the user as welcome_email_status and whatsapp_status.

- 2026-10-11: Team signup alert. Each Seeker/Giver registration sends an email to TEAM_ALERT_EMAIL (vsv.visakhapatnam@gmail.com) with name, org, role, phone, email, city and an admin dashboard link. Result is saved on the user as team_alert_status.

- 2026-10-11: Daily signup digest. A platform cron (`.emergent/crons.yml`, 09:00 Asia/Kolkata) calls POST /api/cron/signup-digest (Bearer WEBHOOK_CRON_SECRET). It emails TEAM_ALERT_EMAIL a list of the previous IST day's Seekers and Givers (name, phone, city, email). Sends at most once per day (digest_runs.day unique).

## Decisions
- Login (email + Google) stays STAFF ONLY; no brute-force lockout (user choice)

## Backlog
- P0: User to deploy Apps Script and share the web-app URL, then set GOOGLE_APPS_SCRIPT_URL in preview .env and production secrets
- P0: User to set up Meta WhatsApp Cloud API (number +91-89519 50389), get the template approved, and send META_ACCESS_TOKEN + META_PHONE_NUMBER_ID. Blocked: new WhatsApp Business account cannot generate a token yet (needs Meta Business verification / System User)
- P1: Stripe live key (India) when payments are re-enabled
- P1: "I'm Both" user type; Phase 2/3 marketplace expansion
- P2: CSV export from admin confidential; real Team page content
- Security: rotate ADMIN/STAFF/CONFIDENTIAL passwords and JWT_SECRET in production secrets
