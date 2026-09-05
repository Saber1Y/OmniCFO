"use client";

import { motion } from "motion/react";

const techItems = [
  {
    role: "State management",
    name: "Agent Orchestrator",
    desc: "Zero-loss state persistence during human review delays. Coordinates agent sessions and manages state transitions across the treasury pipeline.",
    url: "https://github.com/anthropics/agent-orchestrator",
  },
  {
    role: "Merchant of Record",
    name: "Dodo Payments",
    desc: "Acts as the Merchant of Record, handling compliance, tax, and card-network disputes seamlessly. Checkout sessions for compliant fiat settlements.",
    url: "https://dodopayments.com",
  },
  {
    role: "Observability",
    name: "Neatlogs",
    desc: "Structured logging traces every decision point - ingestion, audit, policy check, approval, and settlement - for complete audit compliance.",
    url: "https://neatlogs.dev",
  },
  {
    role: "Policy storage",
    name: "Supabase",
    desc: "PostgreSQL-backed invoice storage with row-level security, real-time subscriptions, and edge functions. Deterministic state recovery on failure.",
    url: "https://supabase.com",
  },
];

export function TechStack() {
  return (
    <section id="tech" className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Tech stack
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Built on battle-tested infrastructure for autonomous financial
            operations. Solves real enterprise finance problems.
          </p>
        </motion.div>

        <div className="border-t-2 border-ink">
          {techItems.map((item, i) => (
            <motion.a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="block border-b border-rule py-6 transition-colors hover:bg-paper-raised"
            >
              <div className="text-[12px] text-ink-muted">{item.role}</div>
              <div className="mt-1 font-serif text-xl font-bold text-ink">
                {item.name}
              </div>
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-muted">
                {item.desc}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
