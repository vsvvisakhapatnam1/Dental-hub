# Dental Hub Pro — Next.js Platform

A modern, specialised dental career, practice, and services platform built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, **Radix UI**, and **TanStack Query**.

Designed as a self-contained, high-performance web application optimized for one-click deployment on **Vercel**.

---

## ✨ Features

- **Opportunities Marketplace**: Search and filter by category (Associate Dentist, Consultant Positions, Practice Partnerships, Clinic Space, MDS Admissions, Courses, Abroad Opportunities).
- **Dentist & Clinic Directories**: Verified directory profiles with qualifications, specialities, facilities, and contact methods.
- **Practice Postings**: Easy-to-use posting workflow with preview and interactive applications.
- **Admin & User Dashboards**: Manage listings, verify credentials, track applications, and view analytics.
- **Self-Contained Data Architecture**: In-memory and local client persistence with realistic seed data — runs out-of-the-box without requiring an external database or Python server.
- **Fully Responsive**: Mobile-first design with responsive navigation drawer, interactive modals, and optimized card grids.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+

### Installation

```bash
npm install --legacy-peer-deps
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## ⚡ Deploying to Vercel

This repository is structured with `package.json` at the root directory.

1. Connect this repository to your **Vercel** account.
2. Vercel will automatically detect the **Next.js** framework preset.
3. Click **Deploy**. No additional environment variables or external backend services are required.
