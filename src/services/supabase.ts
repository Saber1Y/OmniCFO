import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";
import { createLogger } from "../logger.js";
import type { Invoice, InvoiceCreateInput, InvoiceStatus } from "../types.js";

const log = createLogger("supabase");

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

const TABLE = "invoices";
const POLICY_TABLE = "policy_settings";
const VENDORS_TABLE = "policy_vendors";
const AUDIT_TABLE = "policy_audit";

// --- Types ---

export interface PolicyRules {
  autoApproveThresholdCents: number;
  requireTelegramApproval: boolean;
  requireDualApproval: boolean;
  maxRetryAttempts: number;
  approvalTimeoutSeconds: number;
}

export interface VendorEntry {
  id: string;
  name: string;
  trusted: boolean;
}

export interface AuditEntry {
  timestamp: string;
  rule: string;
  action: "triggered" | "passed" | "warning" | "skipped" | "rejected";
  invoice_id: string;
  detail: string;
}

// --- Invoice functions ---

export async function insertInvoice(input: InvoiceCreateInput): Promise<Invoice> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      invoice_id: input.invoice_id,
      vendor_name: input.vendor_name,
      amount_cents: input.amount_cents,
      status: "DRAFT" as InvoiceStatus,
      metadata: input.metadata ?? null,
    })
    .select()
    .single();

  if (error) {
    log.error("Failed to insert invoice", { error: error.message, invoice_id: input.invoice_id });
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  log.info("Invoice inserted", { id: data.id, invoice_id: data.invoice_id });
  return data as Invoice;
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("invoice_id", invoiceId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    log.error("Failed to fetch invoice", { error: error.message, invoice_id: invoiceId });
    throw new Error(`Supabase fetch failed: ${error.message}`);
  }

  return data as Invoice;
}

export async function getInvoiceByIdInternal(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    log.error("Failed to fetch invoice by internal id", { error: error.message, id });
    throw new Error(`Supabase fetch failed: ${error.message}`);
  }

  return data as Invoice;
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
  extra?: {
    approved_by?: string;
    payment_id?: string;
    telegram_message_id?: number;
  }
): Promise<Invoice> {
  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (extra?.approved_by) {
    update.approved_by = extra.approved_by;
    update.approved_at = new Date().toISOString();
  }
  if (extra?.payment_id) {
    update.payment_id = extra.payment_id;
  }
  if (extra?.telegram_message_id !== undefined) {
    update.telegram_message_id = extra.telegram_message_id;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    log.error("Failed to update invoice", { error: error.message, id, status });
    throw new Error(`Supabase update failed: ${error.message}`);
  }

  log.info("Invoice updated", { id: data.id, status });
  return data as Invoice;
}

export async function listPendingInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("status", "PENDING_APPROVAL")
    .order("created_at", { ascending: true });

  if (error) {
    log.error("Failed to list pending invoices", { error: error.message });
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  return (data ?? []) as Invoice[];
}

export async function listAllInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    log.error("Failed to list all invoices", { error: error.message });
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  return (data ?? []) as Invoice[];
}

// --- Policy Settings ---

const DEFAULT_RULES: PolicyRules = {
  autoApproveThresholdCents: config.policy.autoApproveThresholdCents,
  requireTelegramApproval: true,
  requireDualApproval: false,
  maxRetryAttempts: 3,
  approvalTimeoutSeconds: 300,
};

export async function getPolicyRules(): Promise<PolicyRules> {
  const { data, error } = await supabase
    .from(POLICY_TABLE)
    .select("rules")
    .eq("id", 1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No row yet, return defaults
      return DEFAULT_RULES;
    }
    log.error("Failed to fetch policy rules", { error: error.message });
    throw new Error(`Supabase fetch failed: ${error.message}`);
  }

  return { ...DEFAULT_RULES, ...(data.rules as Record<string, unknown>) } as PolicyRules;
}

export async function updatePolicyRules(updates: Partial<PolicyRules>): Promise<PolicyRules> {
  const current = await getPolicyRules();
  const merged = { ...current, ...updates };

  const { error } = await supabase
    .from(POLICY_TABLE)
    .upsert({ id: 1, rules: merged, updated_at: new Date().toISOString() });

  if (error) {
    log.error("Failed to update policy rules", { error: error.message });
    throw new Error(`Supabase update failed: ${error.message}`);
  }

  log.info("Policy rules updated", { threshold: merged.autoApproveThresholdCents });
  return merged;
}

export async function resetPolicyRules(): Promise<PolicyRules> {
  const { error } = await supabase
    .from(POLICY_TABLE)
    .upsert({ id: 1, rules: DEFAULT_RULES, updated_at: new Date().toISOString() });

  if (error) {
    log.error("Failed to reset policy rules", { error: error.message });
    throw new Error(`Supabase update failed: ${error.message}`);
  }

  log.info("Policy rules reset to defaults");
  return DEFAULT_RULES;
}

// --- Vendors ---

export async function listVendors(): Promise<VendorEntry[]> {
  const { data, error } = await supabase
    .from(VENDORS_TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    log.error("Failed to list vendors", { error: error.message });
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  return (data ?? []).map((v) => ({ id: v.id, name: v.name, trusted: v.trusted }));
}

export async function addVendor(name: string): Promise<VendorEntry> {
  const { data, error } = await supabase
    .from(VENDORS_TABLE)
    .insert({ name })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Vendor already exists");
    }
    log.error("Failed to add vendor", { error: error.message, name });
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  log.info("Vendor added", { name });
  return { id: data.id, name: data.name, trusted: data.trusted };
}

export async function removeVendor(id: string): Promise<void> {
  const { error } = await supabase
    .from(VENDORS_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    log.error("Failed to remove vendor", { error: error.message, id });
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
}

// --- Audit Log ---

export async function recordAuditEntry(entry: Omit<AuditEntry, "timestamp">): Promise<void> {
  const { error } = await supabase
    .from(AUDIT_TABLE)
    .insert({
      rule: entry.rule,
      action: entry.action,
      invoice_id: entry.invoice_id,
      detail: entry.detail,
    });

  if (error) {
    log.error("Failed to record audit entry", { error: error.message });
    // Don't throw - audit is best effort
  }
}

export async function getAuditLog(limit = 20): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from(AUDIT_TABLE)
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    log.error("Failed to fetch audit log", { error: error.message });
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  return (data ?? []).map((a) => ({
    timestamp: a.timestamp,
    rule: a.rule,
    action: a.action,
    invoice_id: a.invoice_id,
    detail: a.detail,
  }));
}

export async function getAutoApproveThresholdCents(): Promise<number> {
  const rules = await getPolicyRules();
  return rules.autoApproveThresholdCents;
}
