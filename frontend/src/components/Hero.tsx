"use client";

import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="flex items-center pt-32 pb-20">
      <div className="mx-auto max-w-[800px] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="mb-6 inline-flex rounded-full border border-accent-border bg-accent-light px-4 py-1.5"
        >
          <span className="text-xs font-semibold tracking-wide uppercase text-accent">
            Syndicate Hackathon 2026, track 2
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
          className="font-display text-[56px]/[60px] font-medium tracking-tight text-stone-900"
        >
          Autonomous treasury management for modern enterprises
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.3 }}
          className="mx-auto mt-6 max-w-lg text-[18px]/[28px] text-muted-foreground"
        >
          The self-healing financial agent that audits invoices, enforces
          fail-closed policy gates, and triggers compliant settlements
          through Dodo Payments.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#architecture"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            See architecture
          </a>
          <a
            href="https://github.com/Saber1Y/OmniCFO"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
