"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  DollarSign,
  Clock,
  Zap,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  Filter,
  Activity,
  RefreshCw,
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  AUTO_APPROVED: { label: "APPROVED", color: "text-emerald-600", bg: "bg-emerald-50" },
  PAYMENT_INITIATED: { label: "SETTLED", color: "text-emerald-600", bg: "bg-emerald-50" },
  PENDING_APPROVAL: { label: "PENDING", color: "text-amber-600", bg: "bg-amber-50" },
  REJECTED: { label: "REJECTED", color: "text-stone-500", bg: "bg-stone-50" },
  DRAFT: { label: "DRAFT", color: "text-stone-500", bg: "bg-stone-50" },
};

function StatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] || statusConfig.DRAFT;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${c.color} ${c.bg}`}>
      {c.label}
    </span>
  );
}

function MetricCard({ label, value, trend, icon: Icon }: {
  label: string; value: string; trend?: string; icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-xl font-semibold text-foreground">{value}</div>
      {trend && <div className="mt-1 font-mono text-[10px] text-emerald-600">{trend}</div>}
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-4 text-xs font-semibold text-foreground">Spend by Vendor</div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-right text-[10px] text-muted-foreground truncate">{d.label}</div>
            <div className="flex-1">
              <div className="h-5 rounded-lg bg-accent/15 transition-all" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
            <div className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">{formatCents(d.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const size = 140;
  const r = 50;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-4 text-xs font-semibold text-foreground">Status Distribution</div>
      <div className="flex items-center gap-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((d) => {
            const pct = d.value / total;
            const dash = pct * circumference;
            const el = (
              <circle key={d.label} cx={cx} cy={cy} r={r} fill="none" stroke={d.color}
                strokeWidth="12" strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset} strokeLinecap="round" />
            );
            offset += dash;
            return el;
          })}
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-foreground font-mono text-xs">
            {total}
          </text>
        </svg>
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="text-[10px] text-muted-foreground">{d.label}</span>
              <span className="ml-auto font-mono text-[10px] text-foreground">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubmitModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: { invoice_id: string; vendor_name: string; amount_cents: number }) => void }) {
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [invoiceId, setInvoiceId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ invoice_id: invoiceId, vendor_name: vendor, amount_cents: Math.round(parseFloat(amount) * 100) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Submit Invoice</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Invoice ID</label>
            <input type="text" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} placeholder="INV-2849"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Vendor</label>
            <input type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="AWS Cloud Services"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Amount (USD)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="450.00"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50" required />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border bg-muted py-2 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            <button type="submit" className="flex-1 rounded-lg bg-accent py-2 text-xs font-semibold text-white hover:bg-accent/90">Submit</button>
          </div>
          <p className="text-[10px] text-muted-foreground">Auto-approves under $500. Sends to Telegram for review above.</p>
        </form>
      </div>
    </div>
  );
}

// --- Page ---

export default function DashboardOverview() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [threshold, setThreshold] = useState(500);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/invoices`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch {
      // backend might not be running
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchThreshold = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/policy`);
      if (res.ok) {
        const data = await res.json();
        setThreshold(Math.round((data.rules?.autoApproveThresholdCents ?? 50000) / 100));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchInvoices(); fetchThreshold(); }, [fetchInvoices, fetchThreshold]);

  const handleSubmit = async (data: { invoice_id: string; vendor_name: string; amount_cents: number }) => {
    try {
      await fetch(`${API}/api/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      fetchInvoices();
    } catch { /* ignore */ }
  };

  // Compute metrics from real data
  const totalInvoices = invoices.length;
  const totalVolume = invoices.reduce((s, inv) => s + inv.amount_cents, 0);
  const pendingCount = invoices.filter((inv) => inv.status === "PENDING_APPROVAL").length;
  const autoApproved = invoices.filter((inv) => inv.status === "AUTO_APPROVED" || inv.status === "PAYMENT_INITIATED").length;
  const autoRate = totalInvoices > 0 ? ((autoApproved / totalInvoices) * 100).toFixed(1) : "0.0";

  // Vendor spend for bar chart
  const vendorMap = new Map<string, number>();
  invoices.forEach((inv) => {
    vendorMap.set(inv.vendor_name, (vendorMap.get(inv.vendor_name) || 0) + inv.amount_cents);
  });
  const barData = Array.from(vendorMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Status distribution for donut
  const statusMap = new Map<string, number>();
  invoices.forEach((inv) => {
    const key = inv.status === "PAYMENT_INITIATED" ? "AUTO_APPROVED" : inv.status;
    statusMap.set(key, (statusMap.get(key) || 0) + 1);
  });
  const donutColors: Record<string, string> = {
    AUTO_APPROVED: "#059669",
    PENDING_APPROVAL: "#d97706",
    REJECTED: "#78716c",
    DRAFT: "#78716c",
  };
  const donutData = Array.from(statusMap.entries()).map(([label, value]) => ({
    label: label.replace("_", " "),
    value,
    color: donutColors[label] || "#78716c",
  }));

  // Filter table
  const filters = ["all", "pending", "settled", "flagged"];
  const filtered = invoices.filter((inv) => {
    if (filter === "pending") return inv.status === "PENDING_APPROVAL";
    if (filter === "settled") return inv.status === "AUTO_APPROVED" || inv.status === "PAYMENT_INITIATED";
    if (filter === "flagged") return inv.status === "REJECTED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total Invoices" value={String(totalInvoices)} icon={FileText} />
        <MetricCard label="Volume Cleared" value={formatCents(totalVolume)} icon={DollarSign} />
        <MetricCard label="Pending Reviews" value={String(pendingCount)} icon={Clock} />
        <MetricCard label="Autonomous Rate" value={`${autoRate}%`} trend={`Under $${threshold} threshold`} icon={Zap} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-card">
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <>
            <BarChart data={barData} />
            <DonutChart data={donutData} />
          </>
        )}
      </div>

      {/* Invoices + Activity */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Invoices Table */}
        <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Invoices & Payables</span>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-accent/90">
              <Plus className="h-3 w-3" /> Submit Invoice
            </button>
          </div>

          <div className="flex items-center gap-1 border-b border-border px-5 py-2">
            <Filter className="h-3 w-3 text-muted-foreground" />
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-[10px] capitalize transition-colors ${filter === f ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <FileText className="h-6 w-6 text-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">No invoices yet</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-2.5 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted">
                      {inv.status === "PENDING_APPROVAL" ? <Clock className="h-3 w-3 text-amber-600" />
                        : inv.status === "REJECTED" ? <XCircle className="h-3 w-3 text-muted-foreground" />
                        : <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground">{inv.vendor_name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{inv.invoice_id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold text-foreground">{formatCents(inv.amount_cents)}</div>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Recent Activity</span>
          </div>
          <div className="divide-y divide-border">
            {invoices.slice(0, 8).map((inv) => (
              <div key={inv.id} className="px-5 py-2">
                <div className="font-mono text-[9px] text-muted-foreground">
                  {new Date(inv.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  <span className="text-foreground">{inv.invoice_id}</span> {inv.vendor_name} - {formatCents(inv.amount_cents)}
                </div>
                <div className="mt-0.5"><StatusBadge status={inv.status} /></div>
              </div>
            ))}
            {!loading && invoices.length === 0 && (
              <div className="px-5 py-6 text-center text-[10px] text-muted-foreground">No activity yet</div>
            )}
          </div>
        </div>
      </div>

      {showModal && <SubmitModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}
    </div>
  );
}
