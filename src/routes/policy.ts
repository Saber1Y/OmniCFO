import { Router, type Request, type Response } from "express";
import { createLogger } from "../logger.js";
import {
  getPolicyRules,
  updatePolicyRules,
  resetPolicyRules,
  listVendors,
  addVendor,
  removeVendor,
  getAuditLog,
  recordAuditEntry,
  getAutoApproveThresholdCents,
} from "../services/supabase.js";

const log = createLogger("route:policy");

export const policyRouter = Router();

/**
 * GET /api/policy
 *
 * Returns policy rules, vendor whitelist, and recent audit log.
 */
policyRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const [rules, vendors, auditLog] = await Promise.all([
      getPolicyRules(),
      listVendors(),
      getAuditLog(20),
    ]);
    res.json({ rules, vendors, auditLog });
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
policyRouter.get("/rules", async (_req: Request, res: Response) => {
  try {
    const rules = await getPolicyRules();
    res.json({ rules });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to fetch rules", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/policy/rules
 *
 * Update policy rules. Accepts a flat object with rule fields.
 */
policyRouter.put("/rules", async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== "object") {
      res.status(400).json({ error: "rules must be an object" });
      return;
    }

    const rules = await updatePolicyRules(updates);
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
policyRouter.post("/rules/reset", async (_req: Request, res: Response) => {
  try {
    const rules = await resetPolicyRules();
    log.info("Policy rules reset to defaults");
    res.json({ rules });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to reset rules", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/policy/vendors
 *
 * Returns the vendor whitelist.
 */
policyRouter.get("/vendors", async (_req: Request, res: Response) => {
  try {
    const vendors = await listVendors();
    res.json({ vendors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to fetch vendors", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/policy/vendors
 *
 * Add a vendor to the whitelist.
 */
policyRouter.post("/vendors", async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const vendor = await addVendor(name);
    res.status(201).json(vendor);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Vendor already exists") {
      res.status(409).json({ error: message });
      return;
    }
    log.error("Failed to add vendor", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/policy/vendors/:id
 *
 * Remove a vendor from the whitelist by ID.
 */
policyRouter.delete("/vendors/:id", async (req: Request, res: Response) => {
  try {
const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await removeVendor(id);
    log.info("Vendor removed", { id });
    res.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to remove vendor", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/policy/audit
 *
 * Returns the audit log.
 */
policyRouter.get("/audit", async (_req: Request, res: Response) => {
  try {
    const auditLog = await getAuditLog(100);
    res.json({ auditLog });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to fetch audit log", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export for use by other services
export { recordAuditEntry, getAutoApproveThresholdCents };