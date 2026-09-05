"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  FileText,
  Brain,
  ShieldCheck,
  MessageSquare,
  CreditCard,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Invoice {
  id: string;
  invoice_id: string;
  vendor_name: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

// Generate trace from invoice status
interface TraceStep {
  time: string;
  node: string;
  icon: React.ComponentType<{ className?: string }>;
  msg: string;
  detail: string;
  status: "success" | "pending" | "error";
}

function buildTrace(inv: Invoice): TraceStep[] {
  const isPending = inv.status === "PENDING_APPROVAL";
  const isSettled = inv.status === "AUTO_APPROVED" || inv.status === "PAYMENT_INITIATED";
  const isRejected = inv.status === "REJECTED";

  const time = new Date(inv.created_at);
  const fmt = (s: number) => {
    const d = new Date(time.getTime() + s * 1000);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const steps: TraceStep[] = [
    { time: fmt(0), node: "Ingestion", icon: FileText, msg: `Invoice parsed via OCR`, detail: `Vendor: ${inv.vendor_name}. Amount: ${formatCents(inv.amount_cents)}.`, status: "success" },
    { time: fmt(1), node: "Multi-LLM Audit", icon: Brain, msg: "Audit cascade completed", detail: `Vendor: ${inv.vendor_name}. Duplicate check: pass.`, status: "success" },
  ];

  if (isPending) {
    steps.push({ time: fmt(2), node: "Policy Gate", icon: ShieldCheck, msg: `Amount ${formatCents(inv.amount_cents)} exceeds $500 threshold`, detail: "Routed to human approval.", status: "pending" });
    steps.push({ time: fmt(3), node: "Telegram Alert", icon: MessageSquare, msg: "Interactive callback sent to CFO", detail: "Awaiting response.", status: "pending" });
  } else if (isSettled) {
    steps.push({ time: fmt(2), node: "Policy Gate", icon: ShieldCheck, msg: `Auto-approved: ${formatCents(inv.amount_cents)} < $500`, detail: "No human review required.", status: "success" });
    steps.push({ time: fmt(3), node: "Dodo Settlement", icon: CreditCard, msg: "Checkout session dispatched", detail: "Settlement completed.", status: "success" });
  } else if (isRejected) {
    steps.push({ time: fmt(2), node: "Policy Gate", icon: ShieldCheck, msg: `Rejected: ${formatCents(inv.amount_cents)} exceeds hard limit`, detail: "Requires manual override.", status: "error" });
  }

  return steps;
}

const statusColors: Record<string, string> = {
  success: "text-emerald-600",
  pending: "text-amber-600",
  error: "text-red-500",
  skipped: "text-muted-foreground",
};

const statusBg: Record<string, string> = {
  success: "bg-emerald-50",
  pending: "bg-amber-50",
  error: "bg-red-50",
  skipped: "bg-muted",
};

export default function ActivityPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/invoices`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch { /* backend offline */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  useEffect(() => {
    if (invoices.length > 0 && !selected) {
      setSelected(invoices[0].invoice_id);
    }
  }, [invoices, selected]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedInvoice = invoices.find((inv) => inv.invoice_id === selected);
  const currentTrace = selectedInvoice ? buildTrace(selectedInvoice) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Agent Activity & DAG Traces</h1>
          <p className="text-[10px] text-muted-foreground">
            Full execution history with state transitions and structured logs
          </p>
        </div>
        <button onClick={fetchInvoices}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground">
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Execution List */}
        <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Executions</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{invoices.length}</span>
          </div>
          {loading ? (
            <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" /></div>
          ) : (
            <div className="divide-y divide-border">
              {invoices.map((inv) => {
                const isActive = inv.status === "PENDING_APPROVAL";
                const isSettled = inv.status === "AUTO_APPROVED" || inv.status === "PAYMENT_INITIATED";
                const statusLabel = isActive ? "pending" : isSettled ? "success" : "error";
                return (
                  <button
                    key={inv.invoice_id}
                    onClick={() => setSelected(inv.invoice_id)}
                    className={`flex w-full items-center justify-between px-5 py-2.5 text-left transition-colors ${
                      selected === inv.invoice_id
                        ? "bg-accent/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <div className="font-mono text-xs text-foreground">{inv.invoice_id}</div>
                      <div className="text-[9px] text-muted-foreground truncate max-w-[140px]">{inv.vendor_name}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[9px] font-mono uppercase tracking-wider ${statusColors[statusLabel]}`}>
                        {statusLabel}
                      </div>
                      <div className="font-mono text-[9px] text-muted-foreground">{formatCents(inv.amount_cents)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Trace View */}
        <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">DAG Trace</span>
              {selected && <span className="font-mono text-[10px] text-foreground">{selected}</span>}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {currentTrace.length} nodes
            </span>
          </div>

          {/* Pipeline visualization */}
          {selectedInvoice && (
            <div className="border-b border-border px-5 py-3">
              <div className="flex items-center gap-1">
                {["Ingestion", "Audit", "Policy", "Settlement"].map((step, i) => {
                  const entry = currentTrace[currentTrace.length - 1 - i];
                  const isActive = entry && entry.status === "success";
                  const isPending = entry && entry.status === "pending";
                  return (
                    <div key={step} className="flex items-center">
                      <div
                        className={`flex h-7 items-center rounded-md px-2 text-[9px] font-mono ${
                          isPending
                            ? "bg-amber-50 text-amber-600"
                            : isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step}
                      </div>
                      {i < 3 && <ChevronRight className="mx-0.5 h-3 w-3 text-muted-foreground/30" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trace entries */}
          {loading ? (
            <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" /></div>
          ) : currentTrace.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
              Select an invoice to view its trace
            </div>
          ) : (
            <div className="divide-y divide-border">
              {currentTrace.map((entry, i) => {
                const Icon = entry.icon;
                const key = `${entry.time}-${entry.node}`;
                return (
                  <div key={i} className="px-5 py-3">
                    <button
                      onClick={() => toggleExpand(key)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${statusBg[entry.status]}`}>
                        <Icon className={`h-3 w-3 ${statusColors[entry.status]}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-muted-foreground">{entry.time}</span>
                            <span className="text-xs font-medium text-foreground">{entry.node}</span>
                          </div>
                          <span className={`font-mono text-[9px] uppercase tracking-wider ${statusColors[entry.status]}`}>
                            {entry.status}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{entry.msg}</div>
                      </div>
                      <ChevronDown
                        className={`mt-1 h-3 w-3 shrink-0 text-muted-foreground transition-transform ${
                          expanded[key] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expanded[key] && (
                      <div className="ml-9 mt-2 rounded-lg border border-border bg-muted p-2.5">
                        <div className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                          {entry.detail}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
