import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getSupabaseAdmin } from "./lib/supabase.js";
import { createJustEatDelivery } from "./lib/just-eat.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const config = { api: { bodyParser: false } };

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).json({ error: "Missing stripe-signature header" });

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const supabase = getSupabaseAdmin();

    const { data: order, error: insertErr } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        customer_name: meta["customer_name"] ?? "",
        customer_email: session.customer_email ?? "",
        customer_phone: meta["customer_phone"] ?? null,
        delivery_street: meta["delivery_street"] ?? "",
        delivery_city: meta["delivery_city"] ?? "",
        delivery_postcode: meta["delivery_postcode"] ?? "",
        delivery_country: meta["delivery_country"] ?? "DE",
        amount_total: session.amount_total,
        currency: session.currency,
        status: "paid",
      })
      .select("id")
      .single();

    if (insertErr || !order) {
      console.error("Supabase insert error:", insertErr);
      return res.status(500).json({ error: "Database error" });
    }

    try {
      const delivery = await createJustEatDelivery({
        orderId: order.id as string,
        customer: {
          name: meta["customer_name"] ?? "",
          phone: meta["customer_phone"] ?? "",
          email: session.customer_email ?? "",
        },
        delivery: {
          street: meta["delivery_street"] ?? "",
          city: meta["delivery_city"] ?? "",
          postcode: meta["delivery_postcode"] ?? "",
          country: meta["delivery_country"] ?? "DE",
        },
        items: [{ name: "blackbird Men Flake-Free Set", quantity: 1 }],
      });

      await supabase
        .from("orders")
        .update({
          status: "delivery_created",
          just_eat_delivery_id: delivery.deliveryId,
          just_eat_tracking_url: delivery.trackingUrl ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    } catch (err) {
      console.error("Just Eat delivery dispatch error:", err);
      await supabase
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", order.id);
    }
  }

  return res.status(200).json({ received: true });
}
