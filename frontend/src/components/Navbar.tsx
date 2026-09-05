"use client";

import { useState } from "react";
import { Shield, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Architecture", href: "#architecture" },
  { label: "Workflow", href: "#workflow" },
  { label: "Tech", href: "#tech" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="flex items-center gap-1 rounded-full border border-rule bg-paper/80 px-2 py-1.5 backdrop-blur-md">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 px-3 py-1">
          <Shield className="h-4 w-4 text-ink" strokeWidth={1.5} />
          <span className="font-serif text-sm font-bold tracking-tight text-ink">
            OmniCFO
          </span>
        </a>

        {/* Divider */}
        <div className="mx-1 h-4 w-px bg-rule" />

        {/* Links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden h-4 w-px bg-rule md:block" />

        {/* GitHub */}
        <a
          href="https://github.com/Saber1Y/OmniCFO"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full px-3 py-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink md:block"
        >
          GitHub
        </a>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="ml-1 rounded-full p-1.5 text-ink-muted md:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 rounded-2xl border border-rule bg-paper/95 p-3 backdrop-blur-md md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-ink-muted hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <div className="my-1 h-px bg-rule" />
          <a
            href="https://github.com/Saber1Y/OmniCFO"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-3 py-2 text-sm text-ink-muted hover:text-ink"
          >
            GitHub
          </a>
        </div>
      )}
    </div>
  );
}
