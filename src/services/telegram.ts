import { config } from "../config.js";
import { createLogger } from "../logger.js";

const log = createLogger("telegram");

const TELEGRAM_API = `https://api.telegram.org/bot${config.telegram.botToken}`;

interface TelegramMessage {
  ok: boolean;
  result: {
    message_id: number;
    chat: { id: number };
    text: string;
  };
}

interface InlineKeyboardButton {
  text: string;
  callback_data: string;
}

interface TelegramUpdate {
  update_id: number;
  callback_query?: {
    id: string;
    from: { id: number; first_name: string; username?: string };
    message?: {
      message_id: number;
      chat: { id: number };
      text?: string;
    };
    data?: string;
  };
}

/**
 * Send a message to the CFO's Telegram chat with optional inline keyboard.
 */
export async function sendMessage(
  text: string,
  replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] }
): Promise<number> {
  const body: Record<string, unknown> = {
    chat_id: config.telegram.cfoChatId,
    text,
    parse_mode: "Markdown",
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    log.error("Failed to send Telegram message", { status: response.status, error: err });
    throw new Error(`Telegram sendMessage failed: ${response.status}`);
  }

  const data = (await response.json()) as TelegramMessage;
  log.info("Telegram message sent", { message_id: data.result.message_id });
  return data.result.message_id;
}

/**
 * Send an approval request with Approve/Reject inline buttons.
 * Returns the message_id so we can update it later.
 */
export async function sendApprovalRequest(
  text: string,
  invoiceInternalId: string
): Promise<number> {
  return sendMessage(text, {
    inline_keyboard: [
      [
        { text: "✅ Approve", callback_data: `approve:${invoiceInternalId}` },
        { text: "❌ Reject", callback_data: `reject:${invoiceInternalId}` },
      ],
    ],
  });
}

/**
 * Answer a callback query to dismiss the loading indicator in Telegram.
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<void> {
  const body: Record<string, unknown> = {
    callback_query_id: callbackQueryId,
  };
  if (text) {
    body.text = text;
  }

  const response = await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    log.error("Failed to answer callback query", { error: err });
  }
}

/**
 * Edit an existing message to reflect a decision (approve/reject).
 */
export async function editMessageText(
  messageId: number,
  text: string
): Promise<void> {
  const response = await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: config.telegram.cfoChatId,
      message_id: messageId,
      text,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    log.error("Failed to edit Telegram message", { error: err });
  }
}

/**
 * Delete a pending webhook so getUpdates works (can't use both).
 */
export async function deleteWebhook(): Promise<void> {
  const response = await fetch(`${TELEGRAM_API}/deleteWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data = await response.json();
  log.info("Webhook deleted", { result: data });
}

/**
 * Start polling for Telegram updates (callback queries).
 * This runs in the background and processes inline button presses.
 */
export function startPolling(
  onCallback: (query: NonNullable<TelegramUpdate["callback_query"]>) => Promise<void>
): void {
  let offset = 0;

  async function poll(): Promise<void> {
    try {
      const response = await fetch(
        `${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30&allowed_updates=["callback_query"]`
      );

      if (!response.ok) {
        log.error("Polling failed", { status: response.status });
        setTimeout(poll, 5000);
        return;
      }

      const data = await response.json() as { ok: boolean; result: TelegramUpdate[] };

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          if (update.callback_query) {
            log.info("Received callback query", {
              query_id: update.callback_query.id,
              data: update.callback_query.data,
            });

            // Process async but don't block polling
            onCallback(update.callback_query).catch((err) => {
              log.error("Callback handler error", { error: err.message });
            });
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      log.error("Polling error", { error: msg });
    }

    // Continue polling
    setTimeout(poll, 100);
  }

  log.info("Starting Telegram polling");
  poll();
}
