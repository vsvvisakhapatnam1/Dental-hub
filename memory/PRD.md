# Dental Hub Pro — PRD

## Original problem statement
"Dental Opportunity Hub" – a two-sided marketplace connecting dental professionals (Seekers) with clinics, institutions and service providers (Givers). Categories: Jobs, Practice Partnerships, Clinic Space, Courses, Services. MVP: Seeker/Giver registration, public directory, opportunity listings, admin management.

## Architecture
React + FastAPI (`/app/backend/server.py`) + MongoDB. Opaque session tokens (cookie + Bearer). Integrations: Emergent Object Storage (CVs), Stripe (test mode), Emergent Google Auth (staff only), Google Sheets sync (inactive, no creds), Emergent Resend email (`email_service.py`).

## Implemented
- MVP: registration flows, directory, opportunities, admin dashboard + confidential page, WhatsApp widget, QR/Join/Flyer, Stripe pricing, security fixes, Google sign-in (staff only)
- 2026-10-10: Forgot/reset password for staff via real email (Resend, sender "Dental Hub Pro", reply-to vsv.visakhapatnam@gmail.com). Single-use 60-min tokens, 60s resend throttle, sessions revoked on reset. Admin seed no longer overwrites a reset password.
- 2026-10-10: Pricing & Plans hidden from menu (/pricing route kept for later)

## Decisions
- Login (email + Google) stays STAFF ONLY; no brute-force lockout (user choice)

## Backlog
- P1: Google Sheets + Drive (CV files) sync to vsv.visakhapatnam@gmail.com — waiting on service account JSON, Sheet ID, Drive folder ID
- P1: Stripe live key (India) when payments are re-enabled
- P1: "I'm Both" user type; Phase 2/3 marketplace expansion
- P2: CSV export from admin confidential; real Team page content
- Security: rotate ADMIN/STAFF/CONFIDENTIAL passwords and JWT_SECRET in production secrets
