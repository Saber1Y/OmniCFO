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

  // Use a pay-what-you-want product (configured in Dodo dashboard with pay_what_you_want=true)
  // The amount is passed dynamically via ProductItemReq.amount
  const productId = process.env.DODO_PAY_WHAT_YOU_WANT_PRODUCT_ID ?? process.env.DODO_PRODUCT_ID ?? "pdt_0Nmw7740CjLSuF3GAUb0B";

  const session = await dodo.checkoutSessions.create({
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
        // Dynamic amount override - requires product to have pay_what_you_want=true in Dodo dashboard
        amount: params.amount_cents,
      },
    ],
    customer: {
      email: params.metadata.vendor_email ?? "vendor@omnicfo.io",
      name: params.metadata.vendor_name ?? "Invoice Vendor",
    },
    return_url: "https://omnicfo.io/payment/success",
    metadata: {
      ...params.metadata,
      amount_cents: String(params.amount_cents),
    },
  });

  log.info("Dodo checkout session created", {
    session_id: session.session_id,
    checkout_url: session.checkout_url,
    amount_cents: params.amount_cents,
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
