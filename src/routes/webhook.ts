import { Router, type Request, type Response } from "express";
import { createLogger } from "../logger.js";
import { getInvoiceByIdInternal, updateInvoiceStatus } from "../services/supabase.js";
import { answerCallbackQuery, editMessageText } from "../services/telegram.js";
import { createCheckoutSession } from "../services/dodo.js";
import type { TelegramCallbackQuery } from "../types.js";

const log = createLogger("route:webhook");
export const webhookRouter = Router();

/**
 * POST /webhook/telegram
 *
 * Receives Telegram callback queries (inline button presses).
 * Parses the callback_data to determine the action (approve/reject)
 * and the target invoice, then executes accordingly.
 */
webhookRouter.post("/telegram", async (req: Request, res: Response) => {
  try {
    const body = req.body as { callback_query?: TelegramCallbackQuery };

    if (!body.callback_query) {
      // Telegram sends various update types; ignore non-callback ones
      res.sendStatus(200);
      return;
    }

    const query = body.callback_query;

    if (!query.data || !query.message) {
      log.warn("Received callback query without data or message", { query_id: query.id });
      res.sendStatus(200);
      return;
    }

    // Parse callback data: "approve:<invoice_internal_id>" or "reject:<invoice_internal_id>"
    const [action, invoiceInternalId] = query.data.split(":");

    if (!action || !invoiceInternalId) {
      log.warn("Malformed callback data", { data: query.data });
      await answerCallbackQuery(query.id, "Invalid action");
      res.sendStatus(200);
      return;
    }

    log.info("Processing callback", {
      action,
      invoice_id: invoiceInternalId,
      from: query.from.username ?? query.from.first_name,
    });

    const invoice = await getInvoiceByIdInternal(invoiceInternalId);

    if (!invoice) {
      log.error("Invoice not found for callback", { id: invoiceInternalId });
      await answerCallbackQuery(query.id, "Invoice not found");
      res.sendStatus(200);
      return;
    }

    if (invoice.status !== "PENDING_APPROVAL") {
      log.warn("Invoice is not pending approval", {
        id: invoiceInternalId,
        current_status: invoice.status,
      });
      await answerCallbackQuery(query.id, `Invoice already ${invoice.status}`);
      res.sendStatus(200);
      return;
    }

    const cfoName = query.from.username
      ? `@${query.from.username}`
      : query.from.first_name;

    if (action === "approve") {
      // Approve the invoice and initiate payment
      await updateInvoiceStatus(invoiceInternalId, "MANUALLY_APPROVED", {
        approved_by: cfoName,
      });

      log.info("Invoice approved by CFO", {
        invoice_id: invoice.invoice_id,
        approved_by: cfoName,
      });

      // Initiate payment via Dodo
      try {
        const session = await createCheckoutSession({
          amount_cents: invoice.amount_cents,
          description: `Payment for invoice ${invoice.invoice_id} from ${invoice.vendor_name}`,
          metadata: {
            invoice_id: invoice.invoice_id,
            vendor_name: invoice.vendor_name,
            approved_by: cfoName,
            vendor_email: "vendor@omnicfo.io",
          },
        });

        await updateInvoiceStatus(invoiceInternalId, "PAYMENT_INITIATED", {
          payment_id: session.session_id,
        });

        // Update Telegram message to show approval
        if (invoice.telegram_message_id) {
          const updatedText = [
            `✅ *Invoice Approved & Payment Initiated*`,
            ``,
            `*Vendor:* ${invoice.vendor_name}`,
            `*Invoice ID:* \`${invoice.invoice_id}\``,
            `*Amount:* $${(invoice.amount_cents / 100).toFixed(2)}`,
            `*Approved by:* ${cfoName}`,
            `*Session ID:* \`${session.session_id}\``,
            `*Checkout:* ${session.checkout_url}`,
          ].join("\n");

          await editMessageText(invoice.telegram_message_id, updatedText);
        }

        await answerCallbackQuery(query.id, "Payment initiated successfully");
      } catch (paymentErr) {
        const msg = paymentErr instanceof Error ? paymentErr.message : "Unknown error";
        log.error("Payment initiation failed after approval", { error: msg });
        await updateInvoiceStatus(invoiceInternalId, "PAYMENT_FAILED");

        if (invoice.telegram_message_id) {
          await editMessageText(
            invoice.telegram_message_id,
            `⚠️ *Invoice Approved but Payment Failed*\n\nInvoice \`${invoice.invoice_id}\` was approved but the Dodo payment could not be initiated.\n\nError: ${msg}`
          );
        }

        await answerCallbackQuery(query.id, "Payment failed - check logs");
      }
    } else if (action === "reject") {
      await updateInvoiceStatus(invoiceInternalId, "REJECTED", {
        approved_by: cfoName,
      });

      log.info("Invoice rejected by CFO", {
        invoice_id: invoice.invoice_id,
        rejected_by: cfoName,
      });

      // Update Telegram message to show rejection
      if (invoice.telegram_message_id) {
        const updatedText = [
          `❌ *Invoice Rejected*`,
          ``,
          `*Vendor:* ${invoice.vendor_name}`,
          `*Invoice ID:* \`${invoice.invoice_id}\``,
          `*Amount:* $${(invoice.amount_cents / 100).toFixed(2)}`,
          `*Rejected by:* ${cfoName}`,
        ].join("\n");

        await editMessageText(invoice.telegram_message_id, updatedText);
      }

      await answerCallbackQuery(query.id, "Invoice rejected");
    } else {
      log.warn("Unknown action in callback", { action });
      await answerCallbackQuery(query.id, "Unknown action");
    }

    res.sendStatus(200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Webhook processing failed", { error: message });
    // Always return 200 to Telegram to avoid retries
    res.sendStatus(200);
  }
});

/**
 * POST /webhook/telegram/setup
 *
 * Helper endpoint to register the webhook with Telegram.
 * Call this once during setup.
 */
webhookRouter.post("/telegram/setup", async (_req: Request, res: Response) => {
  try {
    const { config } = await import("../config.js");
    const host = String(_req.get("host") ?? "localhost:3000");
    const webhookUrl = `${_req.protocol}://${host}/webhook/telegram`;

    const response = await fetch(
      `https://api.telegram.org/bot${config.telegram.botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["callback_query"],
        }),
      }
    );

    const result = await response.json();
    log.info("Webhook setup result", { result });
    res.json({ webhook_url: webhookUrl, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error("Webhook setup failed", { error: message });
    res.status(500).json({ error: message });
  }
});
