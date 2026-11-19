import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isLeadStoreConfigured, saveLeadRecord, setNotificationStatus } from "@/lib/leads";
import { contactSchema, type ContactInput } from "@/lib/validation/contact";

/**
 * İletişim formu:
 *   1. Talep veri kaynağına kaydedilir (Supabase `leads` / Contentful `lead`; admin → Talepler) — yapılandırılmışsa
 *   2. Resend ile CONTACT_EMAIL adresine bildirim e-postası gider — yapılandırılmışsa
 * Talep bu iki yoldan birine ulaştıysa kabul edilir; e-posta durumu kayda sonradan işlenir.
 *
 *   RESEND_API_KEY, RESEND_FROM_EMAIL (Resend'de doğrulanmış gönderici), CONTACT_EMAIL (alıcı)
 */

const apiKey = process.env.RESEND_API_KEY?.trim();
const resend = apiKey && !apiKey.startsWith("your") ? new Resend(apiKey) : null;
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Website";

// IP başına 10 dakikada en fazla 5 gönderim (sunucu örneği belleğinde; en iyi çaba).
const hits = new Map<string, number[]>();
function allowed(ip: string, now = Date.now()) {
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < 10 * 60_000);
  if (recent.length >= 5) return false;
  hits.set(ip, [...recent, now]);
  return true;
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function rows(data: ContactInput): [string, string][] {
  return [["Name", data.name], ["Email", data.email], ["Company", data.company || "–"], ["Phone", data.phone || "–"], ["Subject", data.subject || "–"]];
}

const html = (data: ContactInput) => `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px">
<table width="100%" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px">
<tr><td style="padding:24px 28px;border-bottom:1px solid #e2e8f0"><h1 style="margin:0;font-size:18px;color:#0f172a">${escapeHtml(siteName)} — new enquiry</h1></td></tr>
<tr><td style="padding:24px 28px"><table width="100%">${rows(data).map(([label, value]) => `<tr><td style="padding:6px 0;color:#64748b;width:120px;font-size:14px">${label}</td><td style="padding:6px 0;font-size:14px">${escapeHtml(value)}</td></tr>`).join("")}</table>
<p style="white-space:pre-wrap;font-size:14px;line-height:1.6;background:#f8fafc;padding:16px;border-radius:6px">${escapeHtml(data.message)}</p></td></tr></table></body></html>`;

const text = (data: ContactInput) => `${siteName} — new enquiry\n\n${rows(data).map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${data.message}\n`;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowed(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 });
  const data = parsed.data;

  // Honeypot dolu → bot. Başarılı gibi davran, hiçbir şey kaydetme.
  if (data.website) return NextResponse.json({ success: true });

  const store = isLeadStoreConfigured();
  if (!resend && !store) {
    console.error("[contact] Neither Resend nor the lead store is configured — enquiry could not be delivered");
    return NextResponse.json({ error: "Contact form is not configured" }, { status: 503 });
  }

  const record = store ? await saveLeadRecord(data).catch((error) => { console.error("[contact] Could not store lead:", error); return null; }) : null;

  let notified: boolean | null = null;
  if (resend) {
    try {
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || "",
        replyTo: data.email,
        subject: `${siteName}: ${data.subject || "New enquiry"} – ${data.name}`.replace(/[\r\n]+/g, " "),
        html: html(data),
        text: text(data),
      });
      if (result.error) console.error("[contact] Resend error:", result.error);
      notified = !result.error;
    } catch (error) {
      console.error("[contact] Resend request failed:", error);
      notified = false;
    }
  }

  if (record) {
    await setNotificationStatus(record, notified === null ? "skipped" : notified ? "sent" : "failed").catch((error) => console.error("[contact] Could not update notification status:", error));
  }

  if (!record && !notified) return NextResponse.json({ error: "Could not deliver your message. Please try again later." }, { status: 502 });
  return NextResponse.json({ success: true });
}
