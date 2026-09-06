![License: MIT](https://img.shields.io/badge/License-MIT-purple)
![Node.js](https://img.shields.io/badge/Node.js-22+-green)
![Tests](https://img.shields.io/badge/Tests-12%20passed-brightgreen)
![Stack](https://img.shields.io/badge/Stack-Express%20%7C%20Supabase%20%7C%20Dodo%20%7C%20Telegram-blue)

# OmniCFO

**Autonomous Treasury Management for Modern Enterprises**

The self-healing financial agent that audits invoices, enforces fail-closed policy gates, and triggers compliant fiat settlements through Dodo Payments -- without human friction, until safety requires it.

Built for the **Syndicate Hackathon 2026 - Track 2: Autonomous Office of the CFO**.

**Track:** Autonomous Office of the CFO (Track 2)  
**Team:** Saber1Y  
**GitHub:** https://github.com/Saber1Y/OmniCFO  
**Live Demo:** https://omnicfo.vercel.app  
**Dashboard:** https://omnicfo.vercel.app/dashboard  
**Backend API:** https://omnicfo-production.up.railway.app  
**Demo Video:** [Add X/LinkedIn link here]

---

## How AO Was Used During the Build

This project was built entirely using **AO (Agent Orchestrator)** as the development environment. Every code change, architectural decision, and debugging session was driven through AO worker sessions:

### AO Session Workflow
- **Session `omnicfo-1`** — Initial backend scaffolding: Express server, Supabase schema, invoice CRUD, policy engine, Telegram polling, Dodo Payments integration
- **Session `omnicfo-2`** — Frontend development: Next.js 15 landing page, corporate treasury dashboard (overview, invoices, policy, activity, settings), design system implementation
- **Session `omnicfo-3`** — Design iteration: Pact-style editorial landing page redesign, SVG workflow diagrams, terminal animation in hero
- **Session `omnicfo-4`** — Infrastructure: Railway backend deployment, Vercel frontend deployment, CORS configuration, environment variable management
- **Session `omnicfo-5`** — Policy persistence: Supabase schema for policy_settings, policy_vendors, policy_audit; full CRUD API replacement of in-memory store
- **Session `omnicfo-6`** — Submission prep: Demo writeup (DEMO_WRITEUP.md), tweet templates (TWEET_TEMPLATE.md), screenshots integration, README documentation

### AO Skills Leveraged
- **agentcash** — API discovery and paid endpoint testing for Dodo Payments integration research
- **brandkit** — Logo/favicon design system exploration
- **devpost-crypto-writer** — Hackathon submission copy generation
- **onchain-demo-verifier** — Pre-submission checklist for demo authenticity

### Key AO-Driven Decisions
1. **Fail-closed policy architecture** — AO helped design the threshold-based gate where errors = no money movement
2. **Telegram polling vs webhook** — AO session debugged the 409 conflict, confirmed polling was correct for single-instance
3. **Dodo checkout sessions (not deprecated payments.create)** — AO research confirmed correct MoR API
4. **Supabase over in-memory** — AO worker migrated policy state to persistent storage for hackathon demo reliability

---

## The Problem

Corporate treasury is still manual. An invoice arrives, someone checks it against a spreadsheet, someone else approves it, someone else initiates payment. The "CFO" in most startups is a founder with a Stripe dashboard and a prayer.

The non-negotiable design rule: an autonomous agent can move money, but only within strict policy boundaries -- and when those boundaries are exceeded, it must pause and wait for explicit human authorization. The agent handles the boring 94% (invoices under the threshold) and escalates the 6% that require judgment. Every decision is logged. Every state is recoverable. No funds move without proof.

---

## What I Built

A full invoice-to-payment lifecycle with an autonomous agent at the center:

- **Ingest** -- Invoices arrive via API. Each is normalized with vendor name, amount, and ID before storage in Supabase.
- **Audit** -- Multi-step verification cross-checks vendor legitimacy, line-item accuracy, and duplicate detection before the invoice enters the policy pipeline.
- **Policy Gate** -- Fail-closed rules enforce spend thresholds ($500 auto-approve limit, configurable), vendor whitelisting, and budget caps. If the policy engine errors out, funds never move.
- **Human Approval** -- Invoices exceeding thresholds are routed to the CFO via Telegram with inline Approve/Reject buttons. The agent pauses -- with full state preserved -- until it receives explicit human authorization.
- **Settlement** -- Approved invoices trigger a Dodo Payments checkout session. Dodo acts as the Merchant of Record, handling compliance, tax, and card-network disputes.
- **Observability** -- Every decision point is logged with structured traces for complete audit compliance.

---

## Architecture

```
POST /api/invoices
       |
       v
 [Ingestion] --> Supabase (store)
       |
       v
 [Policy Engine] --> threshold check
       |
       +--- <= $500 ---> [Auto-Approve] ---> [Dodo Checkout] ---> Settlement
       |
       +--- >  $500 ---> [PENDING_APPROVAL] ---> [Telegram Alert]
                                                         |
                                                         v
                                                   CFO taps Approve/Reject
                                                         |
                                                         v
                                                   [Callback] ---> [Dodo] or [Reject]
```

### Pipeline Steps

| Step | What happens | Why it is robust |
|------|-------------|-----------------|
| Ingestion | Deterministic parsing of API payloads | Normalizes into canonical schema |
| Policy Gate | Fail-closed rules | If the engine errors, funds never move |
| Human Approval | Stateful pause | Preserves full transaction context during wait |
| Dodo Settlement | Merchant of Record | Handles compliance, tax, disputes out-of-the-box |
| Observability | Structured traces | Every decision point logged for audit |

---

## Dashboard

A corporate treasury dashboard built with Next.js 15.5 and Tailwind CSS v4:

- **Overview** -- 4 real-time metric cards, spend velocity bar chart, status distribution donut, invoice table, activity feed
- **Invoices & Payables** -- Full table with search, sort, filter tabs, detail modal, submit form
- **Policy Engine** -- Editable rules with toggles, vendor whitelist, audit log (persisted to Supabase)
- **Agent Activity** -- Execution history with trace entries
- **Settings** -- API keys with show/hide/copy, Telegram/Dodo/Notification config

### Screenshots

| Landing | Architecture | Dashboard Overview | Dashboard Policy |
|---------|-------------|-------------------|------------------|
| ![Hero](Hero.png) | ![Architecture](Architecture.png) | ![Overview](Overview.png) | ![Policy](Policy.png) |

---

## Run it locally

**Prerequisites:** Node 20+, Supabase project, Telegram bot, Dodo Payments account.

### 1. Install dependencies

```bash
# Backend
npm install

# Frontend
cd frontend && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Required variables:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather |
| `TELEGRAM_CFO_CHAT_ID` | CFO chat ID for notifications |
| `DODO_API_KEY` | Dodo Payments API key |
| `DODO_BASE_URL` | `https://test.dodopayments.com` |
| `TENSORMUX_API_KEY` | Tensormux API key (optional, for AI) |
| `TENSORMUX_BASE_URL` | `https://api.tensormux.com/v1` |
| `TENSORMUX_MODEL` | `glm-4-7-flash` |

### 3. Set up database

Run `supabase/schema.sql` in your Supabase SQL editor.

### 4. Start the servers

```bash
# Backend (port 4000)
npm start

# Frontend (port 3000)
cd frontend && npm run dev
```

### 5. Ingest an invoice

```bash
curl -X POST http://localhost:4000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": "INV-001",
    "vendor_name": "Acme Corp",
    "amount_cents": 45000
  }'
```

Auto-approved (under $500):
```json
{
  "invoice": { "status": "AUTO_APPROVED" },
  "payment": { "session_id": "cks_...", "checkout_url": "https://test.checkout.dodopayments.com/..." },
  "decision": { "approved": true, "reason": "Amount $450.00 <= $500.00 threshold" }
}
```

Requires approval (over $500):
```json
{
  "invoice": { "status": "PENDING_APPROVAL" },
  "payment": null,
  "decision": { "approved": false, "reason": "Amount $1,200.00 exceeds $500.00 threshold" }
}
```

---

## API

| Route | Method | Returns |
|-------|--------|---------|
| `/api/invoices` | GET | All invoices from Supabase |
| `/api/invoices` | POST | Ingest + policy check + payment/telegram |
| `/api/invoices/:id` | GET | Single invoice by ID |
| `/api/policy` | GET | Rules, vendors, audit log |
| `/api/policy/rules` | PUT | Update policy rules |
| `/api/policy/rules/reset` | POST | Reset to defaults |
| `/api/policy/vendors` | POST/DELETE | Vendor whitelist CRUD |
| `/api/policy/audit` | GET | Full audit log |
| `/health` | GET | Service status |

---

## Tests

```bash
# Backend - 12 integration tests
npm test

# Frontend build check
cd frontend && npx next build
```

Test coverage:
- Invoice ingestion (happy path, validation, duplicates)
- Policy engine (auto-approve, threshold, rejection)
- Telegram polling (send message, callback handling, dedup)
- Dodo Payments (checkout session creation, status tracking)
- API routes (POST/GET invoices, health check)

---

## What's Real vs Pending

| Capability | Status |
|-----------|--------|
| Invoice ingestion via API | Real, tested end-to-end |
| Policy engine ($500 threshold) | Real, enforced at every decision |
| Telegram human-in-the-loop | Real, polling mode with callback dedup |
| Dodo Payments checkout sessions | Real, test mode verified |
| Supabase persistence | Real, schema applied |
| Structured logging | Real, Neatlogs-compatible |
| Landing page | Real, deployed |
| Dashboard with real data | Real, wired to backend API |
| Email/PDF ingestion | Pending -- API ingestion only for now |
| Multi-LLM audit cascade | Pending -- policy engine only |

---

## Project Layout

```
src/
  config.ts              # Environment validation
  types.ts               # TypeScript interfaces
  logger.ts              # Structured logging
  app.ts                 # Express assembly
  server.ts              # Entry point + Telegram polling
  services/
    supabase.ts          # Invoice CRUD + Policy/Vendor/Audit persistence
    policy.ts            # Threshold policy engine (async, Supabase-backed)
    telegram.ts          # Bot API + polling
    dodo.ts              # Dodo Payments SDK (checkout sessions)
  routes/
    invoice.ts           # Invoice API routes
    policy.ts            # Policy API routes (Supabase-backed)
    webhook.ts           # Telegram webhook routes
supabase/
  schema.sql             # Database schema (invoices, policy_settings, policy_vendors, policy_audit)
frontend/
  src/
    app/
      page.tsx           # Landing page with screenshots
      dashboard/
        page.tsx         # Dashboard overview
        invoices/        # Invoices & payables
        policy/          # Policy engine config
        activity/        # Agent activity traces
        settings/        # Settings & API keys
    components/
      Navbar.tsx
      Hero.tsx
      Screenshots.tsx
      TechStack.tsx
      Footer.tsx
```

---

## Tech Stack

- **Runtime:** Node.js 22 + Express
- **Database:** Supabase (PostgreSQL)
- **Payments:** Dodo Payments SDK (Merchant of Record, checkout sessions)
- **Notifications:** Telegram Bot API (long-polling mode)
- **Frontend:** Next.js 15.5 (App Router) + Tailwind CSS v4 + Sora/Newsreader fonts
- **Icons:** Lucide React
- **Observability:** Structured logging (Neatlogs-compatible)
- **AI Model (optional):** Tensormux GLM-4-7-Flash via OpenAI-compatible endpoint

---

## License

MIT