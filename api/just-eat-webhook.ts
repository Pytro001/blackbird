import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin } from "./lib/supabase.js";

const STATUS_MAP: Record<string, string> = {
  courier_assigned: "courier_assigned",
  order_picked_up: "picked_up",
  order_delivered: "delivered",
  order_cancelled: "cancelled",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const webhookSecret = process.env.JUST_EAT_WEBHOOK_SECRET;
  if (webhookSecret) {
    const sig =
      (req.headers["x-je-signature"] as string | undefined) ??
      (req.headers["x-just-eat-signature"] as string | undefined);
    if (sig !== webhookSecret) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }
  }

  const body = req.body as Record<string, string> | undefined;
  const deliveryId = body?.deliveryId;
  const status = body?.status;
  const trackingUrl = body?.trackingUrl;

  if (!deliveryId || !status) {
    return res.status(400).json({ error: "Missing deliveryId or status" });
  }

  const mappedStatus = STATUS_MAP[status];
  if (!mappedStatus) return res.status(200).json({ ignored: true });

  const supabase = getSupabaseAdmin();
  const update: Record<string, string> = {
    status: mappedStatus,
    updated_at: new Date().toISOString(),
  };
  if (trackingUrl) update.just_eat_tracking_url = trackingUrl;

  await supabase.from("orders").update(update).eq("just_eat_delivery_id", deliveryId);

  return res.status(200).json({ ok: true });
}
