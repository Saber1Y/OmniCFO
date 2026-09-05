"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Trash2,
  DollarSign,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// --- Types ---

interface PolicyRules {
  autoApproveThresholdCents: number;
  requireTelegramApproval: boolean;
  requireDualApproval: boolean;
  maxRetryAttempts: number;
  approvalTimeoutSeconds: number;
}

interface VendorEntry {
  id: string;
  name: string;
  trusted: boolean;
}

interface AuditEntry {
  timestamp: string;
  rule: string;
  action: "triggered" | "passed" | "warning" | "skipped" | "rejected";
  invoice_id: string;
  detail: string;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

const ruleLabels: Record<string, { label: string; description: string }> = {
  autoApproveThresholdCents: {
    label: "Auto-Approve Threshold",
    description: "Invoices at or below this amount are auto-approved without human review.",
  },
  requireTelegramApproval: {
    label: "Telegram CFO Approval",
    description: "Hold high-value invoices for manual review via Telegram.",
  },
  requireDualApproval: {
    label: "Dual Approval Required",
    description: "Require two approvers for invoices above threshold.",
  },
  maxRetryAttempts: {
    label: "Max Retry Attempts",
    description: "Number of times to retry failed settlements.",
  },
  approvalTimeoutSeconds: {
    label: "Approval Timeout",
    description: "Auto-reject if no response within this window.",
  },
};

// --- Page ---

export default function PolicyPage() {
  const [rules, setRules] = useState<PolicyRules>({
    autoApproveThresholdCents: 50000,
    requireTelegramApproval: true,
    requireDualApproval: false,
    maxRetryAttempts: 3,
    approvalTimeoutSeconds: 300,
  });
  const [vendors, setVendors] = useState<VendorEntry[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [thresholdInput, setThresholdInput] = useState("500");

  const fetchPolicy = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/policy`);
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || {
          autoApproveThresholdCents: 50000,
          requireTelegramApproval: true,
          requireDualApproval: false,
          maxRetryAttempts: 3,
          approvalTimeoutSeconds: 300,
        });
        setVendors(data.vendors || []);
        setAuditLog(data.auditLog || []);
        setThresholdInput(String((data.rules?.autoApproveThresholdCents ?? 50000) / 100));
      }
    } catch {
      // backend might not be running
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  const saveThreshold = async () => {
    setSaving(true);
    const thresholdCents = Math.round(parseFloat(thresholdInput) * 100);
    try {
      const res = await fetch(`${API}/api/policy/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoApproveThresholdCents: thresholdCents }),
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = async (key: keyof PolicyRules) => {
    const newValue = !rules[key];
    setRules({ ...rules, [key]: newValue });

    try {
      await fetch(`${API}/api/policy/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });
    } catch {
      setRules({ ...rules, [key]: !newValue });
    }
  };

  const updateNumberRule = async (key: keyof PolicyRules, value: number) => {
    setRules({ ...rules, [key]: value });
    try {
      await fetch(`${API}/api/policy/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      // ignore
    }
  };

  const resetRules = async () => {
    try {
      const res = await fetch(`${API}/api/policy/rules/reset`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules);
        setThresholdInput(String(data.rules.autoApproveThresholdCents / 100));
      }
    } catch {
      // ignore
    }
  };

  const addVendor = async () => {
    if (!newVendorName.trim()) return;
    try {
      const res = await fetch(`${API}/api/policy/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newVendorName.trim() }),
      });
      if (res.ok) {
        const vendor = await res.json();
        setVendors([...vendors, vendor]);
        setNewVendorName("");
        setShowAddVendor(false);
      }
    } catch {
      // ignore
    }
  };

  const removeVendor = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/policy/vendors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVendors(vendors.filter((v) => v.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const actionColor: Record<string, string> = {
    triggered: "text-amber-600",
    passed: "text-emerald-600",
    warning: "text-amber-600",
    skipped: "text-muted-foreground",
    rejected: "text-red-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Policy Engine</h1>
          <p className="text-[10px] text-muted-foreground">
            Fail-closed rules enforcing spend thresholds, vendor whitelisting, and budget caps
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPolicy}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={resetRules}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Threshold */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Auto-Approval Threshold</span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {saving ? "Saving..." : "Saved"}
          </span>
        </div>
        <div className="p-5">
          <p className="mb-3 text-[10px] text-muted-foreground">
            Invoices under this amount are auto-approved and sent to Dodo Payments.
            Above this amount, they require Telegram CFO review.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">$</span>
            <input
              type="number"
              step="100"
              min="0"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              onBlur={saveThreshold}
              className="w-32 rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-accent/50"
            />
            <span className="text-xs text-muted-foreground">USD</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[100, 250, 500, 1000, 2500].map((amt) => (
              <button
                key={amt}
                onClick={() => { setThresholdInput(String(amt)); }}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-mono transition-colors ${
                  thresholdInput === String(amt)
                    ? "bg-accent/10 text-accent"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Active Rules</span>
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" /></div>
        ) : (
          <div className="divide-y divide-border">
            {/* Boolean rules */}
            {(["requireTelegramApproval", "requireDualApproval"] as const).map((key) => {
              const info = ruleLabels[key];
              return (
                <div key={key} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-xs font-medium text-foreground">{info.label}</div>
                    <div className="text-[10px] text-muted-foreground">{info.description}</div>
                  </div>
                  <button
                    onClick={() => toggleRule(key)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      rules[key] ? "bg-accent" : "bg-muted"
                    }`}
                  >
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      rules[key] ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
              );
            })}

            {/* Number rules */}
            {([
              { key: "maxRetryAttempts" as const, min: 1, max: 10, step: 1 },
              { key: "approvalTimeoutSeconds" as const, min: 60, max: 3600, step: 60 },
            ]).map(({ key, min, max, step }) => {
              const info = ruleLabels[key];
              return (
                <div key={key} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-xs font-medium text-foreground">{info.label}</div>
                    <div className="text-[10px] text-muted-foreground">{info.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      value={rules[key]}
                      onChange={(e) => updateNumberRule(key, parseInt(e.target.value) || min)}
                      className="w-20 rounded-md border border-border bg-muted px-2 py-1 text-right font-mono text-xs text-foreground outline-none focus:border-accent/50"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {key === "approvalTimeoutSeconds" ? "sec" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Vendor Whitelist */}
        <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="text-xs font-semibold text-foreground">Vendor Whitelist</span>
            <button
              onClick={() => setShowAddVendor(true)}
              className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] text-amber-600 hover:bg-amber-100"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          {loading ? (
            <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" /></div>
          ) : (
            <div className="divide-y divide-border">
              {vendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-5 py-2">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-foreground">{v.name}</div>
                    {v.trusted && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-mono text-emerald-600">
                        TRUSTED
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeVendor(v.id)}
                    className="rounded-md p-1 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {vendors.length === 0 && (
                <div className="px-5 py-6 text-center text-[10px] text-muted-foreground">No vendors</div>
              )}
            </div>
          )}
        </div>

        {/* Audit Log */}
        <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Policy Audit Log</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{auditLog.length} entries</span>
          </div>
          {loading ? (
            <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" /></div>
          ) : auditLog.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">No audit entries yet</span>
              <span className="text-[10px] text-muted-foreground">Submit an invoice to see policy decisions here</span>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {auditLog.map((entry, i) => {
                const time = new Date(entry.timestamp);
                const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                return (
                  <div key={i} className="px-5 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-muted-foreground">{timeStr}</span>
                        <span className="text-[10px] text-foreground">{entry.rule}</span>
                      </div>
                      <span className={`font-mono text-[9px] uppercase tracking-wider ${actionColor[entry.action]}`}>
                        {entry.action}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {entry.invoice_id} - {entry.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Add Vendor</span>
              <button onClick={() => setShowAddVendor(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                placeholder="Vendor name"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addVendor()}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowAddVendor(false)} className="flex-1 rounded-lg border border-border bg-muted py-2 text-xs text-muted-foreground">
                  Cancel
                </button>
                <button onClick={addVendor} className="flex-1 rounded-lg bg-accent py-2 text-xs font-semibold text-white hover:bg-accent/90">
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
