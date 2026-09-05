"use client";

import { useState } from "react";
import {
  Activity,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  FileText,
  Brain,
  ShieldCheck,
  MessageSquare,
  CreditCard,
} from "lucide-react";

// --- Data ---

interface TraceEntry {
  time: string;
  node: string;
  icon: React.ComponentType<{ className?: string }>;
  msg: string;
  detail: string;
  status: "success" | "pending" | "error" | "skipped";
}

const traces: Record<string, TraceEntry[]> = {
  "INV-2848": [
    { time: "09:12:03", node: "Telegram Alert", icon: MessageSquare, msg: "Interactive callback sent to CFO channel", detail: "Chat ID: -100248... Buttons: Approve/Reject", status: "success" },
    { time: "09:12:03", node: "Policy Gate", icon: ShieldCheck, msg: "Amount $1,200 exceeds $500 threshold", detail: "Routed to human approval. State saved to AO checkpoint.", status: "pending" },
    { time: "09:12:02", node: "Multi-LLM Audit", icon: Brain, msg: "Audit cascade completed - no anomalies", detail: "Vendor: Datadog Inc. Duplicate check: pass. Rate check: pass.", status: "success" },
    { time: "09:12:01", node: "Ingestion", icon: FileText, msg: "Invoice parsed via OCR (Confidence: 99.4%)", detail: "Format: PDF. Pages: 1. Line items: 3.", status: "success" },
  ],
  "INV-2847": [
    { time: "09:12:03", node: "Dodo Settlement", icon: CreditCard, msg: "Checkout session dispatched", detail: "Session ID: cks_0Nmw7740CjLSuF3GAUb0B. URL sent to settlement queue.", status: "success" },
    { time: "09:12:03", node: "Policy Gate", icon: ShieldCheck, msg: "Auto-approved: $450 < $500 threshold", detail: "No human review required. Proceeding to settlement.", status: "success" },
    { time: "09:12:02", node: "Multi-LLM Audit", icon: Brain, msg: "Audit cascade completed", detail: "Vendor: AWS Cloud Services. Duplicate check: pass.", status: "success" },
    { time: "09:12:01", node: "Ingestion", icon: FileText, msg: "Invoice parsed via OCR (Confidence: 99.1%)", detail: "Format: PDF. Pages: 2. Line items: 8.", status: "success" },
  ],
  "INV-2846": [
    { time: "09:11:58", node: "Dodo Settlement", icon: CreditCard, msg: "Checkout session dispatched", detail: "Session ID: cks_1Bnw8851DkLTvG4HBVc1C.", status: "success" },
    { time: "09:11:58", node: "Policy Gate", icon: ShieldCheck, msg: "Auto-approved: $210 < $500 threshold", detail: "Proceeding to settlement.", status: "success" },
    { time: "09:11:57", node: "Multi-LLM Audit", icon: Brain, msg: "Audit completed", detail: "Vendor: GitHub Enterprise. Clean.", status: "success" },
    { time: "09:11:56", node: "Ingestion", icon: FileText, msg: "Invoice parsed (Confidence: 98.7%)", detail: "Format: Email attachment.", status: "success" },
  ],
};

const executions = [
  { id: "INV-2848", time: "09:12:03", status: "pending" as const, nodes: 4, duration: "2.1s" },
  { id: "INV-2847", time: "09:12:01", status: "success" as const, nodes: 4, duration: "1.8s" },
  { id: "INV-2846", time: "09:11:56", status: "success" as const, nodes: 4, duration: "2.3s" },
  { id: "INV-2845", time: "09:10:45", status: "success" as const, nodes: 4, duration: "1.5s" },
  { id: "INV-2844", time: "09:09:30", status: "success" as const, nodes: 4, duration: "2.0s" },
  { id: "INV-2843", time: "09:08:15", status: "pending" as const, nodes: 4, duration: "2.4s" },
];

const statusColors = {
  success: "text-green",
  pending: "text-amber",
  error: "text-red-400",
  skipped: "text-ink-muted",
};

const statusBg = {
  success: "bg-green-soft",
  pending: "bg-amber-soft",
  error: "bg-red-500/10",
  skipped: "bg-paper-raised",
};

// --- Page ---

export default function ActivityPage() {
  const [selected, setSelected] = useState<string>("INV-2848");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (time: string) => {
    setExpanded((prev) => ({ ...prev, [time]: !prev[time] }));
  };

  const currentTrace = traces[selected] || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink">Agent Activity & DAG Traces</h1>
          <p className="text-[10px] text-ink-muted">
            Full execution history with state transitions and structured logs
          </p>
        </div>
        <button className="flex items-center gap-1 rounded-md border border-rule px-3 py-1.5 text-[10px] text-ink-muted hover:text-ink">
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Execution List */}
        <div className="rounded-lg border border-rule bg-paper-raised">
          <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
            <Activity className="h-4 w-4 text-ink-muted" />
            <span className="text-xs font-semibold text-ink">Executions</span>
          </div>
          <div className="divide-y divide-border">
            {executions.map((exec) => (
              <button
                key={exec.id}
                onClick={() => setSelected(exec.id)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors ${
                  selected === exec.id
                    ? "bg-amber-soft"
                    : "hover:bg-paper-raised"
                }`}
              >
                <div>
                  <div className="font-mono text-xs text-ink">{exec.id}</div>
                  <div className="font-mono text-[9px] text-ink-muted">{exec.time}</div>
                </div>
                <div className="text-right">
                  <div className={`text-[9px] font-mono uppercase tracking-wider ${statusColors[exec.status]}`}>
                    {exec.status}
                  </div>
                  <div className="font-mono text-[9px] text-ink-muted">{exec.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trace View */}
        <div className="rounded-lg border border-rule bg-paper-raised">
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink">DAG Trace</span>
              <span className="font-mono text-[10px] text-ink">{selected}</span>
            </div>
            <span className="font-mono text-[10px] text-ink-muted">
              {currentTrace.length} nodes - {currentTrace[currentTrace.length - 1]?.time || ""}
            </span>
          </div>

          {/* Pipeline visualization */}
          <div className="border-b border-rule px-4 py-3">
            <div className="flex items-center gap-1">
              {["Ingestion", "Audit", "Policy", "Settlement"].map((step, i) => {
                const entry = currentTrace[currentTrace.length - 1 - i];
                const isActive = entry && entry.status === "success";
                const isPending = entry && entry.status === "pending";
                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={`flex h-7 items-center rounded px-2 text-[9px] font-mono ${
                        isPending
                          ? "bg-amber-soft text-amber"
                          : isActive
                          ? "bg-green-soft text-green"
                          : "bg-paper-raised text-ink-muted"
                      }`}
                    >
                      {step}
                    </div>
                    {i < 3 && <ChevronRight className="mx-0.5 h-3 w-3 text-ink-muted/30" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trace entries */}
          <div className="divide-y divide-border">
            {currentTrace.map((entry, i) => {
              const Icon = entry.icon;
              return (
                <div key={i} className="px-4 py-3">
                  <button
                    onClick={() => toggleExpand(entry.time + entry.node)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded ${statusBg[entry.status]}`}>
                      <Icon className={`h-3 w-3 ${statusColors[entry.status]}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-ink-muted">{entry.time}</span>
                          <span className="text-xs font-medium text-ink">{entry.node}</span>
                        </div>
                        <span className={`font-mono text-[9px] uppercase tracking-wider ${statusColors[entry.status]}`}>
                          {entry.status}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-ink-muted">{entry.msg}</div>
                    </div>
                    <ChevronDown
                      className={`mt-1 h-3 w-3 shrink-0 text-ink-muted transition-transform ${
                        expanded[entry.time + entry.node] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expanded[entry.time + entry.node] && (
                    <div className="ml-9 mt-2 rounded-md border border-rule bg-paper-raised p-2.5">
                      <div className="font-mono text-[10px] leading-relaxed text-ink-muted">
                        {entry.detail}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
