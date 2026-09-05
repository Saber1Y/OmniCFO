import { Router, type Request, type Response } from "express";
import { createLogger } from "../logger.js";
import { config } from "../config.js";

const log = createLogger("route:policy");

// --- In-memory policy store (hackathon-simple, survives request lifecycle) ---

interface PolicyRules {
  autoApproveThresholdCents: number;
  requireTelegramApproval: boolean;
  requireDualApproval: boolean;
  maxRetryAttempts: number;
  approvalTimeoutSeconds: number;
}

interface VendorEntry {
  id: string;
  name: string;
  trusted: boolean;
}

interface AuditEntry {
  timestamp: string;
  rule: string;
  action: "triggered" | "passed" | "warning" | "skipped" | "rejected";
  invoice_id: string;
  detail: string;
}

let policyRules: PolicyRules = {
  autoApproveThresholdCents: config.policy.autoApproveThresholdCents,
  requireTelegramApproval: true,
  requireDualApproval: false,
  maxRetryAttempts: 3,
  approvalTimeoutSeconds: 300,
};

let vendors: VendorEntry[] = [
  { id: "v1", name: "AWS Cloud Services", trusted: true },
  { id: "v2", name: "Datadog Inc.", trusted: true },
  { id: "v3", name: "GitHub Enterprise", trusted: true },
  { id: "v4", name: "Vercel Platform", trusted: true },
  { id: "v5", name: "Supabase Pro", trusted: true },
  { id: "v6", name: "Stripe Processing", trusted: true },
];

let auditLog: AuditEntry[] = [];

let vendorIdCounter = 7;

/**
 * Record an audit entry (called from other services after policy evaluation).
 */
export function recordAuditEntry(entry: Omit<AuditEntry, "timestamp">) {
  auditLog.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  if (auditLog.length > 100) {
    auditLog = auditLog.slice(0, 100);
  }
}

/**
 * Get the current auto-approve threshold in cents.
 */
export function getAutoApproveThresholdCents(): number {
  return policyRules.autoApproveThresholdCents;
}

// --- Router ---

export const policyRouter = Router();

/**
 * GET /api/policy
 *
 * Returns policy rules, vendor whitelist, and recent audit log.
 */
policyRouter.get("/", (_req: Request, res: Response) => {
  try {
    res.json({
      rules: policyRules,
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
  res.json({ rules: policyRules });
});

/**
 * PUT /api/policy/rules
 *
 * Update policy rules. Accepts a flat object with rule fields.
 */
policyRouter.put("/rules", (req: Request, res: Response) => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== "object") {
      res.status(400).json({ error: "rules must be an object" });
      return;
    }

    if (updates.autoApproveThresholdCents !== undefined) {
      policyRules.autoApproveThresholdCents = Number(updates.autoApproveThresholdCents);
    }
    if (updates.requireTelegramApproval !== undefined) {
      policyRules.requireTelegramApproval = Boolean(updates.requireTelegramApproval);
    }
    if (updates.requireDualApproval !== undefined) {
      policyRules.requireDualApproval = Boolean(updates.requireDualApproval);
    }
    if (updates.maxRetryAttempts !== undefined) {
      policyRules.maxRetryAttempts = Number(updates.maxRetryAttempts);
    }
    if (updates.approvalTimeoutSeconds !== undefined) {
      policyRules.approvalTimeoutSeconds = Number(updates.approvalTimeoutSeconds);
    }

    log.info("Policy rules updated", { threshold: policyRules.autoApproveThresholdCents });
    res.json({ rules: policyRules });
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
  policyRules = {
    autoApproveThresholdCents: config.policy.autoApproveThresholdCents,
    requireTelegramApproval: true,
    requireDualApproval: false,
    maxRetryAttempts: 3,
    approvalTimeoutSeconds: 300,
  };
  log.info("Policy rules reset to defaults");
  res.json({ rules: policyRules });
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

    const vendor: VendorEntry = {
      id: `v${vendorIdCounter++}`,
      name,
      trusted: false,
    };
    vendors.push(vendor);
    log.info("Vendor added", { name });
    res.status(201).json(vendor);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to add vendor", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/policy/vendors/:id
 *
 * Remove a vendor from the whitelist by ID.
 */
policyRouter.delete("/vendors/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const idx = vendors.findIndex((v) => v.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }
  const removed = vendors.splice(idx, 1)[0];
  log.info("Vendor removed", { name: removed.name });
  res.json({ ok: true });
});

/**
 * GET /api/policy/audit
 *
 * Returns the audit log.
 */
policyRouter.get("/audit", (_req: Request, res: Response) => {
  res.json({ auditLog });
});
