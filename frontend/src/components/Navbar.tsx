"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Shield, Menu, X, ExternalLink } from "lucide-react";

const navLinks = [
  { label: "Architecture", href: "#architecture" },
  { label: "Workflow", href: "#workflow" },
  { label: "Tech", href: "#tech" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-text-muted" />
          <span className="text-sm font-semibold text-text">
            Omni<span className="text-purple">CFO</span>
          </span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/Saber1Y/OmniCFO"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-muted transition-all hover:border-purple/30 hover:text-text"
          >
            GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-text-muted md:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-border bg-bg/95 px-6 py-3 md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-xs text-text-muted hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}
