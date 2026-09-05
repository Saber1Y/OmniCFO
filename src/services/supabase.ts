import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";
import { createLogger } from "../logger.js";
import type { Invoice, InvoiceCreateInput, InvoiceStatus } from "../types.js";

const log = createLogger("supabase");

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

const TABLE = "invoices";

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
