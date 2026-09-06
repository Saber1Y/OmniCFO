import { Router, type Request, type Response } from "express";
import { createLogger } from "../logger.js";
import { insertInvoice, getInvoiceById, updateInvoiceStatus, listAllInvoices } from "../services/supabase.js";
import { evaluateInvoice, formatApprovalMessage } from "../services/policy.js";
import { sendApprovalRequest } from "../services/telegram.js";
import { createCheckoutSession } from "../services/dodo.js";
import { config } from "../config.js";
import type { InvoiceCreateInput } from "../types.js";

const log = createLogger("route:invoice");
export const invoiceRouter = Router();

/**
 * POST /api/invoices
 *
 * Ingest a new invoice. Runs the policy check immediately:
 * - Under threshold: auto-approves and triggers payment
 * - Over threshold: flags as PENDING_APPROVAL and alerts CFO via Telegram
 */
invoiceRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { invoice_id, vendor_name, amount_cents, metadata } = req.body as InvoiceCreateInput & {
      metadata?: Record<string, unknown>;
    };

    // Validate required fields
    if (!invoice_id || !vendor_name || amount_cents === undefined) {
      res.status(400).json({
        error: "Missing required fields: invoice_id, vendor_name, amount_cents",
      });
      return;
    }

    if (typeof amount_cents !== "number" || amount_cents <= 0) {
      res.status(400).json({ error: "amount_cents must be a positive number" });
      return;
    }

    // Check for duplicate invoice_id
    const existing = await getInvoiceById(invoice_id);
    if (existing) {
      res.status(409).json({ error: "Invoice with this ID already exists" });
      return;
    }

    // Store invoice
    const invoice = await insertInvoice({ invoice_id, vendor_name, amount_cents, metadata });

    // Run policy check
    const decision = await evaluateInvoice(invoice);

    if (decision.approved) {
      // Auto-approve and initiate payment
      await updateInvoiceStatus(invoice.id, "AUTO_APPROVED", {
        approved_by: "SYSTEM",
      });

      log.info("Auto-approved invoice, initiating payment", { invoice_id });

      const session = await createCheckoutSession({
        amount_cents,
        description: `Payment for invoice ${invoice_id} from ${vendor_name}`,
        metadata: { invoice_id, vendor_name, vendor_email: "vendor@omnicfo.io" },
      });

      await updateInvoiceStatus(invoice.id, "PAYMENT_INITIATED", {
        payment_id: session.session_id,
      });

      res.status(201).json({
        invoice: { ...invoice, status: "AUTO_APPROVED" },
        payment: { session_id: session.session_id, checkout_url: session.checkout_url },
        decision,
      });
    } else {
      // Flag for human approval and notify via Telegram
      await updateInvoiceStatus(invoice.id, "PENDING_APPROVAL");

      const message = await formatApprovalMessage(invoice);
      const messageId = await sendApprovalRequest(message, invoice.id);

      await updateInvoiceStatus(invoice.id, "PENDING_APPROVAL", {
        telegram_message_id: messageId,
      });

      log.info("Invoice flagged for CFO approval", {
        invoice_id,
        telegram_message_id: messageId,
      });

      res.status(201).json({
        invoice: { ...invoice, status: "PENDING_APPROVAL" },
        payment: null,
        decision,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Invoice ingestion failed", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/invoices/:invoice_id
 *
 * Retrieve an invoice by its business invoice_id.
 */
invoiceRouter.get("/:invoice_id", async (req: Request, res: Response) => {
  try {
    const invoice = await getInvoiceById(String(req.params.invoice_id));
    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }
    res.json({ invoice });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to fetch invoice", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/invoices
 *
 * List all invoices from Supabase.
 */
invoiceRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const invoices = await listAllInvoices();
    res.json({ invoices });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Failed to list invoices", { error: message });
    res.status(500).json({ error: "Internal server error" });
  }
});
