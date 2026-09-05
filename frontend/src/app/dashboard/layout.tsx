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
  Circle,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Invoices & Payables", href: "/dashboard/invoices", icon: FileText },
  { label: "Policy Engine", href: "/dashboard/policy", icon: ShieldCheck },
  { label: "Agent Activity", href: "/dashboard/activity", icon: Activity },
  { label: "Settings & API Keys", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside
        className={`flex shrink-0 flex-col border-r border-border bg-bg-raised transition-all duration-200 ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="flex h-12 items-center justify-between border-b border-border px-3">
          {!collapsed && (
            <Link href="/" className="text-sm font-semibold text-text">
              Omni<span className="text-purple">CFO</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded p-1 text-text-muted hover:text-text"
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
                    ? "bg-purple-dim text-text"
                    : "text-text-muted hover:bg-bg-surface hover:text-text"
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
            <Circle className="h-2 w-2 fill-green text-green" />
            {!collapsed && (
              <span className="text-[10px] text-text-muted">
                AO Daemon: Connected
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-bg-raised px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-border bg-bg-surface px-2.5 py-1 text-[10px] font-medium text-text">
              OmniCFO-Mainnet
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Circle className="h-1.5 w-1.5 fill-green text-green" />
              <span className="font-mono text-[10px] text-text-muted">
                AO Daemon: Connected
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-purple-dim text-[10px] font-semibold text-purple">
              SC
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
