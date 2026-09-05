"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Eye,
  Plus,
  X,
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

function DetailModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Invoice Detail</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          {[
            { label: "Invoice ID", value: <span className="font-mono text-xs text-foreground">{invoice.invoice_id}</span> },
            { label: "Internal ID", value: <span className="font-mono text-[10px] text-muted-foreground">{invoice.id}</span> },
            { label: "Vendor", value: <span className="text-xs text-foreground">{invoice.vendor_name}</span> },
            { label: "Amount", value: <span className="font-mono text-xs font-semibold text-foreground">{formatCents(invoice.amount_cents)}</span> },
            { label: "Status", value: <StatusBadge status={invoice.status} /> },
            { label: "Created", value: <span className="font-mono text-[10px] text-muted-foreground">{formatDate(invoice.created_at)}</span> },
          ].map((row) => (
            <div key={row.label} className="flex justify-between border-b border-border pb-2">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              {row.value}
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          {invoice.status === "PENDING_APPROVAL" && (
            <>
              <button className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-100">
                Approve
              </button>
              <button className="flex-1 rounded-lg border border-border bg-muted py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                Reject
              </button>
            </>
          )}
          <button onClick={onClose} className="flex-1 rounded-lg border border-border bg-muted py-2 text-xs text-muted-foreground hover:text-foreground">
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
          <h1 className="text-lg font-semibold text-foreground">Invoices & Payables</h1>
          <p className="text-[10px] text-muted-foreground">
            {loading ? "Loading..." : `${filtered.length} invoices - ${formatCents(totalAmount)} total`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInvoices}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-accent/90">
            <Plus className="h-3 w-3" /> New Invoice
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 text-[10px] capitalize transition-colors ${filter === f ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none" />
        </div>
        <button onClick={() => setSort(sort === "date" ? "amount" : "date")}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[10px] text-muted-foreground hover:text-foreground">
          <ArrowUpDown className="h-3 w-3" /> {sort === "date" ? "Date" : "Amount"}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_80px] gap-2 border-b border-border px-5 py-2 text-[9px] uppercase tracking-wider text-muted-foreground">
          <div>Invoice</div>
          <div>Vendor</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Date</div>
          <div></div>
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center"><RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">No invoices found</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((inv) => (
              <div key={inv.id}
                className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_80px] items-center gap-2 px-5 py-2.5 transition-colors hover:bg-muted/50">
                <div className="font-mono text-xs text-foreground">{inv.invoice_id}</div>
                <div className="text-xs text-muted-foreground truncate">{inv.vendor_name}</div>
                <div className="font-mono text-xs font-semibold text-foreground">{formatCents(inv.amount_cents)}</div>
                <div><StatusBadge status={inv.status} /></div>
                <div className="font-mono text-[10px] text-muted-foreground">{formatDate(inv.created_at)}</div>
                <div className="flex justify-end">
                  <button onClick={() => setSelected(inv.id)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
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
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">New Invoice</span>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="invoice_id" type="text" placeholder="Invoice ID (e.g. INV-2849)" required
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50" />
              <input name="vendor" type="text" placeholder="Vendor name" required
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50" />
              <input name="amount" type="number" step="0.01" min="0" placeholder="Amount (USD)" required
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-border bg-muted py-2 text-xs text-muted-foreground">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-accent py-2 text-xs font-semibold text-white hover:bg-accent/90">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoice && <DetailModal invoice={selectedInvoice} onClose={() => setSelected(null)} />}
    </div>
  );
}
