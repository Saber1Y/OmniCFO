"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

type MockState = "idle" | "pending" | "approved" | "rejected";

export function LiveWorkflow() {
  const [state, setState] = useState<MockState>("idle");
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setState("pending");
      setTimeout(() => setShowActions(true), 1500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = () => {
    setShowActions(false);
    setState("approved");
  };

  const handleReject = () => {
    setShowActions(false);
    setState("rejected");
  };

  const handleReset = () => {
    setState("idle");
    setShowActions(false);
    setTimeout(() => {
      setState("pending");
      setTimeout(() => setShowActions(true), 1500);
    }, 1000);
  };

  return (
    <section id="workflow" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid items-start gap-16 lg:grid-cols-[1fr_1fr]">
          {/* Left - text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Human in the loop
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
              When invoices exceed policy thresholds, the agent pauses and
              routes to the CFO via Telegram. One tap to approve. The agent
              handles settlement.
            </p>
            <ul className="mt-8 space-y-3 text-[14px] text-ink-muted">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink" />
                Real-time Telegram notifications with inline callbacks
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink" />
                Stateful pause preserving full transaction context
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink" />
                Automatic Dodo settlement on approval
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink" />
                Complete audit trail for every decision
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink" />
                Merchant of Record compliance handled out-of-the-box
              </li>
            </ul>
          </motion.div>

          {/* Right - ledger line-item */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto w-full max-w-md"
          >
            {/* Telegram ledger header */}
            <div className="border-b-2 border-ink pb-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-ink-muted">
                  OmniCFO Agent via Telegram
                </span>
                <span className="font-mono text-[10px] text-ink-muted">
                  @omnicfo_bot
                </span>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-ink-muted">
                Invoice requiring approval
              </div>
            </div>

            {/* Ledger rows */}
            <div className="divide-y divide-rule">
              {[
                { label: "Vendor", value: "AWS Cloud Services" },
                { label: "Invoice ID", value: "INV-2848", mono: true },
                { label: "Amount", value: "$1,200.00", mono: true, bold: true },
                { label: "Policy", value: "Exceeds $500 threshold", amber: true },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between py-2.5">
                  <span className="text-[13px] text-ink-muted">{row.label}</span>
                  <span
                    className={`text-[13px] ${
                      row.mono ? "font-mono" : ""
                    } ${row.bold ? "font-semibold text-ink" : ""} ${
                      row.amber ? "text-amber" : "text-ink"
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="border-t border-rule py-3">
              {state === "idle" && (
                <div className="text-[11px] text-ink-muted">Initializing...</div>
              )}
              {state === "pending" && (
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
                  <span className="font-mono text-[11px] text-amber">
                    Pending approval
                  </span>
                </div>
              )}
              {state === "approved" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-[11px] text-green"
                >
                  Payment initiated via Dodo
                </motion.div>
              )}
              {state === "rejected" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-[11px] text-red"
                >
                  Rejected
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-rule pt-3">
              {showActions && (
                <div className="flex gap-4">
                  <button
                    onClick={handleApprove}
                    className="text-[13px] font-medium text-green underline decoration-green/30 underline-offset-4 transition-colors hover:decoration-green"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    className="text-[13px] font-medium text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
                  >
                    Reject
                  </button>
                </div>
              )}
              {(state === "approved" || state === "rejected") && (
                <button
                  onClick={handleReset}
                  className="text-[12px] text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
                >
                  Replay
                </button>
              )}
            </div>

            {/* Checkout URL on approve */}
            {state === "approved" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 overflow-hidden border-t border-rule pt-3"
              >
                <div className="font-mono text-[10px] text-ink-muted">
                  Dodo checkout session
                </div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-green">
                  https://test.checkout.dodopayments.com/session/cks_0Nmw...
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
