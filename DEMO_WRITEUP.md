# OmniCFO — Autonomous Corporate Treasury Agent

## One-Line Pitch

An autonomous treasury agent that ingests invoices, enforces fail-closed policy gates (auto-approve under $500, Telegram CFO review above), audits every decision to Supabase, and triggers compliant fiat settlement via Dodo Payments checkout sessions — all without a human in the loop for routine spend.

---

## The Problem

Corporate treasury today is manual, slow, and error-prone: AP teams chase paper invoices, CFOs approve via Slack/email with no audit trail, and payouts happen through disconnected banking portals. Policy rules live in Notion or tribal knowledge. When something breaks — duplicate payment, vendor fraud, budget overrun — there's no immutable log to trace why.

---

## How It Works (Actual Flow)

**1. Invoice Ingestion**  
`POST /api/invoices` accepts `{ invoice_id, vendor_name, amount_cents, metadata }`. Stored in Supabase with status `DRAFT`.

**2. Policy Evaluation (fail-closed)**  
The agent reads live rules from `/api/policy` (in-memory store, hot-reloadable):
- `autoApproveThresholdCents` — default 50,000 ($500)
- `requireTelegramApproval` — boolean
- `requireDualApproval` — boolean
- `vendor whitelist` — trusted names bypass review

Every evaluation writes an audit entry to `/api/policy/audit` with `{ rule, action, invoice_id, detail, timestamp }`.

**3. Decision Branches**  
| Amount | Vendor | Action |
|--------|--------|--------|
| ≤ $500 | any | `AUTO_APPROVED` → Dodo checkout session created |
| > $500 | trusted | `AUTO_APPROVED` → Dodo checkout session created |
| > $500 | untrusted | `PENDING_APPROVAL` → Telegram bot sends inline keyboard (Approve/Reject) to CFO chat |

**4. Telegram Approval**  
Bot runs in long-polling mode (single instance). Callback handler verifies CFO chat ID, dedupes via `message_id`, updates invoice status to `PAYMENT_INITIATED`, creates Dodo checkout session, records `approved_by` + `approved_at`.

**5. Fiat Settlement**  
Uses Dodo Payments (Merchant of Record) **checkout sessions** — not deprecated `payments.create()`.  
`POST https://test.dodopayments.com/checkout-sessions` with product `pdt_0Nmw7740CjLSuF3GAUb0B`, returns hosted payment URL. Vendor pays; Dodo handles KYC, tax, compliance, payout to vendor bank account.

**6. Full Audit Trail**  
Every invoice has a trace: `Ingestion → Policy Evaluation → Audit Entry → Decision → Telegram (if held) → Dodo Checkout Created → Payment Completed`. Queryable via `/api/policy/audit` and `/api/invoices`.

---

## Tech Stack (Specific)

- **Backend**: Node 22, Express, TypeScript, Supabase (Postgres), `dodopayments` npm SDK, Telegram Bot API (polling)
- **Frontend**: Next.js 15.5 (App Router, Turbopack), Tailwind CSS v4, Motion, Lucide React
- **Fonts**: Sora (sans), Newsreader (display), Geist Mono (mono)
- **Deploy**: Backend → Railway (Telegram polling), Frontend → Vercel
- **CORS**: Backend exposes `Access-Control-Allow-Origin: *` for cross-origin dashboard calls

---

## What's Live Right Now

| Component | URL |
|-----------|-----|
| **Landing + Dashboard** | https://omnicfo.vercel.app |
| **Dashboard (invoices, policy, activity, settings)** | https://omnicfo.vercel.app/dashboard |
| **Backend API** | https://omnicfo-production.up.railway.app |
| **Health check** | https://omnicfo-production.up.railway.app/health |
| **Policy API (rules, vendors, audit)** | https://omnicfo-production.up.railway.app/api/policy |
| **Invoices API** | https://omnicfo-production.up.railway.app/api/invoices |

**Test the full flow:**
1. Open dashboard → "Submit Invoice" → `$250 Vercel` → auto-approves instantly
2. Submit `$1,200 AWS` → goes `PENDING_APPROVAL` → Telegram arrives → tap Approve → dashboard updates to `SETTLED`
3. Policy page: edit threshold to $750, add vendor "Stripe" → subsequent invoices respect new rules live
4. Activity page: click any invoice → see full trace with timestamps

---

## Track Alignment

**Syndicate Hackathon 2026 — Track 2: Autonomous Office of the CFO**

- ✅ **Autonomous invoice-to-payment pipeline** — no human required for routine spend
- ✅ **Fail-closed policy engine** — rules enforced in code, not tribal knowledge
- ✅ **Telegram as approval interface** — CFO reviews in 2 taps, mobile-native
- ✅ **Dodo Payments settlement** — compliant fiat checkout, not crypto rails
- ✅ **Full auditability** — every decision logged with rule + timestamp + actor
- ✅ **Live configuration** — threshold, whitelist, rules editable without redeploy

---

## What's Real vs. Roadmap

**Real (in demo):**
- Invoice CRUD + policy evaluation + audit logging
- Telegram long-polling bot with callback dedup
- Dodo Payments checkout session creation (test mode)
- Supabase persistence (12 invoices from testing)
- Dashboard with real-time data, charts, activity traces
- Policy/vendors/rules editable via UI → backend

**Roadmap (not in demo):**
- Multi-tenant auth / org isolation
- Dodo webhook listener for payment confirmation → auto-mark `PAID`
- ACH/wire payout rails (Dodo handles vendor payout; we just trigger checkout)
- Slack/Email approval channels alongside Telegram
- Budget caps (monthly/quarterly) with spend forecasting
- ZK-proof of policy evaluation for external verifiers
- Integration with accounting software (QuickBooks, Xero)

---

## Standout Number

**12 real invoices processed end-to-end** in testing — 6 auto-approved (< $500), 6 held for Telegram CFO review (> $500), all with Dodo checkout sessions created and full audit traces recorded.

---

## Why Now / Why This Build

Dodo Payments launched checkout-session-based MoR flow in 2024 — finally a compliant fiat settlement API that works for programmatic use. Telegram Bot API long-polling is stable and requires no webhook infrastructure. Supabase gives instant Postgres + auth. The primitives for an autonomous treasury agent now exist; they just needed wiring together.

---

## Repository

https://github.com/Saber1Y/OmniCFO