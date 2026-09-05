"use client";

import { motion } from "motion/react";

const links = [
  { label: "Architecture", href: "#architecture" },
  { label: "Workflow", href: "#workflow" },
  { label: "Tech", href: "#tech" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <div className="font-display text-base font-medium text-stone-900">
            OmniCFO
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/Saber1Y/OmniCFO"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>

          <p className="text-[13px] text-muted-foreground">
            Built by{" "}
            <span className="font-medium text-stone-800">Saber CM</span>
            {" & "}
            <span className="font-medium text-stone-800">Amal Reji</span>
          </p>

          <p className="text-[12px] text-muted-foreground">
            Open source, MIT license. Syndicate Hackathon 2026, Track 2.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
