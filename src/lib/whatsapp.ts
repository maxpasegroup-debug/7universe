/**
 * WhatsApp Cloud API (Meta) — set WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID.
 * Messages outside the 24h window may require approved templates in Meta Business Manager.
 */

/** WhatsApp Cloud API `to`: digits only, with country code (no +). */
function normalizeWhatsAppRecipient(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  return d;
}

export type WhatsAppResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  reason?: string;
};

async function sendPayload(payload: Record<string, unknown>): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { ok: false, skipped: true, reason: "WhatsApp env not configured" };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok) {
    console.error("[whatsapp]", json);
    return { ok: false, error: json.error?.message ?? res.statusText };
  }
  return { ok: true };
}

export async function sendWhatsAppText(mobile: string, body: string): Promise<WhatsAppResult> {
  const to = normalizeWhatsAppRecipient(mobile);
  return sendPayload({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { preview_url: false, body },
  });
}

export async function sendWelcomeMessage(mobile10: string, name: string): Promise<WhatsAppResult> {
  const msg =
    process.env.WHATSAPP_MSG_WELCOME ??
    `Hi ${name}, welcome to 7Universe! Your onboarding journey is ready. Complete the steps in the app to unlock everything.`;
  return sendWhatsAppText(mobile10, msg);
}

export async function sendInactivityReminder(mobile10: string, name: string): Promise<WhatsAppResult> {
  const msg =
    process.env.WHATSAPP_MSG_REMINDER ??
    `Hi ${name}, we noticed you have not finished your 7Universe onboarding. Open the app anytime to continue your journey.`;
  return sendWhatsAppText(mobile10, msg);
}

export async function sendExpertConnectMessage(mobile10: string, name: string): Promise<WhatsAppResult> {
  const msg =
    process.env.WHATSAPP_MSG_EXPERT ??
    `Hi ${name}, you are making great progress in 7Universe! Reply here if you would like a mentor to connect with you.`;
  return sendWhatsAppText(mobile10, msg);
}
