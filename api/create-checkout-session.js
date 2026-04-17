import Stripe from "stripe";

/**
 * Vercel serverless: POST → { url } for Stripe Checkout redirect.
 * Env: STRIPE_SECRET_KEY, STRIPE_PRICE_ID (Dashboard → Products → Price ID)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!secret || !priceId) {
    return res.status(500).json({ error: "Stripe is not configured (STRIPE_SECRET_KEY, STRIPE_PRICE_ID)" });
  }

  const stripe = new Stripe(secret);

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!host || typeof host !== "string") {
    return res.status(500).json({ error: "Missing host header" });
  }
  const origin = `${proto}://${host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#product`,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      return res.status(500).json({ error: "No checkout URL returned" });
    }
    return res.status(200).json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    console.error("Stripe checkout:", e);
    return res.status(500).json({ error: message });
  }
}
