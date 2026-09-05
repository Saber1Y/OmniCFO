"use client";

import { motion } from "motion/react";

const techItems = [
  {
    role: "State management",
    name: "Agent Orchestrator",
    desc: "Zero-loss state persistence during human review delays. Coordinates agent sessions and manages state transitions across the treasury pipeline.",
  },
  {
    role: "Merchant of Record",
    name: "Dodo Payments",
    desc: "Acts as the Merchant of Record, handling compliance, tax, and card-network disputes seamlessly. Checkout sessions for compliant fiat settlements.",
  },
  {
    role: "Observability",
    name: "Neatlogs",
    desc: "Structured logging traces every decision point - ingestion, audit, policy check, approval, and settlement - for complete audit compliance.",
  },
  {
    role: "Policy storage",
    name: "Supabase",
    desc: "PostgreSQL-backed invoice storage with row-level security, real-time subscriptions, and edge functions.",
  },
];

export function TechStack() {
  return (
    <section id="tech" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="font-display text-[32px]/[36px] font-medium tracking-tight text-stone-900">
            Tech stack
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Built on battle-tested infrastructure for autonomous financial
            operations.
          </p>
        </motion.div>

        <div className="divide-y divide-border border-t border-border">
          {techItems.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 + i * 0.1 }}
              className="py-6"
            >
              <div className="text-[12px] text-muted-foreground">{item.role}</div>
              <div className="mt-1 font-display text-xl font-medium text-stone-900">
                {item.name}
              </div>
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
