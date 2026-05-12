const BASE_URL = process.env.JUST_EAT_API_BASE_URL ?? "https://uk.api.just-eat.io";
const AUTH_URL = process.env.JUST_EAT_AUTH_URL ?? "https://auth.just-eat.io/oauth/token";

let _tokenCache: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 30_000) {
    return _tokenCache.value;
  }
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.JUST_EAT_CLIENT_ID!,
      client_secret: process.env.JUST_EAT_CLIENT_SECRET!,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Just Eat auth failed ${res.status}: ${await res.text()}`);
  }
  const { access_token, expires_in } = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  _tokenCache = { value: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return _tokenCache.value;
}

export interface DeliveryOrder {
  orderId: string;
  customer: { name: string; phone: string; email: string };
  delivery: { street: string; city: string; postcode: string; country: string };
  items: Array<{ name: string; quantity: number }>;
}

export interface DeliveryResult {
  deliveryId: string;
  trackingUrl?: string;
}

export async function createJustEatDelivery(input: DeliveryOrder): Promise<DeliveryResult> {
  const token = await getAccessToken();

  const body = {
    reference: input.orderId,
    pickup: {
      address: {
        line1: process.env.JUST_EAT_PICKUP_STREET ?? "Sebnitzer Str. 35",
        city: process.env.JUST_EAT_PICKUP_CITY ?? "Dresden",
        postCode: process.env.JUST_EAT_PICKUP_POSTCODE ?? "01099",
        countryCode: process.env.JUST_EAT_PICKUP_COUNTRY ?? "DE",
      },
      contact: {
        name: process.env.JUST_EAT_PICKUP_NAME ?? "blackbird",
        phone: process.env.JUST_EAT_PICKUP_PHONE ?? "",
      },
    },
    dropoff: {
      address: {
        line1: input.delivery.street,
        city: input.delivery.city,
        postCode: input.delivery.postcode,
        countryCode: input.delivery.country,
      },
      contact: {
        name: input.customer.name,
        phone: input.customer.phone,
        email: input.customer.email,
      },
    },
    items: input.items.map((i) => ({ name: i.name, quantity: i.quantity })),
  };

  const res = await fetch(`${BASE_URL}/daas/delivery/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Just Eat delivery failed ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as Record<string, string>;
  return {
    deliveryId: data.id ?? data.deliveryId ?? data.orderId,
    trackingUrl: data.trackingUrl ?? data.tracking_url,
  };
}
