export type InvoiceStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "AUTO_APPROVED"
  | "MANUALLY_APPROVED"
  | "REJECTED"
  | "PAYMENT_INITIATED"
  | "PAID"
  | "PAYMENT_FAILED";

export interface Invoice {
  id: string;
  invoice_id: string;
  vendor_name: string;
  amount_cents: number;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
  payment_id: string | null;
  telegram_message_id: number | null;
  metadata: Record<string, unknown> | null;
}

export interface InvoiceCreateInput {
  invoice_id: string;
  vendor_name: string;
  amount_cents: number;
  metadata?: Record<string, unknown>;
}

export interface PolicyDecision {
  approved: boolean;
  reason: string;
  threshold_cents: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  message?: {
    message_id: number;
    chat: {
      id: number;
    };
    text?: string;
  };
  data?: string;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  module: string;
  message: string;
  data?: Record<string, unknown>;
}
