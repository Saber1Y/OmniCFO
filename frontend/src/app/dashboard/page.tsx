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
  AUTO_APPROVED: { label: "AUTO_APPROVED", color: "text-green", bg: "bg-green-soft" },
  PAYMENT_INITIATED: { label: "PAYMENT_INITIATED", color: "text-green", bg: "bg-green-soft" },
  PENDING_APPROVAL: { label: "PENDING_APPROVAL", color: "text-amber", bg: "bg-amber-soft" },
  REJECTED: { label: "REJECTED", color: "text-ink-muted", bg: "bg-paper-raised" },
  DRAFT: { label: "DRAFT", color: "text-ink-muted", bg: "bg-paper-raised" },
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
    <div className="rounded-lg border border-rule bg-paper-raised p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
        <Icon className="h-4 w-4 text-ink-muted" />
      </div>
      <div className="mt-2 text-xl font-semibold text-ink">{value}</div>
      {trend && <div className="mt-1 font-mono text-[10px] text-green">{trend}</div>}
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-lg border border-rule bg-paper-raised p-4">
      <div className="mb-4 text-xs font-semibold text-ink">Spend by Vendor</div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-right text-[10px] text-ink-muted truncate">{d.label}</div>
            <div className="flex-1">
              <div className="h-5 rounded bg-text-muted/30 transition-all" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
            <div className="w-16 shrink-0 font-mono text-[10px] text-ink-muted">{formatCents(d.value)}</div>
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
    <div className="rounded-lg border border-rule bg-paper-raised p-4">
      <div className="mb-4 text-xs font-semibold text-ink">Status Distribution</div>
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
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-text font-mono text-xs">
            {total}
          </text>
        </svg>
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="text-[10px] text-ink-muted">{d.label}</span>
              <span className="ml-auto font-mono text-[10px] text-ink">{d.value}</span>
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
      <div className="w-full max-w-md rounded-lg border border-rule bg-paper-raised p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-ink-muted" />
            <span className="text-sm font-semibold text-ink">Submit Invoice</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-ink-muted">Invoice ID</label>
            <input type="text" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} placeholder="INV-2849"
              className="w-full rounded-md border border-rule bg-paper-raised px-3 py-2 font-mono text-xs text-ink placeholder:text-ink-muted/50 outline-none focus:border-ink/30" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-ink-muted">Vendor</label>
            <input type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="AWS Cloud Services"
              className="w-full rounded-md border border-rule bg-paper-raised px-3 py-2 text-xs text-ink placeholder:text-ink-muted/50 outline-none focus:border-ink/30" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-ink-muted">Amount (USD)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="450.00"
              className="w-full rounded-md border border-rule bg-paper-raised px-3 py-2 font-mono text-xs text-ink placeholder:text-ink-muted/50 outline-none focus:border-ink/30" required />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-md border border-rule bg-paper-raised py-2 text-xs text-ink-muted hover:text-ink">Cancel</button>
            <button type="submit" className="flex-1 rounded-md bg-purple py-2 text-xs font-semibold text-paper hover:bg-ink/90">Submit</button>
          </div>
          <p className="text-[10px] text-ink-muted">Auto-approves under $500. Sends to Telegram for review above.</p>
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

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

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
    AUTO_APPROVED: "#34d399",
    PENDING_APPROVAL: "#fbbf24",
    REJECTED: "#7c7891",
    DRAFT: "#7c7891",
  };
  const donutData = Array.from(statusMap.entries()).map(([label, value]) => ({
    label: label.replace("_", " "),
    value,
    color: donutColors[label] || "#7c7891",
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total Invoices" value={String(totalInvoices)} icon={FileText} />
        <MetricCard label="Volume Cleared" value={formatCents(totalVolume)} icon={DollarSign} />
        <MetricCard label="Pending Reviews" value={String(pendingCount)} icon={Clock} />
        <MetricCard label="Autonomous Rate" value={`${autoRate}%`} trend="Under $500 threshold" icon={Zap} />
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-rule bg-paper-raised">
            <RefreshCw className="h-4 w-4 text-ink-muted animate-spin" />
          </div>
        ) : (
          <>
            <BarChart data={barData} />
            <DonutChart data={donutData} />
          </>
        )}
      </div>

      {/* Invoices + Activity */}
      <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
        {/* Invoices Table */}
        <div className="rounded-lg border border-rule bg-paper-raised">
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-ink-muted" />
              <span className="text-xs font-semibold text-ink">Invoices & Payables</span>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1 rounded-md bg-purple px-3 py-1.5 text-[10px] font-semibold text-paper hover:bg-ink/90">
              <Plus className="h-3 w-3" /> Submit Invoice
            </button>
          </div>

          <div className="flex items-center gap-1 border-b border-rule px-4 py-2">
            <Filter className="h-3 w-3 text-ink-muted" />
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded px-2 py-1 text-[10px] capitalize transition-colors ${filter === f ? "bg-amber-soft text-ink" : "text-ink-muted hover:text-ink"}`}>
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-ink-muted animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <FileText className="h-6 w-6 text-ink-muted/30" />
              <span className="text-xs text-ink-muted">No invoices yet</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-paper-raised">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-rule bg-paper-raised">
                      {inv.status === "PENDING_APPROVAL" ? <Clock className="h-3 w-3 text-amber" />
                        : inv.status === "REJECTED" ? <XCircle className="h-3 w-3 text-ink-muted" />
                        : <CheckCircle2 className="h-3 w-3 text-green" />}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-ink">{inv.vendor_name}</div>
                      <div className="font-mono text-[10px] text-ink-muted">{inv.invoice_id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold text-ink">{formatCents(inv.amount_cents)}</div>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="rounded-lg border border-rule bg-paper-raised">
          <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
            <Activity className="h-4 w-4 text-ink-muted" />
            <span className="text-xs font-semibold text-ink">Recent Activity</span>
          </div>
          <div className="divide-y divide-border">
            {invoices.slice(0, 8).map((inv) => (
              <div key={inv.id} className="px-4 py-2">
                <div className="font-mono text-[9px] text-ink-muted">
                  {new Date(inv.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
                <div className="mt-0.5 text-[11px] text-ink-muted">
                  <span className="text-ink">{inv.invoice_id}</span> {inv.vendor_name} - {formatCents(inv.amount_cents)}
                </div>
                <div className="mt-0.5"><StatusBadge status={inv.status} /></div>
              </div>
            ))}
            {!loading && invoices.length === 0 && (
              <div className="px-4 py-6 text-center text-[10px] text-ink-muted">No activity yet</div>
            )}
          </div>
        </div>
      </div>

      {showModal && <SubmitModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}
    </div>
  );
}
