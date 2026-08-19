# NotarTrack

**Multi-tenant SaaS for managing and tracking legal procedures at public notary offices in Bolivia.**

Many notary offices lose hours answering calls asking "is my document ready yet?". NotarTrack solves this with two sides:

- **Internal panel**: the secretary or notary registers a procedure and advances its status with a button. Each procedure has a unique tracking code (e.g. `NT-8F3K2`).
- **Public tracking page**: the client enters their code or ID number and sees the status of their procedure in a *courier-style tracking* timeline, with no login required.

When the procedure is **ready for pickup**, the client automatically receives a **WhatsApp notification**.

---

## Features

**Internal panel (private, per notary office)**

- Authentication with email + password (Auth.js + bcrypt) and two roles: **Notary** and **Secretary**.
- Procedure creation with client lookup/creation by ID number and validation with Zod.
- Linear status flow (`Received → In preparation → For signature → Notarized → Ready for pickup → Delivered`) with an audited history (who and when).
- The **Notary** can move statuses backward with a mandatory comment; the Secretary cannot.
- Management of the office's own users (Notary only).

**Public tracking page**

- Search by code or ID number (with notary office selection).
- Visual timeline: completed, current and pending steps, with date and time.
- Sensitive data protected: masked ID number, no internal notes shown.
- Per-IP rate limiting to prevent scraping, and `noindex` on procedure views.

**Notifications**

- Automatic WhatsApp message when a procedure moves to *Ready for pickup* (Meta's WhatsApp Cloud API).
- Sending is **isolated** in a single module so the provider can be swapped without touching the rest.
- It never blocks or breaks the status change: every attempt is logged (`SENT` / `FAILED` + error).
- Per-office WhatsApp *feature flag*.

**Multi-tenancy**

- Every panel query filters by the logged-in user's notary office. A procedure from another office is not accessible, even via direct URL (returns 404).

---

## Stack

- **Next.js 15** (App Router, Server Actions, strict TypeScript)
- **PostgreSQL** (Neon) + **Drizzle ORM**
- **Auth.js** (NextAuth v5) with credentials provider + **bcrypt**
- **Tailwind CSS** + **shadcn/ui**
- **WhatsApp Cloud API** (Meta)
- Deployed on **Vercel**

---

## Structure

```
/app
  /(public)/seguimiento   → public tracking page
  /(panel)/panel          → internal dashboard (protected)
  /login                  → sign in
  /api/auth               → Auth.js handler
/actions                  → Server Actions (mutations)
/lib                      → business logic, db, utils
/db                       → Drizzle schema, migrations and seed
/components               → shared UI
```

---

## Running it locally

**Requirements:** Node.js 20+ and a PostgreSQL database (recommended: [Neon](https://neon.tech), free).

```
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# fill in DATABASE_URL, AUTH_SECRET and (optional) the WhatsApp variables

# 3. Create the tables and load sample data
npm run db:migrate
npm run db:seed

# 4. Start the project
npm run dev
```

Open <http://localhost:3000/seguimiento> (public) or <http://localhost:3000/panel> (internal panel).

**Test users** (password `notaria123`):

| Notary office      | Notary                 | Secretary                 |
| ------------------ | ---------------------- | ------------------------- |
| No. 42 — Cochabamba | `notario@notaria42.bo` | `secretaria@notaria42.bo` |
| No. 7 — La Paz      | `notario@notaria7.bo`  | `secretaria@notaria7.bo`  |

---

## Development phases

- [x] **Phase 0** — Setup (Next.js, Tailwind, shadcn/ui, Drizzle)
- [x] **Phase 1** — Data model + internal CRUD
- [x] **Phase 2** — Public tracking page
- [x] **Phase 3** — Authentication, multi-tenancy and roles
- [x] **Phase 4** — WhatsApp notifications
- [ ] **Phase 5** — Polish for demo

---

Portfolio project. Sample data (names, ID numbers, phone numbers) is fictional.
