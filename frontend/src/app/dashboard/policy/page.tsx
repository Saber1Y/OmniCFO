"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  RefreshCw,
  Trash2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// --- Types ---

interface PolicyRule {
  id: string;
  name: string;
  type: "threshold" | "whitelist" | "budget";
  value: string;
  enabled: boolean;
  description: string;
}

interface VendorEntry {
  name: string;
  status: "approved" | "pending";
  spend_cents: number;
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

// --- Page ---

export default function PolicyPage() {
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [vendors, setVendors] = useState<VendorEntry[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");

  const fetchPolicy = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/policy`);
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
        setVendors(data.vendors || []);
        setAuditLog(data.auditLog || []);
      }
    } catch {
      // backend might not be running
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  const toggleRule = async (id: string) => {
    const rule = rules.find((r) => r.id === id);
    if (!rule) return;

    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setRules(updated);

    try {
      await fetch(`${API}/api/policy/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: [{ id, enabled: !rule.enabled }] }),
      });
    } catch {
      // revert on failure
      setRules(rules);
    }
  };

  const saveRuleValue = async (id: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/policy/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: [{ id, value }] }),
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
      setEditing(null);
    }
  };

  const resetRules = async () => {
    try {
      const res = await fetch(`${API}/api/policy/rules/reset`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules);
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
        const data = await res.json();
        setVendors(data.vendors);
        setNewVendorName("");
        setShowAddVendor(false);
      }
    } catch {
      // ignore
    }
  };

  const removeVendor = async (name: string) => {
    try {
      const res = await fetch(`${API}/api/policy/vendors/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors);
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
          <h1 className="text-lg font-semibold text-foreground">Policy Engine & Limits</h1>
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
            Reset Defaults
          </button>
          <button onClick={() => {
            const updates = rules.map((r) => ({ id: r.id, value: r.value, enabled: r.enabled }));
            fetch(`${API}/api/policy/rules`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ rules: updates }),
            });
          }}
            className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-accent/90">
            <Save className="h-3 w-3" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Active Rules</span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {rules.filter((r) => r.enabled).length}/{rules.length} enabled
          </span>
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" /></div>
        ) : (
          <div className="divide-y divide-border">
            {rules.map((rule) => (
              <div key={rule.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                        rule.enabled
                          ? "border-accent/40 bg-accent/10"
                          : "border-border bg-muted"
                      }`}
                    >
                      {rule.enabled && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                    </button>
                    <div>
                      <div className="text-xs font-medium text-foreground">{rule.name}</div>
                      <div className="text-[10px] text-muted-foreground">{rule.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {editing === rule.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-32 rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-foreground outline-none focus:border-accent/50"
                          autoFocus
                        />
                        <button
                          onClick={() => saveRuleValue(rule.id, editValue)}
                          disabled={saving}
                          className="rounded-md bg-accent px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
                        >
                          {saving ? "..." : "Apply"}
                        </button>
                        <button onClick={() => setEditing(null)} className="rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-mono text-xs text-foreground">{rule.value}</span>
                        <button
                          onClick={() => { setEditing(rule.id); setEditValue(rule.value); }}
                          className="rounded-lg px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
                <div key={v.name} className="flex items-center justify-between px-5 py-2">
                  <div className="text-xs text-foreground">{v.name}</div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground">{formatCents(v.spend_cents)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-mono ${
                      v.status === "approved"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}>
                      {v.status}
                    </span>
                    <button
                      onClick={() => removeVendor(v.name)}
                      className="rounded-md p-1 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
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
              {auditLog.map((log, i) => {
                const time = new Date(log.timestamp);
                const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                return (
                  <div key={i} className="px-5 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-muted-foreground">{timeStr}</span>
                        <span className="text-[10px] text-foreground">{log.rule}</span>
                      </div>
                      <span className={`font-mono text-[9px] uppercase tracking-wider ${actionColor[log.action]}`}>
                        {log.action}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {log.invoice_id} - {log.detail}
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
