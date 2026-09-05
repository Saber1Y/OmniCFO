"use client";

import { motion } from "motion/react";
import { Brain, ShieldCheck, Lock, AlertTriangle } from "lucide-react";

const W = 1240;
const H = 560;

const nodes = [
  { id: "llm", x: 120, y: 180, w: 190, h: 110, icon: Brain, label: "LLM Verifier", sub: "AI reasoning", color: "#e11d48", bg: "#fff1f2", border: "#fecdd3" },
  { id: "policy", x: 720, y: 80, w: 190, h: 110, icon: ShieldCheck, label: "Policy Engine", sub: "Deterministic rules", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { id: "vault", x: 720, y: 300, w: 190, h: 110, icon: Lock, label: "Payment Vault", sub: "Settlement execution", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { id: "alert", x: 1020, y: 190, w: 190, h: 110, icon: AlertTriangle, label: "Human Review", sub: "Telegram approval", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
];

const edges = [
  { from: "llm", to: "policy", d: "M310,235 L580,235 Q600,235 600,180 L720,135", color: "#a8a29e", label: "audit result" },
  { from: "llm", to: "alert", d: "M310,235 L580,235 Q620,235 620,280 L1020,245", color: "#f59e0b", label: "exceeds threshold" },
  { from: "policy", to: "vault", d: "M815,190 L815,300", color: "#059669", label: "approved" },
  { from: "alert", to: "vault", d: "M1020,245 L960,245 Q940,245 940,300 L910,355", color: "#059669", label: "approved" },
];

export function SecurityDiagram() {
  return (
    <section id="architecture" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="font-display text-[32px]/[36px] font-medium tracking-tight text-stone-900">
            Security model
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            AI-assisted reasoning sits inside a sandbox. Deterministic
            enforcement never leaves the safe zone. Funds move only when both
            agree.
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
            {/* Zone panels */}
            <motion.div
              className="absolute rounded-3xl border-2 border-dashed"
              style={{
                left: "3%",
                top: "8%",
                width: "46%",
                height: "84%",
                background: "rgba(244,63,94,0.035)",
                borderColor: "rgba(244,63,94,0.35)",
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: 0.15 }}
            />

            <motion.div
              className="absolute rounded-3xl border-2 border-dashed"
              style={{
                left: "52%",
                top: "8%",
                width: "45%",
                height: "84%",
                background: "rgba(99,102,241,0.04)",
                borderColor: "rgba(99,102,241,0.35)",
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: 0.2 }}
            />

            {/* Zone labels */}
            <motion.span
              className="absolute rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-[11px] font-semibold text-rose-600"
              style={{ left: "16%", top: "4%" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: 0.25 }}
            >
              AI sandbox
            </motion.span>

            <motion.span
              className="absolute rounded-full border border-accent-border bg-accent-light px-3 py-1 text-[11px] font-semibold text-accent"
              style={{ left: "66%", top: "4%" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: 0.3 }}
            >
              Deterministic enforcement
            </motion.span>

            {/* Boundary line */}
            <motion.div
              className="absolute top-[12%] h-[76%] w-px border-l-2 border-dashed border-stone-300"
              style={{ left: "50%" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: 0.2 }}
            />

            {/* SVG connectors */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`0 0 ${W} ${H}`}
              fill="none"
            >
              <defs>
                {edges.map((e, i) => (
                  <marker
                    key={`marker-${i}`}
                    id={`sec-arrow-${i}`}
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
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 + i * 0.16 }}
                  markerEnd={`url(#sec-arrow-${i})`}
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
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.35 + i * 0.16 }}
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
              const parts = e.d.match(/[\d.]+/g)!.map(Number);
              const midX = (parts[0] + parts[parts.length - 2]) / 2;
              const midY = (parts[1] + parts[parts.length - 1]) / 2;
              return (
                <motion.span
                  key={`label-${i}`}
                  className="pointer-events-none absolute text-[12px] font-semibold"
                  style={{
                    left: `${(midX / W) * 100}%`,
                    top: `${(midY / H) * 100}%`,
                    color: e.color,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: 0.5 + i * 0.16 }}
                >
                  {e.label}
                </motion.span>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
