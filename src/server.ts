import { createApp } from "./app.js";
import { config } from "./config.js";
import { createLogger } from "./logger.js";
import { deleteWebhook, startPolling, answerCallbackQuery, editMessageText } from "./services/telegram.js";
import { getInvoiceByIdInternal, updateInvoiceStatus } from "./services/supabase.js";
import { createCheckoutSession } from "./services/dodo.js";

const log = createLogger("server");

// Track processed callback IDs to avoid duplicate handling
const processedCallbacks = new Set<string>();

async function handleCallback(query: {
  id: string;
  from: { id: number; first_name: string; username?: string };
  message?: { message_id: number; chat: { id: number }; text?: string };
  data?: string;
}): Promise<void> {
  // Deduplicate - Telegram can deliver the same callback multiple times
  if (processedCallbacks.has(query.id)) {
    return;
  }
  processedCallbacks.add(query.id);

  // Clean up old IDs every 100 entries
  if (processedCallbacks.size > 100) {
    const ids = Array.from(processedCallbacks);
    ids.slice(0, 50).forEach((id) => processedCallbacks.delete(id));
  }
  if (!query.data || !query.message) {
    await answerCallbackQuery(query.id, "Invalid callback");
    return;
  }

  const [action, invoiceInternalId] = query.data.split(":");

  if (!action || !invoiceInternalId) {
    await answerCallbackQuery(query.id, "Invalid action");
    return;
  }

  // Answer immediately to dismiss the Telegram loading indicator
  await answerCallbackQuery(query.id);

  log.info("Processing callback", {
    action,
    invoice_id: invoiceInternalId,
    from: query.from.username ?? query.from.first_name,
  });

  const invoice = await getInvoiceByIdInternal(invoiceInternalId);

  if (!invoice) {
    await answerCallbackQuery(query.id, "Invoice not found");
    return;
  }

  if (invoice.status !== "PENDING_APPROVAL") {
    await answerCallbackQuery(query.id, `Invoice already ${invoice.status}`);
    return;
  }

  const cfoName = query.from.username
    ? `@${query.from.username}`
    : query.from.first_name;

  if (action === "approve") {
    await updateInvoiceStatus(invoiceInternalId, "MANUALLY_APPROVED", {
      approved_by: cfoName,
    });

    log.info("Invoice approved by CFO", {
      invoice_id: invoice.invoice_id,
      approved_by: cfoName,
    });

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

      if (invoice.telegram_message_id) {
        await editMessageText(
          invoice.telegram_message_id,
          [
            `✅ *Invoice Approved & Payment Initiated*`,
            ``,
            `*Vendor:* ${invoice.vendor_name}`,
            `*Invoice ID:* \`${invoice.invoice_id}\``,
            `*Amount:* $${(invoice.amount_cents / 100).toFixed(2)}`,
            `*Approved by:* ${cfoName}`,
            `*Session:* \`${session.session_id}\``,
            ``,
            `[Pay Now](${session.checkout_url})`,
          ].join("\n")
        );
      }

      await answerCallbackQuery(query.id, "Payment initiated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      log.error("Payment failed after approval", { error: msg });
      await updateInvoiceStatus(invoiceInternalId, "PAYMENT_FAILED");

      if (invoice.telegram_message_id) {
        await editMessageText(
          invoice.telegram_message_id,
          `⚠️ *Invoice Approved but Payment Failed*\n\nInvoice \`${invoice.invoice_id}\` was approved but payment could not be initiated.\n\nError: ${msg}`
        );
      }

      await answerCallbackQuery(query.id, "Payment failed");
    }
  } else if (action === "reject") {
    await updateInvoiceStatus(invoiceInternalId, "REJECTED", {
      approved_by: cfoName,
    });

    log.info("Invoice rejected by CFO", {
      invoice_id: invoice.invoice_id,
      rejected_by: cfoName,
    });

    if (invoice.telegram_message_id) {
      await editMessageText(
        invoice.telegram_message_id,
        [
          `❌ *Invoice Rejected*`,
          ``,
          `*Vendor:* ${invoice.vendor_name}`,
          `*Invoice ID:* \`${invoice.invoice_id}\``,
          `*Amount:* $${(invoice.amount_cents / 100).toFixed(2)}`,
          `*Rejected by:* ${cfoName}`,
        ].join("\n")
      );
    }

    await answerCallbackQuery(query.id, "Invoice rejected");
  } else {
    await answerCallbackQuery(query.id, "Unknown action");
  }
}

async function main() {
  const app = createApp();

  // Delete any existing webhook so getUpdates works
  await deleteWebhook();

  // Start polling for Telegram callbacks
  startPolling(handleCallback);

  app.listen(config.server.port, () => {
    log.info(`🚀 OmniCFO server running on port ${config.server.port}`, {
      port: config.server.port,
      env: config.server.nodeEnv,
      threshold: `$${(config.policy.autoApproveThresholdCents / 100).toFixed(2)}`,
    });
    log.info(`   POST /api/invoices     - Ingest invoices`);
    log.info(`   GET  /health            - Health check`);
    log.info(`   📡 Telegram polling active for callback queries`);
  });
}

main().catch((err) => {
  log.error("Failed to start server", { error: err.message });
  process.exit(1);
});
