"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ArrowUpRight,
} from "lucide-react";

type MockState = "idle" | "pending" | "approved" | "rejected";

export function LiveWorkflow() {
  const [state, setState] = useState<MockState>("idle");
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setState("pending");
      setTimeout(() => setShowButtons(true), 1500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = () => {
    setShowButtons(false);
    setState("approved");
  };

  const handleReject = () => {
    setShowButtons(false);
    setState("rejected");
  };

  const handleReset = () => {
    setState("idle");
    setShowButtons(false);
    setTimeout(() => {
      setState("pending");
      setTimeout(() => setShowButtons(true), 1500);
    }, 1000);
  };

  return (
    <section id="workflow" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
              Human-in-the-Loop
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-muted">
              When invoices exceed policy thresholds, the agent pauses and
              routes to the CFO via Telegram. One tap to approve -- the agent
              handles settlement. Closes the books without treasury drain.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "Real-time Telegram notifications with inline callbacks",
                "Stateful pause preserving full transaction context",
                "Automatic Dodo settlement on approval",
                "Complete audit trail for every decision",
                "Merchant of Record compliance handled out-of-the-box",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
                  <span className="text-xs leading-relaxed text-text-muted">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-sm">
              <div className="overflow-hidden rounded-xl border border-border bg-bg-raised">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface">
                    <Send className="h-4 w-4 text-text-muted" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text">
                      OmniCFO Agent
                    </div>
                    <div className="font-mono text-[10px] text-text-muted">
                      @omnicfo_bot
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted">
                    Invoice Requiring Approval
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Vendor</span>
                      <span className="font-medium text-text">
                        AWS Cloud Services
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Invoice ID</span>
                      <span className="font-mono text-text-muted">
                        INV-2848
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Amount</span>
                      <span className="font-mono font-semibold text-text">
                        $1,200.00
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Policy</span>
                      <span className="font-mono text-amber">
                        Exceeds $500 threshold
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {state === "idle" && (
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                        <Clock className="h-3 w-3" />
                        Initializing...
                      </div>
                    )}
                    {state === "pending" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5 rounded-full bg-amber-dim px-2.5 py-1"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
                        <span className="font-mono text-[10px] text-amber">
                          PENDING_APPROVAL
                        </span>
                      </motion.div>
                    )}
                    {state === "approved" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 rounded-full bg-green-dim px-2.5 py-1"
                      >
                        <CheckCircle2 className="h-3 w-3 text-green" />
                        <span className="font-mono text-[10px] text-green">
                          PAYMENT_INITIATED
                        </span>
                      </motion.div>
                    )}
                    {state === "rejected" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 rounded-full bg-bg-surface px-2.5 py-1"
                      >
                        <XCircle className="h-3 w-3 text-text-muted" />
                        <span className="font-mono text-[10px] text-text-muted">
                          REJECTED
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    {showButtons && (
                      <>
                        <motion.button
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={handleApprove}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-green/30 bg-green-dim py-2 text-xs font-medium text-green transition-all hover:bg-green/15 active:scale-[0.98]"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </motion.button>
                        <motion.button
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 }}
                          onClick={handleReject}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-bg-surface py-2 text-xs font-medium text-text-muted transition-all hover:text-text active:scale-[0.98]"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </motion.button>
                      </>
                    )}
                    {(state === "approved" || state === "rejected") && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleReset}
                        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-bg-surface py-2 text-xs text-text-muted transition-all hover:text-text"
                      >
                        Replay
                        <ArrowUpRight className="h-3 w-3" />
                      </motion.button>
                    )}
                  </div>

                  {state === "approved" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 overflow-hidden rounded-md border border-green/20 bg-green-dim p-2.5"
                    >
                      <div className="font-mono text-[9px] text-text-muted">
                        Dodo Checkout Session
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[10px] text-green">
                        https://test.checkout.dodopayments.com/session/cks_0Nmw...
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
