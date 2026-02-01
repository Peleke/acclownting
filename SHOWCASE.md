# Showcase: User Flow Recordings

Visual evidence of all original requirements working end-to-end.

> **To regenerate:** `npx playwright test --config playwright.showcase.config.ts`

---

## Original Requirements

> "I just want a program that is simple. Can create different logins and track who does what. Can create invoice listed under a client number/name into printable pdf template. Can post payments to invoices. Can run report to show what each customer owes and has paid. Can run report to show total earned/owed during a time period selected"

---

## Screenshots

| # | Requirement | Screenshot | Description |
|---|-------------|------------|-------------|
| 01 | Auth | [Login Page](showcase-artifacts/screenshots/01-login-page.png) | Clean login form with email/password |
| 02 | Auth | [Signup Page](showcase-artifacts/screenshots/02-signup-page.png) | Self-service registration |
| 03 | Auth | [Admin Users](showcase-artifacts/screenshots/03-admin-users.png) | User management panel with roles |
| 05 | Clients | [Client List](showcase-artifacts/screenshots/05-clients-list.png) | Searchable client directory |
| 06 | Clients | [New Client Modal](showcase-artifacts/screenshots/06-new-client-modal.png) | Client creation form |
| 07 | Clients | [Client Form Filled](showcase-artifacts/screenshots/07-client-form-filled.png) | Form with all fields populated |
| 08 | Invoicing | [New Invoice (Empty)](showcase-artifacts/screenshots/08-new-invoice-empty.png) | Blank invoice form with client select |
| 09 | Invoicing | [Invoice with Line Items](showcase-artifacts/screenshots/09-invoice-with-line-items.png) | Multiple line items, tax calc, totals |
| 10 | Invoicing | [Invoice Complete](showcase-artifacts/screenshots/10-invoice-complete.png) | Full invoice with notes ready to submit |
| 11 | Invoicing | [Invoice List](showcase-artifacts/screenshots/11-invoices-list.png) | All invoices with status filters |
| 17 | Reporting | [Reports Page](showcase-artifacts/screenshots/17-reports-page.png) | Revenue report with date filters |
| 18 | Reporting | [Client Balances](showcase-artifacts/screenshots/18-client-balances.png) | What each customer owes and has paid |
| 23 | Dashboard | [Dashboard](showcase-artifacts/screenshots/23-dashboard.png) | Overview: invoiced, collected, outstanding |

---

## Videos

Each video records a complete user flow at 300ms slow-motion for clarity.

| Requirement | Flow | Video |
|-------------|------|-------|
| **Auth** | Login + Signup pages | [video.webm](showcase-artifacts/user-flows-FR1-User-Logins-de74c--login-page-and-signup-flow-showcase/video.webm) |
| **Auth** | Admin user management | [video.webm](showcase-artifacts/user-flows-FR1-User-Logins-651e1-cking-admin-user-management-showcase/video.webm) |
| **Clients** | Create client + view list | [video.webm](showcase-artifacts/user-flows-FR2-Client-Mana-6382e-client-and-view-client-list-showcase/video.webm) |
| **Invoicing** | Create invoice with line items | [video.webm](showcase-artifacts/user-flows-FR2-Client-Mana-79185-ate-invoice-with-line-items-showcase/video.webm) |
| **Invoicing** | Invoice list with filters | [video.webm](showcase-artifacts/user-flows-FR2-Client-Mana-3fa06-ce-list-with-status-filters-showcase/video.webm) |
| **Invoice Detail** | Detail page + edit + status | [video.webm](showcase-artifacts/user-flows-FR3-Invoice-Det-f1e6e-ce-detail-page-with-actions-showcase/video.webm) |
| **Payments** | Payment form on invoice | [video.webm](showcase-artifacts/user-flows-FR4-Post-Paymen-538f4-ment-form-on-invoice-detail-showcase/video.webm) |
| **Report: Balances** | Reports page + client balances | [video.webm](showcase-artifacts/user-flows-FR5-Report-—-Wh-df972-s-page-with-client-balances-showcase/video.webm) |
| **Report: Balances** | Client detail + payment history | [video.webm](showcase-artifacts/user-flows-FR5-Report-—-Wh-08913-detail-with-payment-history-showcase/video.webm) |
| **Report: Revenue** | Date range filters + revenue | [video.webm](showcase-artifacts/user-flows-FR6-Report-—-To-a20cb-ort-with-date-range-filters-showcase/video.webm) |
| **Dashboard** | Dashboard overview | [video.webm](showcase-artifacts/user-flows-FR6-Report-—-To-7582d-oard-overview-with-balances-showcase/video.webm) |

---

## Requirement Traceability

| Original Requirement | Covered By |
|----------------------|------------|
| "Can create different logins and track who does what" | Screenshots 01-03, Videos: Auth flows |
| "Can create invoice listed under a client number/name" | Screenshots 05-11, Videos: Client + Invoice flows |
| "Into printable pdf template" | Video: Invoice detail (Download PDF button visible) |
| "Can post payments to invoices" | Video: Payment form on invoice detail |
| "Can run report to show what each customer owes and has paid" | Screenshots 17-18, Videos: Reports + Client balances |
| "Can run report to show total earned/owed during a time period selected" | Screenshots 17, 23, Videos: Revenue report + Dashboard |
