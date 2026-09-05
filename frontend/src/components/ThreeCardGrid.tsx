"use client";

import { motion } from "motion/react";
import { Shield, CreditCard, Activity } from "lucide-react";

const cards = [
  {
    icon: Shield,
    title: "Fail-closed policy engine",
    desc: "Hard spend thresholds, vendor whitelisting, and budget caps enforced at every decision point. If the policy engine errors out, funds never move.",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    iconBorder: "border-emerald-200",
  },
  {
    icon: CreditCard,
    title: "Merchant of Record settlements",
    desc: "Dodo Payments handles compliance, tax, and card-network disputes out-of-the-box. Approved invoices trigger checkout sessions automatically.",
    iconBg: "bg-indigo-50",
    iconText: "text-accent",
    iconBorder: "border-accent-border",
  },
  {
    icon: Activity,
    title: "Full audit trail",
    desc: "Every decision point - ingestion, audit, policy check, approval, and settlement - is logged with structured traces for complete observability.",
    iconBg: "bg-orange-50",
    iconText: "text-orange-500",
    iconBorder: "border-orange-200",
  },
];

export function ThreeCardGrid() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 + i * 0.15 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} ${card.iconText} border ${card.iconBorder}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold text-stone-800">
                  {card.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {card.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
