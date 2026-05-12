import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const PRODUCT_NAME = "blackbird Men Flake-Free Set";
const MONTHLY_AMOUNT_CENTS = 4200; // 42 EUR

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body as Record<string, string> | undefined;
  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const phone = body?.phone?.trim() ?? "";
  const street = body?.street?.trim();
  const city = body?.city?.trim();
  const postcode = body?.postcode?.trim();
  const country = body?.country?.trim() ?? "DE";

  if (!name || !email || !street || !city || !postcode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const origin =
    (req.headers.origin as string | undefined) ??
    process.env.SITE_URL ??
    "https://blackbird.com";

  try {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      process.env.STRIPE_PRICE_ID
        ? [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }]
        : [
            {
              price_data: {
                currency: "eur",
                product_data: { name: PRODUCT_NAME },
                unit_amount: MONTHLY_AMOUNT_CENTS,
                recurring: { interval: "month" },
              },
              quantity: 1,
            },
          ];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email,
      metadata: {
        customer_name: name,
        customer_phone: phone,
        delivery_street: street,
        delivery_city: city,
        delivery_postcode: postcode,
        delivery_country: country,
      },
      success_url: `${origin}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
