import { config } from "../config.js";
import { createLogger } from "../logger.js";
import type { Invoice, PolicyDecision } from "../types.js";

const log = createLogger("policy");

/**
 * Evaluate whether an invoice should be auto-approved or flagged for human review.
 *
 * Policy rules:
 * - Amount <= threshold: AUTO_APPROVED
 * - Amount > threshold: PENDING_APPROVAL (requires CFO sign-off)
 */
export function evaluateInvoice(invoice: Invoice): PolicyDecision {
  const threshold = config.policy.autoApproveThresholdCents;

  if (invoice.amount_cents <= threshold) {
    log.info("Invoice auto-approved (under threshold)", {
      invoice_id: invoice.invoice_id,
      amount_cents: invoice.amount_cents,
      threshold_cents: threshold,
    });
    return {
      approved: true,
      reason: `Amount $${(invoice.amount_cents / 100).toFixed(2)} is within the $${(threshold / 100).toFixed(2)} auto-approval threshold`,
      threshold_cents: threshold,
    };
  }

  log.info("Invoice requires CFO approval (over threshold)", {
    invoice_id: invoice.invoice_id,
    amount_cents: invoice.amount_cents,
    threshold_cents: threshold,
  });
  return {
    approved: false,
    reason: `Amount $${(invoice.amount_cents / 100).toFixed(2)} exceeds the $${(threshold / 100).toFixed(2)} threshold and requires CFO approval`,
    threshold_cents: threshold,
  };
}

/**
 * Format a human-readable approval summary for Telegram notifications.
 */
export function formatApprovalMessage(invoice: Invoice): string {
  return [
    `🔔 *New Invoice Requiring Approval*`,
    ``,
    `*Vendor:* ${escapeMarkdown(invoice.vendor_name)}`,
    `*Invoice ID:* \`${invoice.invoice_id}\``,
    `*Amount:* $${(invoice.amount_cents / 100).toFixed(2)}`,
    `*Status:* Pending Your Approval`,
    ``,
    `_This invoice exceeds the $${(config.policy.autoApproveThresholdCents / 100).toFixed(2)} auto-approval threshold._`,
  ].join("\n");
}

function escapeMarkdown(text: string): string {
  // Telegram MarkdownV2 special characters
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
