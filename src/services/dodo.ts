import DodoPayments from "dodopayments";
import { config } from "../config.js";
import { createLogger } from "../logger.js";

const log = createLogger("dodo");

let client: DodoPayments | null = null;

function getClient(): DodoPayments {
  if (!client) {
    client = new DodoPayments({
      bearerToken: config.dodo.apiKey,
      environment: "test_mode",
    });
  }
  return client;
}

export interface CheckoutSessionResult {
  session_id: string;
  checkout_url: string;
  payment_id?: string;
}

/**
 * Create a Dodo Checkout Session for an approved invoice.
 *
 * Note: Dodo Payments is a Merchant of Record for *collecting* payments.
 * For the hackathon demo, this creates a checkout session that represents
 * the payment flow. In production, you'd use a disbursement API (Stripe
 * Connect, Wise, etc.) for actual vendor payouts.
 */
export async function createCheckoutSession(params: {
  amount_cents: number;
  description: string;
  metadata: Record<string, string>;
}): Promise<CheckoutSessionResult> {
  const dodo = getClient();

  log.info("Creating Dodo checkout session", {
    amount: params.amount_cents,
    description: params.description,
  });

  // Dodo amounts are in cents
  const session = await dodo.checkoutSessions.create({
    product_cart: [
      {
        product_id: process.env.DODO_PRODUCT_ID ?? "pdt_0Nmw7740CjLSuF3GAUb0B",
        quantity: 1,
      },
    ],
    customer: {
      email: params.metadata.vendor_email ?? "vendor@omnicfo.io",
      name: params.metadata.vendor_name ?? "Invoice Vendor",
    },
    return_url: "https://omnicfo.io/payment/success",
    metadata: params.metadata,
  });

  log.info("Dodo checkout session created", {
    session_id: session.session_id,
    checkout_url: session.checkout_url,
  });

  return {
    session_id: session.session_id,
    checkout_url: session.checkout_url ?? "",
    payment_id: session.payment_id ?? undefined,
  };
}

/**
 * Retrieve a checkout session by ID to check its status.
 */
export async function getCheckoutSession(sessionId: string) {
  const dodo = getClient();
  return dodo.checkoutSessions.retrieve(sessionId);
}
