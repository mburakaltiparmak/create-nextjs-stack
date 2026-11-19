import { t } from "@/lib/i18n";
import { z } from "zod";

/**
 * İletişim formu talepleri: veri kaynağından bağımsız tip, durumlar ve doğrulama. Depolama lib/leads.ts'tedir
 * (Supabase: `leads` tablosu, Contentful: yayınlanmayan `lead` kayıtları).
 */

export const leadStatuses = ["new", "contacted", "closed"] as const;
export type LeadStatus = (typeof leadStatuses)[number];
export const leadStatusLabels: Record<LeadStatus, string> = t.leads.statuses;
export const leadStatusTones: Record<LeadStatus, "warning" | "primary" | "success"> = { new: "warning", contacted: "primary", closed: "success" };
export const notificationLabels: Record<string, string> = t.leads.notifications;
export const leadLocaleLabels: Record<string, string> = t.leads.locales;

/** Talep kimlikleri: Supabase'de uuid, Contentful'da web sitesinin verdiği `lead-<uuid>`. */
export const leadIdPattern = /^(lead-)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Lead = { id: string; version: number; name: string; company: string; email: string; phone: string; subject: string; message: string; locale: string; consent: boolean; submittedAt: string; status: LeadStatus; notificationStatus: string; internalNote: string };

export const leadUpdateSchema = z.object({
  status: z.enum(leadStatuses),
  internalNote: z.string().trim().max(2_000).default(""),
});

export const maxRetentionDays = 3650;
export const retentionSchema = z.union([z.literal(""), z.coerce.number().int().min(1).max(maxRetentionDays)]).transform((value) => value === "" ? null : value);

/** Bu tarihten önce gönderilen talepler saklama süresini aşmıştır. */
export function retentionCutoff(days: number, now = new Date()) { return new Date(now.getTime() - days * 86_400_000); }

export function isLeadStatus(value: string): value is LeadStatus { return leadStatuses.includes(value as LeadStatus); }

export function formatLeadDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(t.meta.locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
