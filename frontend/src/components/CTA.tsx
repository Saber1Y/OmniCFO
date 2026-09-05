"use client";

import { motion } from "motion/react";

export function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[640px] px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="font-display text-[44px]/[48px] font-medium tracking-tight text-stone-900"
        >
          Ready to see it in action?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="mt-5 text-[16px]/[26px] text-muted-foreground"
        >
          Deploy your own autonomous CFO agent. Self-hosted, open source,
          fully auditable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="/dashboard"
            className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            Open dashboard
          </a>
          <a
            href="https://github.com/Saber1Y/OmniCFO"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-7 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
