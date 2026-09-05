"use client";

import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const features = [
  "Real-time Telegram notifications",
  "Inline approve / reject buttons",
  "Automatic settlement on approval",
  "Stateful pause preserving context",
  "Complete audit trail for every decision",
];

const miniCards = [
  {
    icon: Send,
    label: "Telegram approval",
    sub: "One tap to approve, agent handles settlement",
  },
  {
    icon: CreditCard,
    label: "Dodo checkout",
    sub: "Test fiat settlement via Merchant of Record",
  },
];

export function ProductShowcase() {
  return (
    <section id="workflow" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Hero image placeholder - the animated ledger */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          {/* Invoice processing preview */}
          <div className="aspect-[16/9] w-full bg-muted p-8 md:p-12">
            <div className="mx-auto max-w-3xl">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Invoice pipeline
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  2 invoices processed
                </span>
              </div>

              {/* Ledger rows */}
              <div className="space-y-0 divide-y divide-border">
                {[
                  {
                    vendor: "AWS Cloud Services",
                    id: "INV-2847",
                    amount: "$450.00",
                    policy: "Under $500",
                    status: "Approved",
                    statusColor: "text-emerald-600",
                    icon: CheckCircle2,
                  },
                  {
                    vendor: "Stripe Processing",
                    id: "INV-2848",
                    amount: "$1,200.00",
                    policy: "Exceeds $500",
                    status: "Held for review",
                    statusColor: "text-warning",
                    icon: Clock,
                  },
                ].map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4"
                  >
                    <div className="min-w-[160px] flex-1">
                      <div className="text-sm font-medium text-stone-800">
                        {row.vendor}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {row.id}
                      </div>
                    </div>
                    <div className="w-20 text-right font-mono text-sm font-semibold text-stone-800">
                      {row.amount}
                    </div>
                    <div className="w-28 text-right text-xs text-muted-foreground">
                      {row.policy}
                    </div>
                    <div className="flex w-32 items-center justify-end gap-1.5">
                      <row.icon className={`h-3.5 w-3.5 ${row.statusColor}`} />
                      <span className={`text-xs font-medium ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="mt-12 grid items-start gap-12 md:grid-cols-[1fr_280px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          >
            <h2 className="font-display text-[32px]/[36px] font-medium tracking-tight text-stone-900">
              Human in the loop
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              When invoices exceed policy thresholds, the agent pauses and
              routes to the CFO via Telegram. One tap to approve. The agent
              handles settlement.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {features.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-stone-50 border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-600"
                >
                  {f}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="space-y-3">
            {miniCards.map((mc, i) => {
              const Icon = mc.icon;
              return (
                <motion.div
                  key={mc.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                  className="w-[280px] rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-accent border border-accent-border">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-800">
                        {mc.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mc.sub}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
