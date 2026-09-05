"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  RotateCcw,
} from "lucide-react";

// --- Data ---

interface PolicyRule {
  id: string;
  name: string;
  type: "threshold" | "whitelist" | "budget";
  value: string;
  enabled: boolean;
  description: string;
}

const defaultRules: PolicyRule[] = [
  { id: "r1", name: "Auto-Approve Threshold", type: "threshold", value: "$500.00", enabled: true, description: "Invoices at or below this amount are auto-approved without human review." },
  { id: "r2", name: "Telegram Alert Threshold", type: "threshold", value: "$500.01", enabled: true, description: "Invoices above this amount are routed to CFO via Telegram for approval." },
  { id: "r3", name: "Hard Rejection Limit", type: "threshold", value: "$50,000.00", enabled: true, description: "Invoices exceeding this amount are automatically rejected. Requires manual override." },
  { id: "r4", name: "Monthly Budget Cap", type: "budget", value: "$200,000.00", enabled: true, description: "Total monthly spend cap. New invoices are flagged when approaching limit." },
  { id: "r5", name: "Duplicate Detection", type: "threshold", value: "Enabled", enabled: true, description: "Cross-references invoice hashes against Supabase to prevent duplicate payments." },
  { id: "r6", name: "Vendor Whitelist Mode", type: "whitelist", value: "Strict", enabled: false, description: "Only pre-approved vendors can receive payments. Unknown vendors require manual review." },
];

const vendorList = [
  { name: "AWS Cloud Services", status: "approved", spend: "$45,000.00" },
  { name: "Datadog Inc.", status: "approved", spend: "$120,000.00" },
  { name: "GitHub Enterprise", status: "approved", spend: "$21,000.00" },
  { name: "Vercel Platform", status: "approved", spend: "$8,900.00" },
  { name: "Supabase Pro", status: "approved", spend: "$25,000.00" },
  { name: "Stripe Processing", status: "approved", spend: "$340,000.00" },
  { name: "Unknown Vendor LLC", status: "pending", spend: "$0.00" },
];

const auditLog = [
  { time: "09:12:03", rule: "Telegram Alert Threshold", action: "triggered", invoice: "INV-2848", detail: "$1,200 > $500" },
  { time: "09:12:01", rule: "Auto-Approve Threshold", action: "passed", invoice: "INV-2847", detail: "$450 < $500" },
  { time: "09:11:55", rule: "Duplicate Detection", action: "passed", invoice: "INV-2847", detail: "No hash match" },
  { time: "09:10:22", rule: "Monthly Budget Cap", action: "warning", invoice: "INV-2846", detail: "87% of $200k cap" },
  { time: "09:08:10", rule: "Hard Rejection Limit", action: "passed", invoice: "INV-2845", detail: "$89 < $50k" },
  { time: "08:55:00", rule: "Vendor Whitelist Mode", action: "skipped", invoice: "INV-2844", detail: "Rule disabled" },
];

// --- Page ---

export default function PolicyPage() {
  const [rules, setRules] = useState(defaultRules);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAddVendor, setShowAddVendor] = useState(false);

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const actionColor: Record<string, string> = {
    triggered: "text-amber",
    passed: "text-green",
    warning: "text-amber",
    skipped: "text-ink-muted",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink">Policy Engine & Limits</h1>
          <p className="text-[10px] text-ink-muted">
            Fail-closed rules enforcing spend thresholds, vendor whitelisting, and budget caps
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 rounded-md border border-rule px-3 py-1.5 text-[10px] text-ink-muted hover:text-ink">
            <RotateCcw className="h-3 w-3" />
            Reset Defaults
          </button>
          <button className="flex items-center gap-1 rounded-md bg-purple px-3 py-1.5 text-[10px] font-semibold text-paper hover:bg-ink/90">
            <Save className="h-3 w-3" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-lg border border-rule bg-paper-raised">
        <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-ink-muted" />
          <span className="text-xs font-semibold text-ink">Active Rules</span>
          <span className="ml-auto font-mono text-[10px] text-ink-muted">
            {rules.filter((r) => r.enabled).length}/{rules.length} enabled
          </span>
        </div>
        <div className="divide-y divide-border">
          {rules.map((rule) => (
            <div key={rule.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      rule.enabled
                        ? "border-purple/40 bg-amber-soft"
                        : "border-rule bg-paper-raised"
                    }`}
                  >
                    {rule.enabled && <CheckCircle2 className="h-3 w-3 text-green" />}
                  </button>
                  <div>
                    <div className="text-xs font-medium text-ink">{rule.name}</div>
                    <div className="text-[10px] text-ink-muted">{rule.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-ink">{rule.value}</span>
                  <button
                    onClick={() => setEditing(editing === rule.id ? null : rule.id)}
                    className="rounded px-2 py-1 text-[10px] text-ink-muted hover:text-ink"
                  >
                    Edit
                  </button>
                </div>
              </div>
              {editing === rule.id && (
                <div className="mt-3 ml-8 rounded-md border border-rule bg-paper-raised p-3">
                  <input
                    type="text"
                    defaultValue={rule.value}
                    className="w-full rounded border border-rule bg-paper-raised px-2 py-1.5 font-mono text-xs text-ink outline-none focus:border-ink/30"
                  />
                  <div className="mt-2 flex gap-2">
                    <button className="rounded bg-purple px-3 py-1 text-[10px] font-semibold text-paper">Apply</button>
                    <button onClick={() => setEditing(null)} className="rounded px-3 py-1 text-[10px] text-ink-muted">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Vendor Whitelist */}
        <div className="rounded-lg border border-rule bg-paper-raised">
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <span className="text-xs font-semibold text-ink">Vendor Whitelist</span>
            <button
              onClick={() => setShowAddVendor(true)}
              className="flex items-center gap-1 rounded bg-amber-soft px-2 py-1 text-[10px] text-ink hover:bg-amber-soft"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          <div className="divide-y divide-border">
            {vendorList.map((v) => (
              <div key={v.name} className="flex items-center justify-between px-4 py-2">
                <div className="text-xs text-ink">{v.name}</div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-ink-muted">{v.spend}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-mono ${
                    v.status === "approved"
                      ? "bg-green-soft text-green"
                      : "bg-amber-soft text-amber"
                  }`}>
                    {v.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="rounded-lg border border-rule bg-paper-raised">
          <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-ink-muted" />
            <span className="text-xs font-semibold text-ink">Policy Audit Log</span>
          </div>
          <div className="divide-y divide-border">
            {auditLog.map((log, i) => (
              <div key={i} className="px-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-ink-muted">{log.time}</span>
                    <span className="text-[10px] text-ink">{log.rule}</span>
                  </div>
                  <span className={`font-mono text-[9px] uppercase tracking-wider ${actionColor[log.action]}`}>
                    {log.action}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-ink-muted">
                  {log.invoice} - {log.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-lg border border-rule bg-paper-raised p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Add Vendor</span>
              <button onClick={() => setShowAddVendor(false)} className="text-ink-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Vendor name"
                className="w-full rounded-md border border-rule bg-paper-raised px-3 py-2 text-xs text-ink placeholder:text-ink-muted/50 outline-none focus:border-ink/30"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowAddVendor(false)} className="flex-1 rounded-md border border-rule bg-paper-raised py-2 text-xs text-ink-muted">
                  Cancel
                </button>
                <button className="flex-1 rounded-md bg-purple py-2 text-xs font-semibold text-paper hover:bg-ink/90">
                  Add Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
