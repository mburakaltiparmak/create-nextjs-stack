import "server-only";
import { isServiceConfigured, supabaseService } from "@/lib/supabase/client";
import type { ContactInput } from "@/lib/validation/contact";

/**
 * İletişim formu talepleri — Supabase sürümü: `leads` tablosuna service role ile yazılır, admin "Talepler"
 * ekranında yönetilir (admin/supabase/schema.sql). Contentful modülü bu dosyayı aynı dışa aktarımlarla değiştirir.
 */
export type NotificationStatus = "pending" | "sent" | "failed" | "skipped";
export type LeadRecord = { id: string };

export function isLeadStoreConfigured() {
  return isServiceConfigured();
}

export async function saveLeadRecord(data: ContactInput): Promise<LeadRecord> {
  const { data: row, error } = await supabaseService().from("leads").insert({
    name: data.name,
    company: data.company || null,
    email: data.email,
    phone: data.phone || null,
    subject: data.subject || null,
    message: data.message,
    locale: data.locale,
    consent: data.privacy === true,
    notification_status: "pending",
  }).select("id").single();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return row as LeadRecord;
}

export async function setNotificationStatus(record: LeadRecord, status: NotificationStatus) {
  const { error } = await supabaseService().from("leads").update({ notification_status: status }).eq("id", record.id);
  if (error) throw new Error(`Supabase: ${error.message}`);
}
