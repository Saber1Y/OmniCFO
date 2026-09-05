"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Brain,
  ShieldCheck,
  MessageSquare,
  CreditCard,
  Activity,
  ArrowRight,
} from "lucide-react";

const nodes = [
  {
    id: "ingestion",
    label: "Ingestion",
    sub: "Deterministic Parsing",
    icon: FileText,
    desc: "Deterministic parsing of multi-format unstructured payloads. PDFs, emails, and API payloads are normalized into a canonical schema before storage.",
  },
  {
    id: "audit",
    label: "Multi-LLM Audit",
    sub: "Cross-Referenced Verification",
    icon: Brain,
    desc: "Cross-referenced verification to catch rate anomalies, duplicate hashes, and vendor legitimacy issues through a cascade of LLM verifiers.",
  },
  {
    id: "policy",
    label: "Policy Gate",
    sub: "Fail-Closed Design",
    icon: ShieldCheck,
    desc: "If the policy engine errors out, funds never move. Hard spend thresholds, vendor whitelisting, and budget caps enforced at every decision point.",
  },
  {
    id: "approval",
    label: "Human Approval",
    sub: "Stateful Pause",
    icon: MessageSquare,
    desc: "Stateful pause preserving cryptographic context. Invoices exceeding thresholds are routed to the CFO via Telegram with inline Approve/Reject buttons.",
  },
  {
    id: "settlement",
    label: "Dodo Settlement",
    sub: "Merchant of Record",
    icon: CreditCard,
    desc: "Dodo Payments acts as the Merchant of Record, handling compliance, tax, and card-network disputes. Checkout sessions for compliant fiat settlements.",
  },
  {
    id: "observability",
    label: "Observability",
    sub: "Full Audit Trail",
    icon: Activity,
    desc: "Every decision point is logged with structured traces. Complete observability for audit compliance, powered by Neatlogs structured logging.",
  },
];

export function ArchitectureDAG() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section id="architecture" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
            Architecture
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted">
            A fail-closed pipeline where every invoice passes through
            verification, policy enforcement, and human approval before
            settlement. Zero-loss state persistence via Agent Orchestrator.
          </p>
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px bg-border md:block" />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {nodes.map((node, i) => {
              const Icon = node.icon;
              const isActive = activeNode === node.id;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative"
                >
                  <button
                    onClick={() => setActiveNode(isActive ? null : node.id)}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      isActive
                        ? "border-purple/30 bg-purple-dim"
                        : "border-border bg-bg-raised hover:border-purple/20"
                    }`}
                  >
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-text-muted">
                      Step {i + 1}
                    </div>
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-surface">
                      <Icon className="h-4 w-4 text-text-muted" />
                    </div>
                    <div className="text-xs font-semibold text-text">
                      {node.label}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                      {node.sub}
                    </div>

                    {i < nodes.length - 1 && (
                      <div className="pointer-events-none absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-text-muted/30 lg:block">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-lg border border-border bg-bg-raised p-3"
                      >
                        <p className="text-[11px] leading-relaxed text-text-muted">
                          {node.desc}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
