"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

type LedgerStatus = "pending" | "resolved";

interface LedgerLine {
  vendor: string;
  invoiceId: string;
  amount: string;
  policy: string;
  status: LedgerStatus;
  resolvedLabel?: string;
  resolvedColor?: string;
}

const initialLines: LedgerLine[] = [
  {
    vendor: "AWS Cloud Services",
    invoiceId: "INV-2847",
    amount: "450.00",
    policy: "Under $500 threshold",
    status: "pending",
  },
  {
    vendor: "Stripe Processing",
    invoiceId: "INV-2848",
    amount: "1,200.00",
    policy: "Exceeds $500 limit",
    status: "pending",
  },
];

export function Hero() {
  const [lines, setLines] = useState<LedgerLine[]>(initialLines);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResolving(true);
      setTimeout(() => {
        setLines((prev) =>
          prev.map((line, i) => {
            if (i === 0) {
              return {
                ...line,
                status: "resolved",
                resolvedLabel: "Approved",
                resolvedColor: "text-green",
              };
            }
            if (i === 1) {
              return {
                ...line,
                status: "resolved",
                resolvedLabel: "Held - exceeds limit",
                resolvedColor: "text-amber",
              };
            }
            return line;
          })
        );
      }, 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative flex min-h-[90dvh] items-center">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1fr_480px]">
        {/* Left - text */}
        <div className="flex flex-col justify-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-4 text-[13px] text-ink-muted">
              Syndicate Hackathon 2026, track 2
            </p>
            <h1 className="font-serif text-4xl font-bold leading-[1.15] tracking-tight text-ink md:text-5xl lg:text-[3.4rem]">
              Autonomous treasury management for modern enterprises
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-muted">
              The self-healing financial agent that audits invoices, enforces
              fail-closed policy gates, and triggers compliant settlements
              through Dodo Payments. Without human friction, until safety
              requires it.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="#architecture"
                className="rounded-full border border-ink px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                See architecture
              </a>
              <a
                href="https://github.com/Saber1Y/OmniCFO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right - animating ledger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mx-auto w-full max-w-md"
        >
          {/* Ledger header */}
          <div className="border-b-2 border-ink pb-2">
            <div className="grid grid-cols-[1fr_80px_90px_90px] gap-3 text-[10px] uppercase tracking-wider text-ink-muted">
              <span>Vendor</span>
              <span className="text-right">Invoice</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
            </div>
          </div>

          {/* Ledger rows */}
          <div className="divide-y divide-rule">
            {lines.map((line, i) => (
              <div
                key={line.invoiceId}
                className="grid grid-cols-[1fr_80px_90px_90px] items-center gap-3 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-ink">{line.vendor}</div>
                  <div className="font-mono text-[11px] text-ink-muted">
                    {line.invoiceId}
                  </div>
                </div>
                <div className="text-right font-mono text-sm tabular-nums text-ink">
                  {line.amount}
                </div>
                <div className="text-right font-mono text-[11px] text-ink-muted">
                  {line.policy}
                </div>
                <div className="text-right">
                  <AnimatePresence mode="wait">
                    {line.status === "pending" ? (
                      <motion.span
                        key="pending"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted"
                      >
                        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
                        Pending
                      </motion.span>
                    ) : (
                      <motion.span
                        key="resolved"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-[11px] font-medium ${line.resolvedColor}`}
                      >
                        {line.resolvedLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          {/* Ledger footer */}
          <div className="mt-3 flex items-center justify-between border-t border-rule pt-2">
            <span className="text-[11px] text-ink-muted">
              2 invoices processed
            </span>
            <span className="font-mono text-[11px] text-ink-muted">
              {resolving ? "resolved" : "processing..."}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
