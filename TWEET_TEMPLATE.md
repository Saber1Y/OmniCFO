# Announcement Tweet (for Syndicate Hackathon 2026 submission)

---

## Option 1: Standard submission tweet

OmniCFO — autonomous treasury agent for Track 2 (Autonomous Office of the CFO) @SyndicateHQ

Mechanism: ingest invoice → fail-closed policy gate (auto-approve ≤$500, Telegram CFO review >$500) → audit log → Dodo Payments checkout session → vendor paid. Full trace on every decision.

Demo: https://omnicfo.vercel.app/dashboard
API: https://omnicfo-production.up.railway.app
Code: https://github.com/Saber1Y/OmniCFO

@SyndicateHQ #SyndicateHackathon2026 #BuildOnBase

---

## Option 2: Thread (if you want more detail)

1/ OmniCFO — autonomous corporate treasury agent. Submitting to Track 2 @SyndicateHQ.

The problem: AP is manual, CFOs approve in Slack with no audit trail, payouts are disjointed. Policy lives in Notion.

2/ The mechanism:
- POST invoice → Supabase
- Policy engine reads live rules (threshold, whitelist, dual-approval)
- ≤$500 or trusted vendor → AUTO_APPROVED → Dodo checkout session
- >$500 untrusted → Telegram bot pings CFO with Approve/Reject buttons
- Every evaluation writes audit entry (rule, action, invoice, timestamp)

3/ What's live:
- Dashboard with real invoices, charts, activity traces
- Policy page: edit threshold, add vendors, toggle rules — hot reload
- Telegram approval flow tested end-to-end
- 12 invoices processed in testing, all with Dodo checkout sessions

4/ Stack: Node/Express/TS + Supabase + Dodo Payments SDK + Telegram Bot API (polling) + Next.js 15/Tailwind v4. Backend on Railway, frontend on Vercel.

Demo: https://omnicfo.vercel.app/dashboard
Code: https://github.com/Saber1Y/OmniCFO

@SyndicateHQ #SyndicateHackathon2026

---

## Option 3: Short (for character-limited platforms)

OmniCFO @SyndicateHQ Track 2: Autonomous treasury agent. Invoice → policy gate (auto ≤$500, Telegram CFO >$500) → audit log → Dodo Payments checkout → vendor paid. 12 real invoices tested end-to-end.

Demo: https://omnicfo.vercel.app/dashboard
Code: https://github.com/Saber1Y/OmniCFO

#SyndicateHackathon2026