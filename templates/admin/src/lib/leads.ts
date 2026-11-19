import { t } from "@/lib/i18n";
import "server-only";
import { supabaseFor } from "@/lib/content-store";
import { ServiceError, UserError } from "@/lib/errors";
import { isLeadStatus, retentionCutoff, type Lead, type LeadStatus } from "@/lib/lead-model";
import { leadsSite } from "@/lib/sites";

/**
 * Talepler — Supabase sürümü: `leads` tablosu (web sitesi /api/contact yazar) ve tekil `site_settings` satırı
 * (saklama süresi). Bkz. supabase/schema.sql. Contentful modülü bu dosyayı aynı dışa aktarımlarla değiştirir.
 */
const db = () => supabaseFor(leadsSite);

type LeadRow = Record<string, unknown> & { id: string; version: number };

function check<T>(result: { data: T; error: { message: string } | null; status?: number }): T {
  if (result.error) throw new ServiceError("Supabase", result.status ?? 500, result.error.message);
  return result.data;
}

function toLead(row: LeadRow): Lead {
  const text = (key: string) => (typeof row[key] === "string" ? (row[key] as string) : "");
  const status = text("status");
  return {
    id: row.id,
    version: Number(row.version ?? 1),
    name: text("name"),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    subject: text("subject"),
    message: text("message"),
    locale: text("locale"),
    consent: row.consent === true,
    submittedAt: text("submitted_at") || text("created_at"),
    status: isLeadStatus(status) ? status : "new",
    notificationStatus: text("notification_status") || "pending",
    internalNote: text("internal_note"),
  };
}

export async function listLeads(status?: LeadStatus) {
  let query = db().from("leads").select("*", { count: "exact" }).order("submitted_at", { ascending: false }).limit(200);
  if (status) query = query.eq("status", status);
  const result = await query;
  const rows = check(result) as LeadRow[];
  return { items: rows.map(toLead), total: result.count ?? rows.length };
}

export async function countNewLeads() {
  const result = await db().from("leads").select("id", { count: "exact", head: true }).eq("status", "new");
  check(result);
  return result.count ?? 0;
}

export async function getLead(id: string) {
  const row = check(await db().from("leads").select("*").eq("id", id).maybeSingle()) as LeadRow | null;
  if (!row) throw new UserError(t.leads.notFound);
  return toLead(row);
}

export async function updateLead(id: string, expectedVersion: number, values: { status: LeadStatus; internalNote: string }) {
  const rows = check(await db().from("leads").update({ status: values.status, internal_note: values.internalNote }).eq("id", id).eq("version", expectedVersion).select("id")) as { id: string }[];
  if (!rows.length) throw new UserError(t.leads.conflict);
}

export async function deleteLead(id: string) {
  check(await db().from("leads").delete().eq("id", id));
}

// ─── Saklama süresi (site_settings tekil satırı) ─────────────────────────────

const SETTINGS_ID = "site";

export async function getLeadRetention() {
  const row = check(await db().from("site_settings").select("lead_retention_days, version").eq("id", SETTINGS_ID).maybeSingle()) as { lead_retention_days: number | null; version: number } | null;
  return { days: typeof row?.lead_retention_days === "number" ? row.lead_retention_days : null, version: row?.version ?? 0 };
}

export async function setLeadRetention(expectedVersion: number, days: number | null) {
  const current = await getLeadRetention();
  if (current.version !== expectedVersion) throw new UserError(t.leads.settingsConflict);
  check(await db().from("site_settings").upsert({ id: SETTINGS_ID, lead_retention_days: days }));
}

/** Saklama süresi dolan talepleri kalıcı olarak siler. */
export async function purgeExpiredLeads(days: number) {
  const cutoff = retentionCutoff(days).toISOString();
  const rows = check(await db().from("leads").delete().lt("submitted_at", cutoff).select("id")) as { id: string }[];
  return { deleted: rows.length, cutoff };
}
