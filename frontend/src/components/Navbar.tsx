"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";

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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2 font-display text-lg font-medium text-foreground" aria-label="OmniCFO Home">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M2 4C2 2.89543 2.89543 2 4 2H28C29.1046 2 30 2.89543 30 4V14C30 21.732 26.5 29 16 31C5.5 29 2 21.732 2 14V4Z" fill="#1C1917" stroke="#6366F1" stroke-width="1.5"/>
            <path d="M10 18L13 15L16 16L19 13L22 10" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="10" cy="18" r="1.8" fill="#6366F1"/>
            <circle cx="13" cy="15" r="1.8" fill="#6366F1"/>
            <circle cx="16" cy="16" r="1.8" fill="#6366F1"/>
            <circle cx="19" cy="13" r="1.8" fill="#6366F1"/>
            <circle cx="22" cy="10" r="1.8" fill="#6366F1"/>
          </svg>
          <span>OmniCFO</span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/Saber1Y/OmniCFO"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-muted-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-border bg-background/95 px-6 py-4 backdrop-blur-md md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/Saber1Y/OmniCFO"
            target="_blank"
            rel="noopener noreferrer"
            className="block py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
        </motion.div>
      )}
    </motion.nav>
  );
}
