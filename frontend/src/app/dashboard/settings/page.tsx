"use client";

import { useState } from "react";
import {
  Key,
  MessageSquare,
  CreditCard,
  Bell,
  Eye,
  EyeOff,
  CheckCircle2,
  Copy,
} from "lucide-react";

// --- Data ---

interface ApiKey {
  name: string;
  key: string;
  service: string;
  status: "active" | "inactive";
  lastUsed: string;
}

const apiKeys: ApiKey[] = [
  { name: "Supabase URL", key: "https://xyzcompany.supabase.co", service: "Supabase", status: "active", lastUsed: "2 min ago" },
  { name: "Supabase Service Key", key: "eyJhbGciOiJIUzI1NiIs...", service: "Supabase", status: "active", lastUsed: "2 min ago" },
  { name: "Dodo API Key", key: "dodo_test_PVa0uz2vM8D964yz...", service: "Dodo Payments", status: "active", lastUsed: "5 min ago" },
  { name: "Telegram Bot Token", key: "7847:AAH5k...", service: "Telegram", status: "active", lastUsed: "1 min ago" },
  { name: "Telegram Chat ID", key: "2034552420", service: "Telegram", status: "active", lastUsed: "1 min ago" },
];

const configSections = [
  {
    title: "Telegram Bot",
    icon: MessageSquare,
    fields: [
      { label: "Bot Username", value: "@omnicfo_bot", editable: false },
      { label: "CFO Chat ID", value: "2034552420", editable: true },
      { label: "Approval Timeout", value: "300 seconds", editable: true },
      { label: "Retry Attempts", value: "3", editable: true },
    ],
  },
  {
    title: "Dodo Payments",
    icon: CreditCard,
    fields: [
      { label: "Environment", value: "Test", editable: false },
      { label: "Base URL", value: "https://test.dodopayments.com", editable: false },
      { label: "Product ID", value: "pdt_0Nmw7740CjLSuF3GAUb0B", editable: true },
      { label: "Currency", value: "USD", editable: true },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    fields: [
      { label: "Email Alerts", value: "Disabled", editable: true },
      { label: "Slack Webhook", value: "Not configured", editable: true },
      { label: "Alert on Rejection", value: "Enabled", editable: true },
      { label: "Daily Summary", value: "Enabled", editable: true },
    ],
  },
];

// --- Components ---

function SecretField({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 font-mono text-xs text-foreground">
        {visible ? value : "\u2022".repeat(20)}
      </span>
      <button onClick={() => setVisible(!visible)} className="text-muted-foreground hover:text-foreground">
        {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </button>
      <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
        {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}

// --- Page ---

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings & API Keys</h1>
        <p className="text-[10px] text-muted-foreground">
          Manage credentials, integrations, and agent configuration
        </p>
      </div>

      {/* API Keys */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Key className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">API Keys & Credentials</span>
        </div>
        <div className="divide-y divide-border">
          {apiKeys.map((k) => (
            <div key={k.name} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted">
                  <Key className="h-3 w-3 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground">{k.name}</div>
                  <div className="text-[10px] text-muted-foreground">{k.service}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <SecretField value={k.key} />
                <span className="font-mono text-[9px] text-muted-foreground">{k.lastUsed}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-mono ${
                  k.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"
                }`}>
                  {k.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Config Sections */}
      {configSections.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.title} className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">{section.title}</span>
            </div>
            <div className="divide-y divide-border">
              {section.fields.map((field) => (
                <div key={field.label} className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-xs text-muted-foreground">{field.label}</span>
                  {field.editable ? (
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-60 rounded-md border border-border bg-muted px-2 py-1 text-right font-mono text-xs text-foreground outline-none focus:border-accent/50"
                    />
                  ) : (
                    <span className="font-mono text-xs text-foreground">{field.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="border-b border-red-200 px-5 py-3">
          <span className="text-xs font-semibold text-red-500">Danger Zone</span>
        </div>
        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-foreground">Reset All Policies</div>
              <div className="text-[10px] text-muted-foreground">
                Restores all policy rules to factory defaults
              </div>
            </div>
            <button className="rounded-lg border border-red-200 px-3 py-1.5 text-[10px] text-red-500 hover:bg-red-50">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
