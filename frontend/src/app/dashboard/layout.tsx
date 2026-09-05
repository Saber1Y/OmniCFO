"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  ShieldCheck,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Policy", href: "/dashboard/policy", icon: ShieldCheck },
  { label: "Activity", href: "/dashboard/activity", icon: Activity },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex shrink-0 flex-col border-r border-border bg-card transition-all duration-200 ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="flex h-12 items-center justify-between border-b border-border px-3">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 font-display text-sm font-medium text-foreground" aria-label="OmniCFO Home">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M2 4C2 2.89543 2.89543 2 4 2H28C29.1046 2 30 2.89543 30 4V14C30 21.732 26.5 29 16 31C5.5 29 2 21.732 2 14V4Z" fill="#1C1917" stroke="#6366F1" stroke-width="1.5"/>
                <path d="M10 18L13 15L16 16L19 13L22 10" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <circle cx="10" cy="18" r="1.8" fill="#6366F1"/>
                <circle cx="13" cy="15" r="1.8" fill="#6366F1"/>
                <circle cx="16" cy="16" r="1.8" fill="#6366F1"/>
                <circle cx="19" cy="13" r="1.8" fill="#6366F1"/>
                <circle cx="22" cy="10" r="1.8" fill="#6366F1"/>
              </svg>
              <span>OmniCFO</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {!collapsed && (
              <span className="text-[10px] text-muted-foreground">
                Connected
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-border bg-muted px-2.5 py-1 text-[10px] font-medium text-foreground">
              OmniCFO - Hackathon 2026
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[10px] text-muted-foreground">Live</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
