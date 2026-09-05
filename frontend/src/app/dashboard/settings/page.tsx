"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Bell,
  CreditCard,
  MessageSquare,
  Save,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Users,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface PolicyRules {
  autoApproveThresholdCents: number;
  requireTelegramApproval: boolean;
  requireDualApproval: boolean;
  maxRetryAttempts: number;
  approvalTimeoutSeconds: number;
}

interface Vendor {
  id: string;
  name: string;
  trusted: boolean;
}

interface NotificationSettings {
  emailAlerts: boolean;
  slackWebhook: string;
  alertOnRejection: boolean;
  dailySummary: boolean;
}

// --- Components ---

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        enabled ? "bg-accent" : "bg-muted"
      }`}
    >
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SaveStatus({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  return (
    <span
      className={`font-mono text-[10px] ${
        status === "saved"
          ? "text-emerald-600"
          : status === "saving"
            ? "text-amber-600"
            : "text-red-500"
      }`}
    >
      {status === "saving" && "Saving..."}
      {status === "saved" && "Saved"}
      {status === "error" && "Error saving"}
    </span>
  );
}

// --- Page ---

export default function SettingsPage() {
  const [rules, setRules] = useState<PolicyRules>({
    autoApproveThresholdCents: 50000,
    requireTelegramApproval: true,
    requireDualApproval: false,
    maxRetryAttempts: 3,
    approvalTimeoutSeconds: 300,
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: false,
    slackWebhook: "",
    alertOnRejection: true,
    dailySummary: true,
  });
  const [thresholdInput, setThresholdInput] = useState("500");
  const [newVendor, setNewVendor] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [vendorSaveStatus, setVendorSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const fetchPolicy = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/policy`);
      if (res.ok) {
        const data = await res.json();
        const r = data.rules || {};
        setRules({
          autoApproveThresholdCents: r.autoApproveThresholdCents ?? 50000,
          requireTelegramApproval: r.requireTelegramApproval ?? true,
          requireDualApproval: r.requireDualApproval ?? false,
          maxRetryAttempts: r.maxRetryAttempts ?? 3,
          approvalTimeoutSeconds: r.approvalTimeoutSeconds ?? 300,
        });
        setThresholdInput(String((r.autoApproveThresholdCents ?? 50000) / 100));
        setVendors(data.vendors || []);
      }
    } catch {
      // backend might not be running
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  const saveRules = async () => {
    setSaveStatus("saving");
    const thresholdCents = Math.round(parseFloat(thresholdInput) * 100);
    const updated = { ...rules, autoApproveThresholdCents: thresholdCents };
    try {
      const res = await fetch(`${API}/api/policy/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setRules(updated);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const addVendor = async () => {
    if (!newVendor.trim()) return;
    setVendorSaveStatus("saving");
    try {
      const res = await fetch(`${API}/api/policy/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newVendor.trim() }),
      });
      if (res.ok) {
        const v = await res.json();
        setVendors([...vendors, v]);
        setNewVendor("");
        setVendorSaveStatus("saved");
        setTimeout(() => setVendorSaveStatus("idle"), 2000);
      }
    } catch {
      setVendorSaveStatus("error");
      setTimeout(() => setVendorSaveStatus("idle"), 3000);
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

  const resetPolicies = async () => {
    try {
      const res = await fetch(`${API}/api/policy/rules/reset`, { method: "POST" });
      if (res.ok) {
        fetchPolicy();
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-[10px] text-muted-foreground">
          Configure your treasury agent thresholds, approvals, and notifications
        </p>
      </div>

      {/* Auto-Approval Threshold */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              Auto-Approval Threshold
            </span>
          </div>
          <SaveStatus status={saveStatus} />
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
              className="w-32 rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-accent/50"
            />
            <span className="text-xs text-muted-foreground">USD</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[100, 250, 500, 1000, 2500].map((amt) => (
              <button
                key={amt}
                onClick={() => setThresholdInput(String(amt))}
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
          <button
            onClick={saveRules}
            className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-accent/90"
          >
            <Save className="h-3 w-3" /> Save Threshold
          </button>
        </div>
      </div>

      {/* Approval Rules */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Approval Rules</span>
          </div>
          <SaveStatus status={saveStatus} />
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-xs text-foreground">Telegram CFO Approval</div>
              <div className="text-[10px] text-muted-foreground">
                Hold high-value invoices for manual review via Telegram
              </div>
            </div>
            <Toggle
              enabled={rules.requireTelegramApproval}
              onToggle={() =>
                setRules({ ...rules, requireTelegramApproval: !rules.requireTelegramApproval })
              }
            />
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-xs text-foreground">Dual Approval Required</div>
              <div className="text-[10px] text-muted-foreground">
                Require two approvers for invoices above threshold
              </div>
            </div>
            <Toggle
              enabled={rules.requireDualApproval}
              onToggle={() =>
                setRules({ ...rules, requireDualApproval: !rules.requireDualApproval })
              }
            />
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-xs text-foreground">Approval Timeout</div>
              <div className="text-[10px] text-muted-foreground">
                Auto-reject if no response within this window
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="60"
                step="60"
                value={rules.approvalTimeoutSeconds}
                onChange={(e) =>
                  setRules({ ...rules, approvalTimeoutSeconds: parseInt(e.target.value) || 300 })
                }
                className="w-20 rounded-md border border-border bg-muted px-2 py-1 text-right font-mono text-xs text-foreground outline-none focus:border-accent/50"
              />
              <span className="text-[10px] text-muted-foreground">sec</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-xs text-foreground">Max Retry Attempts</div>
              <div className="text-[10px] text-muted-foreground">
                Number of times to retry failed settlements
              </div>
            </div>
            <input
              type="number"
              min="1"
              max="10"
              value={rules.maxRetryAttempts}
              onChange={(e) =>
                setRules({ ...rules, maxRetryAttempts: parseInt(e.target.value) || 3 })
              }
              className="w-16 rounded-md border border-border bg-muted px-2 py-1 text-right font-mono text-xs text-foreground outline-none focus:border-accent/50"
            />
          </div>
        </div>
        <div className="border-t border-border px-5 py-3">
          <button
            onClick={saveRules}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-accent/90"
          >
            <Save className="h-3 w-3" /> Save Rules
          </button>
        </div>
      </div>

      {/* Vendor Whitelist */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Vendor Whitelist</span>
          </div>
          <SaveStatus status={vendorSaveStatus} />
        </div>
        <div className="divide-y divide-border">
          {vendors.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground">{v.name}</span>
                {v.trusted && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-mono text-emerald-600">
                    TRUSTED
                  </span>
                )}
              </div>
              <button
                onClick={() => removeVendor(v.id)}
                className="text-[10px] text-muted-foreground hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          {vendors.length === 0 && (
            <div className="px-5 py-4 text-center text-[10px] text-muted-foreground">
              No vendors configured
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-border px-5 py-3">
          <input
            type="text"
            value={newVendor}
            onChange={(e) => setNewVendor(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addVendor()}
            placeholder="Add vendor name..."
            className="flex-1 rounded-md border border-border bg-muted px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50"
          />
          <button
            onClick={addVendor}
            disabled={!newVendor.trim()}
            className="rounded-lg bg-accent px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-accent/90 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Notifications</span>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-xs text-foreground">Alert on Rejection</div>
              <div className="text-[10px] text-muted-foreground">
                Send notification when an invoice is rejected
              </div>
            </div>
            <Toggle
              enabled={notifications.alertOnRejection}
              onToggle={() =>
                setNotifications({
                  ...notifications,
                  alertOnRejection: !notifications.alertOnRejection,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-xs text-foreground">Daily Summary</div>
              <div className="text-[10px] text-muted-foreground">
                Receive daily treasury activity summary
              </div>
            </div>
            <Toggle
              enabled={notifications.dailySummary}
              onToggle={() =>
                setNotifications({
                  ...notifications,
                  dailySummary: !notifications.dailySummary,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-xs text-foreground">Slack Webhook</div>
              <div className="text-[10px] text-muted-foreground">
                Post invoice alerts to a Slack channel
              </div>
            </div>
            <input
              type="text"
              value={notifications.slackWebhook}
              onChange={(e) =>
                setNotifications({ ...notifications, slackWebhook: e.target.value })
              }
              placeholder="https://hooks.slack.com/..."
              className="w-60 rounded-md border border-border bg-muted px-2 py-1 text-right font-mono text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50"
            />
          </div>
        </div>
      </div>

      {/* Dodo Payments Info */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Payment Gateway</span>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-muted-foreground">Provider</span>
            <span className="font-mono text-xs text-foreground">Dodo Payments</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-muted-foreground">Environment</span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 font-mono text-[9px] text-amber-600">
              TEST
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-muted-foreground">Currency</span>
            <span className="font-mono text-xs text-foreground">USD</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-muted-foreground">Settlement</span>
            <span className="text-[10px] text-muted-foreground">
              Checkout sessions via Dodo API
            </span>
          </div>
        </div>
      </div>

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
                Restore all policy rules and thresholds to factory defaults ($500)
              </div>
            </div>
            <button
              onClick={resetPolicies}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-[10px] text-red-500 hover:bg-red-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
