<div align="center">

# acclownting

### Invoicing for Humans Who Just Want It to Work

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![CI](https://img.shields.io/github/actions/workflow/status/Peleke/acclownting/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/Peleke/acclownting/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Create invoices. Post payments. Run reports. That's it.**

<img src="assets/hero-banner.png" alt="acclownting — Invoicing for Humans Who Just Want It to Work" width="800"/>

[Get Started](#-quick-start) · [Features](#-features) · [Architecture](#-architecture) · [Contributing](#-contributing)

---

</div>

## The Problem

Every invoicing app eventually becomes an ERP. Features creep in. The UI gets buried under dashboards, integrations, automations, and a settings page with 47 tabs. You just wanted to send Sandra an invoice for the clown you hired.

## The Solution

**acclownting** is a multi-user invoicing app that does exactly what you need and nothing else:

- Create client records
- Create invoices with line items, tax, and notes
- Generate printable PDF invoices
- Post payments against invoices (partial or full)
- Run reports: what each client owes, what you've earned, who's overdue
- Role-based access with admin invites and self-service signup

That's the whole product. On purpose.

---

## Features

### Client Management
Create and search clients by name. Each client has a detail page showing contact info, invoice history, and full payment history. One click to create a new invoice pre-filled for that client.

### Invoicing
Create invoices with multiple line items, configurable tax rates, and optional notes. Edit invoices after creation. Override status manually when life doesn't follow the happy path. Download or print PDF invoices that look professional enough to send to actual humans.

### Payments & Status Tracking
Post partial or full payments against any invoice. Invoices automatically transition through `draft > sent > partial > paid` as payments come in. Past-due invoices get flagged as `overdue` automatically. Delete payments if you made a mistake — the balance recalculates.

### Reporting
Two reports, both useful:
- **Revenue Report** — total earned and owed for any date range (defaults to current month)
- **Client Balances** — what each client owes, with overdue clients flagged in red

### Multi-User Auth
Admin users invite new members. Self-service signup available. Session-based auth via Supabase with cookie management. Role-based access control (admin vs. member).

---

## Screenshots

<div align="center">

| Dashboard | Invoice Detail | PDF Output |
|:---:|:---:|:---:|
| *Balances at a glance* | *Line items, payments, status* | *Clean printable PDF* |

> *Screenshots coming soon*

</div>

---

<div align="center">

# Part II: Technical Documentation

*For engineers, contributors, and the curious*

</div>

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                       │
│       Next.js 15 · React 19 · TypeScript · Tailwind     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 API Layer (Next.js App Router)            │
│         Server Components · Route Handlers · RSC         │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Supabase                             │
│     PostgreSQL · Auth · RLS · RPC · Storage              │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | Next.js 15, React 19, TypeScript | App Router, RSC, streaming |
| **Styling** | Tailwind CSS | Utility-first, fast iteration |
| **Database** | Supabase PostgreSQL | RLS, managed auth, RPC functions |
| **PDF** | @react-pdf/renderer | Server-side PDF generation |
| **Validation** | Zod | Runtime type safety at system boundaries |
| **Testing** | Vitest + Playwright | 181 unit/integration + 45 E2E tests |
| **CI/CD** | GitHub Actions + Vercel | Automated typecheck, lint, test, deploy |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Supabase account ([free tier works](https://supabase.com))

### Installation

```bash
git clone https://github.com/Peleke/acclownting.git
cd acclownting
npm install
cp .env.example .env.local
```

### Environment Configuration

```bash
# .env.local

# Required
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (E2E testing)
BYPASS_AUTH=false
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
acclownting/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, signup pages
│   │   ├── (protected)/         # Authenticated routes
│   │   │   ├── dashboard/       # Main dashboard with balances
│   │   │   ├── clients/         # Client CRUD + detail pages
│   │   │   ├── invoices/        # Invoice list, create, edit, detail
│   │   │   ├── reports/         # Revenue + balance reports
│   │   │   └── admin/           # User management (admin only)
│   │   └── api/                 # Route handlers (PDF, admin invite)
│   ├── components/
│   │   ├── ui/                  # Design system primitives
│   │   ├── invoice-form.tsx     # Create/edit invoice form
│   │   ├── client-form.tsx      # Client create/edit modal
│   │   ├── payment-form.tsx     # Payment recording form
│   │   └── report-filters.tsx   # Date range filter controls
│   ├── lib/
│   │   ├── supabase/            # Server + client Supabase factories
│   │   ├── schemas.ts           # Zod validation schemas
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── utils.ts             # Currency formatting, calculations
│   └── tests/
│       ├── components/          # Component unit tests
│       ├── integration/         # API route tests
│       ├── unit/                # Schema + utility tests
│       └── helpers/             # Test mocks and fixtures
├── e2e/                         # Playwright E2E tests
│   └── flows/                   # Multi-page user flow tests
└── supabase/                    # DB schema + seed data
```

---

## Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
npm run typecheck        # TypeScript strict checking

# Testing
npx vitest run           # Run 181 unit/integration tests
npx playwright test      # Run 45 E2E smoke + flow tests

# All checks (what CI runs)
npm run typecheck && npm run lint && npx vitest run && npx playwright test
```

---

## Design Decisions

<details>
<summary><strong>Client-Side Supabase for Mutations</strong></summary>

Forms use the browser Supabase client for inserts/updates. Server components handle reads. This keeps mutations simple (no server actions or API routes for basic CRUD) while server components get the SEO and performance benefits of RSC.
</details>

<details>
<summary><strong>Auto-Overdue Detection on Page Load</strong></summary>

Instead of a database cron job, overdue detection runs when invoice pages load. Pragmatic for the scale this app targets (small businesses, not enterprise). Trades slight latency for zero infrastructure.
</details>

<details>
<summary><strong>BYPASS_AUTH for E2E Testing</strong></summary>

Smoke tests run against the UI with auth bypassed via middleware. Flow tests (payments, status transitions, PDF generation) run against real Supabase. This gives fast CI feedback without sacrificing integration confidence.
</details>

<details>
<summary><strong>Server-Side PDF Generation</strong></summary>

PDFs render on the server via `@react-pdf/renderer` and stream back as binary. No client-side PDF libraries, no browser print hacks. Works on every device.
</details>

---

## Test Coverage

| Category | Count | What's Covered |
|----------|-------|----------------|
| **Unit** | 120 | Schemas, utilities, currency math, date formatting |
| **Component** | 54 | All forms, UI primitives, status badges, modals |
| **Integration** | 7 | PDF API, admin invite API, auth middleware |
| **E2E Smoke** | 29 | Every page loads, nav works, forms render |
| **E2E Flow** | 16 | Invoice lifecycle, payments, PDF download, reports |
| **Total** | **226** | |

---

## Contributing

```bash
git clone https://github.com/Peleke/acclownting.git
cd acclownting
npm install
npx vitest run && npx playwright test
```

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push and open a Pull Request

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Invoicing software doesn't need to be complicated.**

**acclownting is proof.**

[Back to top](#acclownting)

</div>
