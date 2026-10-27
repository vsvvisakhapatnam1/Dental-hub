# Dental Hub Pro — Product Requirements Document (PRD)

Website: https://dentalhubpro.com
Owner contact: vsv.visakhapatnam@gmail.com · WhatsApp +91-89519 50389
Document date: 2026-10-25

---

## 1. Product Overview
Dental Hub Pro is a two-sided marketplace for India's dental industry. It connects **dental professionals and learners (Seekers)** with **clinics, hospitals, institutions, dental labs, suppliers and service providers (Givers)**. Everything happens on one platform: jobs, practice partnerships, clinic space, courses, equipment, clinic design and dental services.

## 2. Website Goal
1. **Be India's single destination for every dental opportunity.** Jobs, associateships, partnerships, clinic space for rent or sale, courses, equipment, lab work and clinic design all in one trusted place.
2. **Make registration simple and verified.** Seekers and Givers each get a tailored registration form with the right mandatory details. For example: CV for Seekers, and GST Number plus testimonials for Designer Engineering firms.
3. **Help the Dental Hub Pro team respond quickly.** The team gets instant alerts, a 9 AM daily digest, a follow-up tracker and a secure confidential records area, so every registrant is contacted.
4. **Build trust and grow the network.** Public directories show professional details without exposing private contact data. QR codes, flyers and WhatsApp chat help the community grow offline and online.
5. **Earn revenue later.** Paid listing packages are built in (currently hidden) and can be switched on when the business is ready.

## 3. Target Audience

### 3.1 Seekers ("I'm Looking For")
| Segment | What they want |
|---|---|
| BDS / MDS dentists (freshers & experienced) | Jobs, associate roles, consultant visits |
| Dental students & interns | Internships, courses, observerships |
| Dental specialists (Ortho, Endo, Prostho, Perio, OMFS, Pedo, etc.) | Consultant / visiting specialist roles, partnerships |
| Dentists planning their own practice | Clinic space, partnerships, clinic design, equipment |
| Dental assistants, hygienists, technicians, front-office staff | Jobs in clinics and labs |
| Dentists looking abroad | Abroad opportunities and guidance |

### 3.2 Givers ("I'm Offering" / Post Opportunity)
| Segment | What they offer |
|---|---|
| Dental clinics & multi-speciality chains | Jobs, associateships, chair rental, partnerships |
| Dental hospitals & colleges | Faculty roles, courses, internships |
| Dental labs | Lab services, technician jobs |
| Equipment & material suppliers | Equipment, products |
| **Designer Engineering firms** (clinic interior / architecture / engineering) | Clinic design and setup (GST + testimonials required) |
| Recruitment agencies & dental service providers | Placements, services |
| Training institutes | Courses, CDE programmes |

### 3.3 Internal Users
- **Dental Hub Pro staff / admins**: only three authorised emails can log in. They moderate listings, follow up with registrants and access confidential records.

### 3.4 Geography
India-first (pan-India, with strong focus on Andhra Pradesh / Visakhapatnam), with abroad opportunities as a category.

## 4. Core Features (Implemented)

### 4.1 Public Website
- Home page with "I'm Looking For" and "I'm Offering" entry points and quick category picks
- Find Opportunities and opportunity detail pages
- Dentist Directory and Clinic Directory (private contact details hidden)
- Clinic Design, Products, About, Team and Contact pages
- WhatsApp chat widget with assistant avatar and auto greeting
- QR-code Join page and printable flyer

### 4.2 Registration
- Separate guided multi-step forms for **Seekers** and **Givers**
- Mandatory fields: name, email, phone, city, address, pincode and preferred location
- Seekers upload a **CV** (PDF/DOC, stored securely)
- **Designer Engineering** Givers must give a **GST Number** (validated GSTIN format) and **1–5 testimonials as references** (client name, contact and feedback)

### 4.3 Automated Communication
- Thank-you email to every registrant: "Thank you for Registering In Dental Hub Pro and Our Team will reach you shortly", plus a short summary
- WhatsApp thank-you message through the Meta WhatsApp Cloud API (built; waiting on Meta account approval)
- Instant team alert email for each new registration
- Daily signup digest email at 9:00 AM IST

### 4.4 Admin Area (Staff Only)
- Staff-only login (email + password, or Google sign-in) restricted to 3 authorised emails
- Forgot / reset password by email (single-use link, valid 60 minutes)
- Admin Dashboard: listing moderation, verification, users and applications
- **Follow-Ups tracker**: Contacted / Not contacted status, notes, who contacted and when
- **Confidential Records** page behind a second password: full Seeker and Giver details, CVs, GST numbers and testimonials
- Google Sheet & Drive sync status card with a "Sync now" button

### 4.5 Payments (Built, Hidden)
- Pricing & listing packages page with Stripe Checkout (test mode). Hidden from the menu for future use.

## 5. Non-Functional Requirements
- **Security:** hashed passwords (bcrypt), secure session tokens, staff-only login allowlist, second password for confidential data. Private information (email, phone, address, CV, GST, testimonials) is never shown on public pages. Security audit findings are fixed: XSS, open redirect, PII leaks.
- **Privacy:** CVs are stored in private object storage and only staff can access them.
- **Mobile-first:** fully responsive on phones and tablets.
- **Reliability:** registration always succeeds even if email, WhatsApp or Sheet sync is temporarily unavailable.

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 3, shadcn/ui components, Framer Motion (animations), Lucide icons, Axios, Sonner (notifications) |
| Backend | Python FastAPI (async REST API, all routes under `/api`), Pydantic validation |
| Database | MongoDB (Motor async driver) |
| Authentication | Email + password (bcrypt hashing) with secure session tokens (cookie + Bearer); Emergent-managed Google Sign-in; staff allowlist |
| File storage | Emergent Object Storage (private CV uploads) |
| Email | Resend (Emergent-managed): welcome, team alerts, password reset, daily digest |
| WhatsApp | Meta WhatsApp Cloud API (template message `registration_thank_you`) |
| Scheduled jobs | Emergent platform cron (daily 9 AM IST digest) |
| Google integration | Google Apps Script web app → Google Sheets (registrations) + Google Drive (CVs) |
| Payments | Stripe Checkout (test mode, hidden) |
| Other | QR-code generation (Python `qrcode`), Playwright (printable flyer) |
| Hosting | Emergent cloud deployment (Kubernetes), custom domain dentalhubpro.com |

## 7. Data Model (Main Collections)
- **users**: role (admin / seeker / giver), name, email, phone, city, address, pincode, profile type, qualification, speciality, looking_for / offering, organisation details, CV link, GST number, testimonials, follow-up status, message delivery status
- **opportunities**: title, category / type, location, compensation, status, poster
- **applications**: seeker applications to opportunities
- **payment_transactions**: Stripe session, package, amount, status
- **password_reset_tokens**, **user_sessions**, **digest_runs**, **files**

## 8. Pending / Waiting on Owner
| Item | What's needed |
|---|---|
| Google Sheet & Drive sync | Apps Script web-app link (`https://script.google.com/macros/s/.../exec`) |
| WhatsApp thank-you message | Meta permanent access token + Phone Number ID, plus an approved template |
| Supabase secure data copy | Owner's choice of setup and Supabase project details |
| Live payments | Stripe India live account (when payments are switched on) |
| Security | Rotate default admin, staff and confidential passwords in production secrets |

## 9. Roadmap
- **Phase 2:** "I'm Both" user type (Seeker + Giver), public Seeker/Giver login and personal dashboards, Practice Partnerships, Courses / Education module
- **Phase 3:** AI matching between Seekers and Opportunities, verified badges (e.g. GST Verified), CSV export from admin, reviews and ratings, switch on paid listings
