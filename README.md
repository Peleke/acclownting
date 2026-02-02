<div align="center">

# acclownting

### Invoicing for Humans Who Just Want It to Work

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![CI](https://img.shields.io/github/actions/workflow/status/Peleke/acclownting/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/Peleke/acclownting/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Create invoices. Post payments. Run reports. That's it.**

<img src="assets/hero-banner.png" alt="acclownting — Invoicing for Humans Who Just Want It to Work" width="800"/>

[![Live App](https://img.shields.io/badge/Live_App-acclownting.vercel.app-black?style=for-the-badge&logo=vercel&logoColor=white)](https://acclownting.vercel.app)

[Get Started](#quick-start) · [Features](#features) · [Architecture](#architecture) · [Contributing](#contributing)

---

</div>

## The Problem

Invoicing and reporting software should help with invoicing and reporting.

...Not use GenAI to talk to your bank, "optimize your spend", and interrogate you about your day when all you need to do is send some clown an invoice and call it a day.

## The Solution

**acclownting** is a multi-user invoicing app that does exactly what you need and nothing else:

- Create client records
- Create invoices with line items, tax, and notes
- Generate printable PDF invoices
- Post partial or full payments against invoices
- Run reports showing what each client owes and what you've earned
- Manage access with admin invites and self-service signup

That's the entire product, and it will stay that way.

---

## Features

### Client Management
Create and search clients by name. Each client has a detail page showing contact info, invoice history, and full payment history. One click creates a new invoice pre-filled for that client.

### Invoicing
Create invoices with multiple line items, configurable tax rates, and optional notes. Edit them after creation. Override status manually when life doesn't follow the happy path. Download or print PDF invoices that look professional enough to send to actual humans.

### Payments & Status Tracking
Post partial or full payments against any invoice. Invoices automatically transition through `draft > sent > partial > paid` as payments come in. Past-due invoices get flagged as `overdue` automatically. Deleting a payment recalculates the balance.

### Reporting
Two reports, both useful:
- **Revenue Report**: total earned and owed for any date range, defaulting to the current month
- **Client Balances**: per-client breakdown of invoiced, paid, and outstanding amounts, with overdue clients flagged in red

### Multi-User Auth
Admin users invite new members. Self-service signup is also available. Session-based auth runs through Supabase with cookie management, and role-based access control separates admin from member capabilities.

---

## Screenshots & Videos

See **[SHOWCASE.md](./SHOWCASE.md)** for full screenshots, recorded videos, and a traceability matrix mapping every recording back to the original requirements.

To regenerate recordings locally:

```bash
npx playwright test --config playwright.showcase.config.ts
```

---

<div align="center">

# Part II: Technical Documentation

*For engineers, contributors, and the curious*

</div>

---

## Architecture

```mermaid
graph TD
    Browser["Browser<br/><sub>React 19 · TypeScript · Tailwind CSS</sub>"]
    AppRouter["Next.js 15 App Router<br/><sub>Server Components · Route Handlers</sub>"]
    Supabase["Supabase<br/><sub>PostgreSQL · Auth · RLS · RPC</sub>"]
    PDF["@react-pdf/renderer<br/><sub>Server-side PDF generation</sub>"]
    Zod["Zod<br/><sub>Runtime validation</sub>"]

    Browser -->|"RSC + Client Components"| AppRouter
    AppRouter -->|"Reads (server) · Writes (client)"| Supabase
    AppRouter -->|"GET /api/invoices/:id/pdf"| PDF
    Browser -->|"Form validation"| Zod

    style Browser fill:#0075DD,color:#fff,stroke:none
    style AppRouter fill:#000,color:#fff,stroke:none
    style Supabase fill:#3FCF8E,color:#fff,stroke:none
    style PDF fill:#FFC414,color:#1A1A1A,stroke:none
    style Zod fill:#3068B7,color:#fff,stroke:none
```

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
│   ├── flows/                   # Multi-page user flow tests
│   └── showcase/                # Video + screenshot recordings
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
npx playwright test      # Run 45 E2E smoke tests

# Showcase recordings
npx playwright test --config playwright.showcase.config.ts

# All checks (what CI runs)
npm run typecheck && npm run lint && npx vitest run && npx playwright test
```

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

MIT License. See [LICENSE](./LICENSE) for details.

---

<div align="center">

**Invoicing software doesn't need to be complicated. acclownting keeps it that way.**

[Back to top](#acclownting)

</div>
