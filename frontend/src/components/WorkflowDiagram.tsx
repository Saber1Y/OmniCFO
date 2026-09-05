"use client";

import { motion } from "motion/react";
import {
  FileText,
  Brain,
  ShieldCheck,
  MessageSquare,
  CreditCard,
  Activity,
} from "lucide-react";

const W = 1240;
const H = 460;

const nodes = [
  { id: "ingestion", x: 80, y: 180, w: 215, h: 118, icon: FileText, label: "Ingestion", sub: "PDF / Email / API", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { id: "audit", x: 390, y: 180, w: 215, h: 118, icon: Brain, label: "Multi-LLM Audit", sub: "Cascade verification", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { id: "policy", x: 700, y: 80, w: 215, h: 118, icon: ShieldCheck, label: "Policy Gate", sub: "Fail-closed rules", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { id: "approval", x: 700, y: 280, w: 215, h: 118, icon: MessageSquare, label: "Human Approval", sub: "Telegram callback", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { id: "settlement", x: 1010, y: 130, w: 215, h: 118, icon: CreditCard, label: "Dodo Settlement", sub: "Merchant of Record", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { id: "observability", x: 1010, y: 320, w: 215, h: 118, icon: Activity, label: "Observability", sub: "Structured traces", color: "#78716c", bg: "#f5f0eb", border: "#e7e0d8" },
];

const edges = [
  { from: "ingestion", to: "audit", d: "M295,240 L390,240", color: "#a8a29e", label: "" },
  { from: "audit", to: "policy", d: "M605,240 L660,240 Q680,240 680,180 L700,139", color: "#6366f1", label: "pass" },
  { from: "audit", to: "approval", d: "M605,240 L660,240 Q680,240 680,300 L700,339", color: "#f59e0b", label: "exceeds" },
  { from: "policy", to: "settlement", d: "M915,139 L960,139 Q980,139 980,190 L1010,190", color: "#059669", label: "approved" },
  { from: "approval", to: "settlement", d: "M915,339 L960,339 Q980,339 980,270 L1010,220", color: "#059669", label: "approved" },
  { from: "approval", to: "observability", d: "M915,339 L960,339 Q980,339 980,370 L1010,379", color: "#a8a29e", label: "" },
  { from: "settlement", to: "observability", d: "M1117,248 L1117,320", color: "#a8a29e", label: "" },
];

export function WorkflowDiagram() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="font-display text-[32px]/[36px] font-medium tracking-tight text-stone-900">
            Architecture
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            A fail-closed pipeline where every invoice passes through
            verification, policy enforcement, and human approval before
            settlement.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="overflow-x-auto"
        >
          <div
            className="relative min-w-[940px]"
            style={{ aspectRatio: `${W}/${H}` }}
          >
            {/* SVG connectors */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`0 0 ${W} ${H}`}
              fill="none"
            >
              <defs>
                <marker
                  id="arrowMarker"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L8,3 L0,6" fill="none" stroke="#a8a29e" strokeWidth="1.2" />
                </marker>
                {edges.map((e, i) => (
                  <marker
                    key={`marker-${i}`}
                    id={`arrow-${i}`}
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L8,3 L0,6" fill="none" stroke={e.color} strokeWidth="1.2" />
                  </marker>
                ))}
              </defs>

              {edges.map((e, i) => (
                <motion.path
                  key={i}
                  d={e.d}
                  stroke={e.color}
                  strokeWidth={1.6}
                  strokeDasharray="6 5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.15 + i * 0.16 }}
                  markerEnd={`url(#arrow-${i})`}
                />
              ))}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.id}
                  className="absolute flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  style={{
                    left: `${(node.x / W) * 100}%`,
                    top: `${(node.y / H) * 100}%`,
                    width: `${(node.w / W) * 100}%`,
                    height: `${(node.h / H) * 100}%`,
                  }}
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 + i * 0.16 }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border"
                    style={{ backgroundColor: node.bg, color: node.color, borderColor: node.border }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <p className="text-[13px] font-semibold tracking-tight text-stone-800">
                    {node.label}
                  </p>
                  <p className="text-[11px] text-stone-500">{node.sub}</p>
                </motion.div>
              );
            })}

            {/* Edge labels */}
            {edges.map((e, i) => {
              if (!e.label) return null;
              // Position label at midpoint of edge
              const parts = e.d.match(/[\d.]+/g)!.map(Number);
              const midX = (parts[0] + parts[parts.length - 2]) / 2;
              const midY = (parts[1] + parts[parts.length - 1]) / 2;
              return (
                <motion.span
                  key={`label-${i}`}
                  className="pointer-events-none absolute text-[13px] font-semibold"
                  style={{
                    left: `${(midX / W) * 100}%`,
                    top: `${(midY / H) * 100}%`,
                    color: e.color,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: 0.3 + i * 0.16 }}
                >
                  {e.label}
                </motion.span>
              );
            })}

            {/* Connection ports */}
            {nodes.map((node) => {
              const cx = node.x + node.w / 2;
              const cy = node.y + node.h / 2;
              return (
                <span
                  key={`port-${node.id}`}
                  className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
                  style={{
                    left: `${(cx / W) * 100}%`,
                    top: `${(cy / H) * 100}%`,
                    background: node.color,
                  }}
                />
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
