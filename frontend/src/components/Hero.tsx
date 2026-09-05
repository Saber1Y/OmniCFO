"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[90dvh] items-center">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1fr_420px]">
        {/* Left column - text */}
        <div className="flex flex-col justify-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-md border border-border bg-purple-dim px-3 py-1"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-purple">
              Syndicate Hackathon 2026 - Track 2
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold leading-[1.12] tracking-tight text-text md:text-5xl lg:text-6xl"
          >
            Autonomous Treasury Management for Modern Enterprises
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-text-muted"
          >
            The self-healing financial agent that audits invoices, enforces
            fail-closed policy gates, and triggers compliant fiat settlements
            through Dodo Payments -- without human friction, until safety
            requires it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#architecture"
              className="flex items-center gap-2 rounded-md bg-purple px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:bg-purple/90 active:scale-[0.98]"
            >
              See Architecture
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/Saber1Y/OmniCFO"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text-muted transition-all hover:border-purple/30 hover:text-text active:scale-[0.98]"
            >
              View on GitHub
            </a>
          </motion.div>
        </div>

        {/* Right column - terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="overflow-hidden rounded-xl border border-border bg-bg-raised">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-text-muted/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-text-muted/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-text-muted/30" />
              <span className="ml-2 font-mono text-[10px] text-text-muted">
                omnicfo-agent
              </span>
            </div>
            <div className="p-4 font-mono text-[11px] leading-[1.8]">
              <div className="text-text-muted">
                $ omnicfo audit --batch INV-2847..2848
              </div>
              <div className="mt-1 text-text-muted">
                [09:12:01] Ingestion: 2 invoices parsed via OCR (Confidence: 99.4%)
              </div>
              <div className="text-text-muted">
                [09:12:02] Audit Cascade: Zero duplicate hashes found in Supabase
              </div>
              <div className="text-green">
                [09:12:03] INV-2847 ($450) -- Auto-approved [Dodo Settlement Dispatched]
              </div>
              <div className="text-amber">
                [09:12:03] INV-2848 ($1,200) -- Exceeds $500 limit -- Paused (State Saved)
              </div>
              <div className="text-text-muted">
                [09:12:03] Telegram Alert: Sent interactive callback to CFO channel
              </div>
              <div className="mt-1 text-text-muted">
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
