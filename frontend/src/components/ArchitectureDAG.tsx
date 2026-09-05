"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const stages = [
  {
    num: "1",
    label: "Ingestion",
    desc: "Deterministic parsing of multi-format payloads. PDFs, emails, and API payloads normalized into a canonical schema before storage.",
  },
  {
    num: "2",
    label: "Multi-LLM Audit",
    desc: "Cross-referenced verification to catch rate anomalies, duplicate hashes, and vendor legitimacy issues through a cascade of LLM verifiers.",
  },
  {
    num: "3",
    label: "Policy Gate",
    desc: "Fail-closed design. If the policy engine errors out, funds never move. Hard spend thresholds, vendor whitelisting, and budget caps.",
  },
  {
    num: "4",
    label: "Human Approval",
    desc: "Stateful pause preserving cryptographic context. Invoices exceeding thresholds are routed to the CFO via Telegram.",
  },
  {
    num: "5",
    label: "Dodo Settlement",
    desc: "Merchant of Record handling compliance, tax, and card-network disputes. Checkout sessions for compliant fiat settlements.",
  },
  {
    num: "6",
    label: "Observability",
    desc: "Every decision point logged with structured traces. Complete observability for audit compliance.",
  },
];

export function ArchitectureDAG() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="architecture" className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-14">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Architecture
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            A fail-closed pipeline where every invoice passes through
            verification, policy enforcement, and human approval before
            settlement. Zero-loss state persistence via Agent Orchestrator.
          </p>
        </div>

        {/* Ledger flow */}
        <div className="relative">
          {/* Vertical connecting rule */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-rule" />

          <div className="space-y-0">
            {stages.map((stage, i) => {
              const isActive = active === stage.num;

              return (
                <motion.div
                  key={stage.num}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="relative"
                >
                  {/* Connecting dot */}
                  <div className="absolute left-[15px] top-4 h-[9px] w-[9px] rounded-full border-2 border-ink bg-paper" />

                  {/* Content */}
                  <button
                    onClick={() => setActive(isActive ? null : stage.num)}
                    className="ml-12 w-full border-b border-rule py-5 text-left transition-colors hover:bg-paper-raised"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-serif text-2xl font-bold text-ink">
                        {stage.num}
                      </span>
                      <span className="font-serif text-lg font-bold text-ink">
                        {stage.label}
                      </span>
                      <span className="ml-auto font-mono text-[11px] text-ink-muted">
                        {isActive ? "close" : "expand"}
                      </span>
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-muted">
                            {stage.desc}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
