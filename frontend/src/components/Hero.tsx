"use client";

import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="flex items-center pt-32 pb-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        {/* Left: text */}
        <div>
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
            className="mt-6 max-w-lg text-[18px]/[28px] text-muted-foreground"
          >
            The self-healing financial agent that audits invoices, enforces
            fail-closed policy gates, and triggers compliant settlements through
            Dodo Payments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <a
              href="/dashboard"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Open dashboard
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

        {/* Right: terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="overflow-hidden rounded-2xl border border-border bg-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-stone-700/50 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-stone-600/60" />
            <span className="h-3 w-3 rounded-full bg-stone-600/60" />
            <span className="h-3 w-3 rounded-full bg-stone-600/60" />
            <span className="ml-3 text-xs font-mono text-stone-500">
              omnicfo -- invoice pipeline
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-5 font-mono text-[13px] leading-[22px] text-stone-300">
            {/* Line 1 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <span className="text-emerald-400">$</span>{" "}
              <span className="text-stone-400">omnicfo</span>{" "}
              <span className="text-stone-500">ingest</span>{" "}
              <span className="text-stone-400">--vendor</span>{" "}
              <span className="text-white">AWS</span>{" "}
              <span className="text-stone-400">--amount</span>{" "}
              <span className="text-white">$450.00</span>
            </motion.div>

            {/* Line 2 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
              className="mt-1"
            >
              <span className="text-stone-500">
                Invoice INV-2847 ingested, running audit...
              </span>
            </motion.div>

            {/* Line 3 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.3 }}
              className="mt-2"
            >
              <span className="text-accent font-semibold">audit</span>{" "}
              <span className="text-stone-400">intent_label:</span>{" "}
              <span className="text-white">Cloud infrastructure</span>
            </motion.div>

            {/* Line 4 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.6 }}
              className="mt-1"
            >
              <span className="text-accent font-semibold">audit</span>{" "}
              <span className="text-stone-400">confidence:</span>{" "}
              <span className="text-white">0.97</span>
            </motion.div>

            {/* Line 5 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.9 }}
              className="mt-2"
            >
              <span className="text-stone-500">
                policy check --threshold $500
              </span>
            </motion.div>

            {/* Line 6 - result */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 2.2 }}
              className="mt-2"
            >
              <span className="text-emerald-400 font-semibold">APPROVED</span>{" "}
              <span className="text-stone-500">
                under threshold, settling...
              </span>
            </motion.div>

            {/* Line 7 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 2.6 }}
              className="mt-1"
            >
              <span className="text-emerald-400 font-semibold">settled</span>{" "}
              <span className="text-stone-400">checkout_session:</span>{" "}
              <span className="text-stone-500">created</span>
            </motion.div>

            {/* Line 8 - second invoice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 3.0 }}
              className="mt-3"
            >
              <span className="text-emerald-400">$</span>{" "}
              <span className="text-stone-400">omnicfo</span>{" "}
              <span className="text-stone-500">ingest</span>{" "}
              <span className="text-stone-400">--vendor</span>{" "}
              <span className="text-white">Stripe</span>{" "}
              <span className="text-stone-400">--amount</span>{" "}
              <span className="text-white">$1,200.00</span>
            </motion.div>

            {/* Line 9 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 3.3 }}
              className="mt-1"
            >
              <span className="text-stone-500">
                Invoice INV-2848 ingested, running audit...
              </span>
            </motion.div>

            {/* Line 10 - exceed */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 3.7 }}
              className="mt-2"
            >
              <span className="text-warning font-semibold">HELD</span>{" "}
              <span className="text-stone-500">
                exceeds $500, routing to CFO...
              </span>
            </motion.div>

            {/* Cursor */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 4.0 }}
              className="mt-2 flex items-center gap-1"
            >
              <span className="text-emerald-400">$</span>
              <motion.span
                className="inline-block h-4 w-2 bg-stone-300"
                animate={{ opacity: [1, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
