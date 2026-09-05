import { Router, type Request, type Response } from "express";
import { createLogger } from "../logger.js";
import { config } from "../config.js";

const log = createLogger("route:policy");

// --- In-memory policy store (hackathon-simple, survives request lifecycle) ---

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

const defaultRules: PolicyRule[] = [
  {
    id: "r1",
    name: "Auto-Approve Threshold",
    type: "threshold",
    value: `$${(config.policy.autoApproveThresholdCents / 100).toFixed(2)}`,
    enabled: true,
    description: "Invoices at or below this amount are auto-approved without human review.",
  },
  {
    id: "r2",
    name: "Telegram Alert Threshold",
    type: "threshold",
    value: `$${((config.policy.autoApproveThresholdCents + 1) / 100).toFixed(2)}`,
    enabled: true,
    description: "Invoices above this amount are routed to CFO via Telegram for approval.",
  },
  {
    id: "r3",
    name: "Hard Rejection Limit",
    type: "threshold",
    value: "$50,000.00",
    enabled: true,
    description: "Invoices exceeding this amount are automatically rejected. Requires manual override.",
  },
  {
    id: "r4",
    name: "Monthly Budget Cap",
    type: "budget",
    value: "$200,000.00",
    enabled: true,
    description: "Total monthly spend cap. New invoices are flagged when approaching limit.",
  },
  {
    id: "r5",
    name: "Duplicate Detection",
    type: "threshold",
    value: "Enabled",
    enabled: true,
    description: "Cross-references invoice hashes against Supabase to prevent duplicate payments.",
  },
  {
    id: "r6",
    name: "Vendor Whitelist Mode",
    type: "whitelist",
    value: "Strict",
    enabled: false,
    description: "Only pre-approved vendors can receive payments. Unknown vendors require manual review.",
  },
];

const defaultVendors: VendorEntry[] = [
  { name: "AWS Cloud Services", status: "approved", spend_cents: 4500000 },
  { name: "Datadog Inc.", status: "approved", spend_cents: 12000000 },
  { name: "GitHub Enterprise", status: "approved", spend_cents: 2100000 },
  { name: "Vercel Platform", status: "approved", spend_cents: 890000 },
  { name: "Supabase Pro", status: "approved", spend_cents: 2500000 },
  { name: "Stripe Processing", status: "approved", spend_cents: 34000000 },
];

// Mutable state
let rules: PolicyRule[] = [...defaultRules];
let vendors: VendorEntry[] = [...defaultVendors];
let auditLog: AuditEntry[] = [];

/**
 * Record an audit entry (called from other services after policy evaluation).
 */
export function recordAuditEntry(entry: Omit<AuditEntry, "timestamp">) {
  auditLog.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // Keep last 100 entries
  if (auditLog.length > 100) {
    auditLog = auditLog.slice(0, 100);
  }
}

/**
 * Get the current auto-approve threshold in cents (reads from live rules).
 */
export function getAutoApproveThresholdCents(): number {
  const rule = rules.find((r) => r.id === "r1" && r.enabled);
  if (!rule) return config.policy.autoApproveThresholdCents;
  const match = rule.value.match(/\$([\d,]+\.?\d*)/);
  if (!match) return config.policy.autoApproveThresholdCents;
  return Math.round(parseFloat(match[1].replace(/,/g, "")) * 100);
}

// --- Router ---

export const policyRouter = Router();

/**
 * GET /api/policy
 *
 * Returns all policy rules, vendor whitelist, and recent audit log.
 */
policyRouter.get("/", (_req: Request, res: Response) => {
  try {
    res.json({
      rules,
      vendors,
      auditLog: auditLog.slice(0, 20),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to fetch policy", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/policy/rules
 *
 * Returns just the policy rules.
 */
policyRouter.get("/rules", (_req: Request, res: Response) => {
  res.json({ rules });
});

/**
 * PUT /api/policy/rules
 *
 * Update policy rules. Accepts a partial array of rule updates (matched by id).
 */
policyRouter.put("/rules", (req: Request, res: Response) => {
  try {
    const updates = req.body.rules as Partial<PolicyRule>[];
    if (!Array.isArray(updates)) {
      res.status(400).json({ error: "rules must be an array" });
      return;
    }

    for (const update of updates) {
      if (!update.id) continue;
      const idx = rules.findIndex((r) => r.id === update.id);
      if (idx === -1) continue;

      rules[idx] = { ...rules[idx], ...update };

      log.info("Policy rule updated", { rule_id: update.id, changes: update });
    }

    res.json({ rules });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to update rules", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/policy/rules/reset
 *
 * Reset all rules to defaults.
 */
policyRouter.post("/rules/reset", (_req: Request, res: Response) => {
  rules = [...defaultRules];
  log.info("Policy rules reset to defaults");
  res.json({ rules });
});

/**
 * GET /api/policy/vendors
 *
 * Returns the vendor whitelist.
 */
policyRouter.get("/vendors", (_req: Request, res: Response) => {
  res.json({ vendors });
});

/**
 * POST /api/policy/vendors
 *
 * Add a vendor to the whitelist.
 */
policyRouter.post("/vendors", (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "name is required" });
      return;
    }

    if (vendors.some((v) => v.name.toLowerCase() === name.toLowerCase())) {
      res.status(409).json({ error: "Vendor already exists" });
      return;
    }

    vendors.push({ name, status: "pending", spend_cents: 0 });
    log.info("Vendor added", { name });
    res.status(201).json({ vendors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to add vendor", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/policy/vendors/:name
 *
 * Remove a vendor from the whitelist.
 */
policyRouter.delete("/vendors/:name", (req: Request, res: Response) => {
  const name = decodeURIComponent(String(req.params.name));
  const idx = vendors.findIndex((v) => v.name === name);
  if (idx === -1) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }
  vendors.splice(idx, 1);
  log.info("Vendor removed", { name });
  res.json({ vendors });
});

/**
 * GET /api/policy/audit
 *
 * Returns the audit log.
 */
policyRouter.get("/audit", (_req: Request, res: Response) => {
  res.json({ auditLog });
});
