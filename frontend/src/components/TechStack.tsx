"use client";

import { motion } from "motion/react";
import { Shield, CreditCard, Activity, Database } from "lucide-react";

const techCards = [
  {
    icon: Shield,
    name: "Agent Orchestrator",
    role: "State Management",
    desc: "Zero-loss state persistence during human review delays. Coordinates agent sessions, manages state transitions, and handles delegation across the treasury pipeline.",
    url: "https://github.com/anthropics/agent-orchestrator",
  },
  {
    icon: CreditCard,
    name: "Dodo Payments",
    role: "Merchant of Record",
    desc: "Acts as the Merchant of Record, handling compliance, tax, and card-network disputes seamlessly out-of-the-box. Checkout sessions for compliant fiat settlements.",
    url: "https://dodopayments.com",
  },
  {
    icon: Activity,
    name: "Neatlogs",
    role: "Observability",
    desc: "Structured logging traces every decision point -- ingestion, audit, policy check, approval, and settlement -- for complete audit compliance.",
    url: "https://neatlogs.dev",
  },
  {
    icon: Database,
    name: "Supabase",
    role: "Policy Storage",
    desc: "PostgreSQL-backed invoice storage with row-level security, real-time subscriptions, and edge functions. Deterministic state recovery on failure.",
    url: "https://supabase.com",
  },
];

export function TechStack() {
  return (
    <section id="tech" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
            Tech Stack
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted">
            Built on battle-tested infrastructure for autonomous financial
            operations. Solves real enterprise finance problems -- closing the
            books, avoiding treasury drain, and ensuring compliance at every
            step.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {techCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.a
                key={card.name}
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group rounded-lg border border-border bg-bg-raised p-5 transition-all hover:border-purple/20"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-surface">
                  <Icon className="h-4 w-4 text-text-muted" />
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
                  {card.role}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-text">
                  {card.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-muted">
                  {card.desc}
                </p>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
