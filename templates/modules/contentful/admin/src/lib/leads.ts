import { t } from "@/lib/i18n";
import "server-only";
import { contentfulLocale, local as localFor, management as managementFor } from "@/lib/contentful";
import { ServiceError, UserError } from "@/lib/errors";
import { isLeadStatus, retentionCutoff, type Lead, type LeadStatus } from "@/lib/lead-model";
import { leadsSite } from "@/lib/sites";

/**
 * Talepler — Contentful sürümü: web sitesinin /api/contact rotası her gönderimi yayınlanmayan bir `lead`
 * kaydı olarak yazar (Delivery API talepleri hiç döndürmez); saklama süresi tekil `siteSettings` kaydındadır.
 * Bkz. contentful/migrations/02-leads-settings.cjs.
 */
const site = leadsSite;

type LeadEntry = { sys: { id: string; version: number; createdAt?: string; publishedVersion?: number }; fields: Record<string, Record<string, unknown> | undefined> };

function toLead(entry: LeadEntry): Lead {
  const read = (key: string) => entry.fields[key]?.[contentfulLocale];
  const text = (key: string) => { const value = read(key); return typeof value === "string" ? value : ""; };
  const status = text("status");
  return {
    id: entry.sys.id,
    version: entry.sys.version,
    name: text("name"),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    subject: text("subject"),
    message: text("message"),
    locale: text("locale"),
    consent: read("consent") === true,
    submittedAt: text("submitted_at") || entry.sys.createdAt || "",
    status: isLeadStatus(status) ? status : "new",
    notificationStatus: text("notification_status") || "pending",
    internalNote: text("internal_note"),
  };
}
const management = <T,>(path: string, init?: RequestInit) => managementFor<T>(site, path, init);
const local = (value: unknown) => localFor(site, value);

type Typed = LeadEntry & { sys: { contentType: { sys: { id: string } } } };

export async function listLeads(status?: LeadStatus) {
  const query = new URLSearchParams({ content_type: "lead", order: "-fields.submitted_at", limit: "200" });
  if (status) query.set("fields.status", status);
  const result = await management<{ items: LeadEntry[]; total: number }>(`/entries?${query}`);
  return { items: result.items.map(toLead), total: result.total };
}

export async function countNewLeads() {
  const query = new URLSearchParams({ content_type: "lead", "fields.status": "new", limit: "0" });
  return (await management<{ total: number }>(`/entries?${query}`)).total;
}

async function getLeadEntry(id: string) {
  const entry = await management<Typed>(`/entries/${encodeURIComponent(id)}`);
  if (entry.sys.contentType.sys.id !== "lead") throw new UserError(t.leads.notFound);
  return entry;
}

export async function getLead(id: string) { return toLead(await getLeadEntry(id)); }

export async function updateLead(id: string, expectedVersion: number, values: { status: LeadStatus; internalNote: string }) {
  const entry = await getLeadEntry(id);
  if (entry.sys.version !== expectedVersion) throw new UserError(t.leads.conflict);
  const fields = { ...entry.fields, status: local(values.status), internal_note: local(values.internalNote) };
  return management<LeadEntry>(`/entries/${entry.sys.id}`, { method: "PUT", headers: { "x-contentful-version": String(expectedVersion) }, body: JSON.stringify({ fields }) });
}

async function removeEntry(entry: LeadEntry) {
  let version = entry.sys.version;
  // Talepler yayınlanmaz; yine de yayınlanmışsa önce yayından kaldırılır.
  if (entry.sys.publishedVersion) version = (await management<LeadEntry>(`/entries/${entry.sys.id}/published`, { method: "DELETE", headers: { "x-contentful-version": String(version) } })).sys.version;
  await management<void>(`/entries/${entry.sys.id}`, { method: "DELETE", headers: { "x-contentful-version": String(version) } });
}

export async function deleteLead(id: string) { await removeEntry(await getLeadEntry(id)); }

// ─── Saklama süresi (siteSettings tekil kaydı) ───────────────────────────────

const SETTINGS_ID = "siteSettings";

async function getSettings() {
  try {
    return await management<LeadEntry>(`/entries/${SETTINGS_ID}`);
  } catch (error) {
    if (error instanceof ServiceError && error.status === 404) return null;
    throw error;
  }
}

export async function getLeadRetention() {
  const entry = await getSettings();
  const days = entry?.fields.lead_retention_days?.[contentfulLocale];
  return { days: typeof days === "number" ? days : null, version: entry?.sys.version ?? 0 };
}

export async function setLeadRetention(expectedVersion: number, days: number | null) {
  const entry = await getSettings();
  if ((entry?.sys.version ?? 0) !== expectedVersion) throw new UserError(t.leads.settingsConflict);
  const fields: LeadEntry["fields"] = entry ? structuredClone(entry.fields) : { internal_name: local("Site settings") };
  if (days === null) delete fields.lead_retention_days;
  else fields.lead_retention_days = local(days);
  const headers: Record<string, string> = entry ? { "x-contentful-version": String(expectedVersion) } : { "x-contentful-content-type": "siteSettings" };
  return management(`/entries/${SETTINGS_ID}`, { method: "PUT", headers, body: JSON.stringify({ fields }) });
}

/** Saklama süresi dolan talepleri kalıcı olarak siler. Bir çağrıda en fazla `limit` kayıt işler; kalanlar sonraki çalıştırmaya kalır. */
export async function purgeExpiredLeads(days: number, limit = 500) {
  const cutoff = retentionCutoff(days).toISOString();
  let deleted = 0;
  while (deleted < limit) {
    const query = new URLSearchParams({ content_type: "lead", "fields.submitted_at[lt]": cutoff, order: "fields.submitted_at", limit: String(Math.min(100, limit - deleted)) });
    const { items } = await management<{ items: LeadEntry[] }>(`/entries?${query}`);
    if (items.length === 0) break;
    for (const entry of items) {
      await removeEntry(entry);
      deleted += 1;
    }
  }
  return { deleted, cutoff };
}
