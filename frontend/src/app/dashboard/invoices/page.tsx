"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Eye,
  Plus,
  X,
  Download,
  RefreshCw,
  Filter,
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
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  AUTO_APPROVED: { label: "AUTO_APPROVED", color: "text-green", bg: "bg-green-dim" },
  PAYMENT_INITIATED: { label: "PAYMENT_INITIATED", color: "text-green", bg: "bg-green-dim" },
  PENDING_APPROVAL: { label: "PENDING_APPROVAL", color: "text-amber", bg: "bg-amber-dim" },
  REJECTED: { label: "REJECTED", color: "text-text-muted", bg: "bg-bg-surface" },
  DRAFT: { label: "DRAFT", color: "text-text-muted", bg: "bg-bg-surface" },
};

function StatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] || statusConfig.DRAFT;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${c.color} ${c.bg}`}>
      {c.label}
    </span>
  );
}

function DetailModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-lg border border-border bg-bg-raised p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-text-muted" />
            <span className="text-sm font-semibold text-text">Invoice Detail</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          {[
            { label: "Invoice ID", value: <span className="font-mono text-xs text-text">{invoice.invoice_id}</span> },
            { label: "Internal ID", value: <span className="font-mono text-[10px] text-text-muted">{invoice.id}</span> },
            { label: "Vendor", value: <span className="text-xs text-text">{invoice.vendor_name}</span> },
            { label: "Amount", value: <span className="font-mono text-xs font-semibold text-text">{formatCents(invoice.amount_cents)}</span> },
            { label: "Status", value: <StatusBadge status={invoice.status} /> },
            { label: "Created", value: <span className="font-mono text-[10px] text-text-muted">{formatDate(invoice.created_at)}</span> },
          ].map((row) => (
            <div key={row.label} className="flex justify-between border-b border-border pb-2">
              <span className="text-xs text-text-muted">{row.label}</span>
              {row.value}
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          {invoice.status === "PENDING_APPROVAL" && (
            <>
              <button className="flex-1 rounded-md border border-green/30 bg-green-dim py-2 text-xs font-medium text-green hover:bg-green/15">
                Approve
              </button>
              <button className="flex-1 rounded-md border border-border bg-bg-surface py-2 text-xs font-medium text-text-muted hover:text-text">
                Reject
              </button>
            </>
          )}
          <button onClick={onClose} className="flex-1 rounded-md border border-border bg-bg-surface py-2 text-xs text-text-muted hover:text-text">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await fetch(`${API}/api/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: form.get("invoice_id"),
          vendor_name: form.get("vendor"),
          amount_cents: Math.round(parseFloat(form.get("amount") as string) * 100),
        }),
      });
      setShowForm(false);
      fetchInvoices();
    } catch { /* ignore */ }
  };

  const filters = ["all", "pending", "settled", "flagged"];

  let filtered = invoices.filter((inv) => {
    if (filter === "pending") return inv.status === "PENDING_APPROVAL";
    if (filter === "settled") return inv.status === "AUTO_APPROVED" || inv.status === "PAYMENT_INITIATED";
    if (filter === "flagged") return inv.status === "REJECTED";
    return true;
  });

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (inv) => inv.invoice_id.toLowerCase().includes(q) || inv.vendor_name.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sort === "amount") return (a.amount_cents - b.amount_cents) * dir;
    return a.created_at.localeCompare(b.created_at) * dir;
  });

  const selectedInvoice = invoices.find((inv) => inv.id === selected);
  const totalAmount = filtered.reduce((s, inv) => s + inv.amount_cents, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text">Invoices & Payables</h1>
          <p className="text-[10px] text-text-muted">
            {loading ? "Loading..." : `${filtered.length} invoices - ${formatCents(totalAmount)} total`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInvoices}
            className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[10px] text-text-muted hover:text-text">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1 rounded-md bg-purple px-3 py-1.5 text-[10px] font-semibold text-bg hover:bg-purple/90">
            <Plus className="h-3 w-3" /> New Invoice
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-md border border-border bg-bg-raised px-2 py-1">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded px-2 py-1 text-[10px] capitalize transition-colors ${filter === f ? "bg-purple-dim text-purple" : "text-text-muted hover:text-text"}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-bg-raised px-3 py-1.5">
          <Search className="h-3 w-3 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
            className="flex-1 bg-transparent text-xs text-text placeholder:text-text-muted/50 outline-none" />
        </div>
        <button onClick={() => setSort(sort === "date" ? "amount" : "date")}
          className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[10px] text-text-muted hover:text-text">
          <ArrowUpDown className="h-3 w-3" /> {sort === "date" ? "Date" : "Amount"}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-bg-raised">
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_80px] gap-2 border-b border-border px-4 py-2 text-[9px] uppercase tracking-wider text-text-muted">
          <div>Invoice</div>
          <div>Vendor</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Date</div>
          <div></div>
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-text-muted animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <span className="text-xs text-text-muted">No invoices found</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((inv) => (
              <div key={inv.id}
                className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_80px] items-center gap-2 px-4 py-2.5 transition-colors hover:bg-bg-surface">
                <div className="font-mono text-xs text-text">{inv.invoice_id}</div>
                <div className="text-xs text-text-muted truncate">{inv.vendor_name}</div>
                <div className="font-mono text-xs font-semibold text-text">{formatCents(inv.amount_cents)}</div>
                <div><StatusBadge status={inv.status} /></div>
                <div className="font-mono text-[10px] text-text-muted">{formatDate(inv.created_at)}</div>
                <div className="flex justify-end">
                  <button onClick={() => setSelected(inv.id)} className="rounded p-1 text-text-muted hover:text-text">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg border border-border bg-bg-raised p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-text">New Invoice</span>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="invoice_id" type="text" placeholder="Invoice ID (e.g. INV-2849)" required
                className="w-full rounded-md border border-border bg-bg-surface px-3 py-2 font-mono text-xs text-text placeholder:text-text-muted/50 outline-none focus:border-purple/40" />
              <input name="vendor" type="text" placeholder="Vendor name" required
                className="w-full rounded-md border border-border bg-bg-surface px-3 py-2 text-xs text-text placeholder:text-text-muted/50 outline-none focus:border-purple/40" />
              <input name="amount" type="number" step="0.01" min="0" placeholder="Amount (USD)" required
                className="w-full rounded-md border border-border bg-bg-surface px-3 py-2 font-mono text-xs text-text placeholder:text-text-muted/50 outline-none focus:border-purple/40" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-md border border-border bg-bg-surface py-2 text-xs text-text-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-md bg-purple py-2 text-xs font-semibold text-bg hover:bg-purple/90">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoice && <DetailModal invoice={selectedInvoice} onClose={() => setSelected(null)} />}
    </div>
  );
}
