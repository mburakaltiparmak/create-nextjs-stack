import { t } from "@/lib/i18n";
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ContentEntry } from "@/lib/content-entry";
import { findType, type ContentTypeDef, type RefOptions } from "@/lib/content-model";
import type { ContentValues, LocalizedValue } from "@/lib/content-validation";
import { configFor } from "@/lib/env";
import { ServiceError, UserError } from "@/lib/errors";
import type { SiteDef } from "@/lib/sites";

/**
 * İçerik deposu — Supabase sürümü. Her içerik tipi bir tablodur (tip ID = tablo adı, bkz. supabase/schema.sql):
 *
 *   id uuid · status 'draft' | 'published' · published_at · version (her güncellemede trigger artırır)
 *   created_at · updated_at · ve modeldeki alanlar (dile göre alanlar model.fieldKey ile ayrı sütunlar)
 *
 * Panel service role anahtarıyla yazar (RLS'yi atlar); site anon anahtarla yalnız `published` satırları okur.
 * Supabase'de yayındaki satırın ayrı bir taslağı yoktur: yayındaki bir kaydı kaydetmek sitede hemen görünür.
 * Contentful modülü bu dosyayı aynı dışa aktarımlarla kendi sürümüyle değiştirir.
 */

const META = new Set(["id", "status", "version", "created_at", "updated_at", "published_at"]);
type Row = Record<string, unknown> & { id: string; status: string; version: number; updated_at?: string };

const clients = new Map<number, SupabaseClient>();
function db(site: SiteDef) {
  const cached = clients.get(site.number);
  if (cached) return cached;
  const { supabaseUrl, supabaseServiceKey } = configFor(site);
  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes("your-")) throw new UserError(t.errors.supabaseMissing(site.label));
  const client = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  clients.set(site.number, client);
  return client;
}

function check<T>(result: { data: T; error: { message: string; code?: string } | null; status?: number }): T {
  if (result.error) {
    // 23505: unique ihlali (ör. aynı slug).
    if (result.error.code === "23505") throw new UserError(t.errors.duplicate);
    throw new ServiceError("Supabase", result.status ?? 500, result.error.message);
  }
  return result.data;
}

function toEntry(type: string, row: Row): ContentEntry {
  const fields = Object.fromEntries(Object.entries(row).filter(([key]) => !META.has(key)));
  return { id: row.id, type, version: Number(row.version ?? 1), state: row.status === "published" ? "published" : "draft", updatedAt: row.updated_at, fields };
}

function isEmpty(value: unknown) {
  return value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
}

/** Form değerlerini sütunlara çevirir; boş alanlar null olur (dile göre boş çeviriler sitede ana dile düşer). */
function toRow(site: SiteDef, type: ContentTypeDef, values: ContentValues) {
  const row: Record<string, unknown> = {};
  const { model } = site;
  for (const field of type.fields) {
    const value = values[field.id];
    if (field.localized) {
      const byLocale = (value ?? {}) as LocalizedValue;
      for (const locale of model.locales) {
        const raw = byLocale[locale];
        const cleaned = Array.isArray(raw) ? raw.map((item) => item.trim()).filter(Boolean) : raw?.trim();
        row[model.fieldKey(field.id, locale)] = isEmpty(cleaned) ? null : cleaned;
      }
    } else {
      row[field.id] = isEmpty(value) ? (field.kind === "boolean" ? false : null) : value;
    }
  }
  return row;
}

function typeOf(site: SiteDef, id: string) {
  const type = findType(site.model, id);
  if (!type) throw new UserError(t.errors.invalidType);
  return type;
}

// ─── Okuma ───────────────────────────────────────────────────────────────────

export async function listEntries(site: SiteDef, contentType?: string): Promise<ContentEntry[]> {
  const types = contentType ? [typeOf(site, contentType)] : site.model.types;
  const lists = await Promise.all(types.map(async (type) => {
    const rows = check(await db(site).from(type.id).select("*").order("updated_at", { ascending: false }).limit(500)) as Row[];
    return rows.map((row) => toEntry(type.id, row));
  }));
  return lists.flat().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

/** Tip biliniyorsa doğrudan o tablodan, bilinmiyorsa tüm içerik tablolarında arar. */
export async function getEntry(site: SiteDef, id: string, contentType?: string): Promise<ContentEntry> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new UserError(t.errors.recordNotFound);
  const types = contentType && findType(site.model, contentType) ? [typeOf(site, contentType)] : site.model.types;
  for (const type of types) {
    const row = check(await db(site).from(type.id).select("*").eq("id", id).maybeSingle()) as Row | null;
    if (row) return toEntry(type.id, row);
  }
  throw new ServiceError("Supabase", 404, `Entry ${id} not found`);
}

export function assertContentEntry(site: SiteDef, entry: ContentEntry): ContentTypeDef {
  const type = findType(site.model, entry.type);
  if (!type) throw new UserError(t.errors.notEditable);
  return type;
}

export async function slugAvailable(site: SiteDef, contentType: string, slug: string, exceptId?: string) {
  const rows = check(await db(site).from(typeOf(site, contentType).id).select("id").eq("slug", slug).limit(2)) as { id: string }[];
  return !rows.some((row) => row.id !== exceptId);
}

/** Modeldeki tüm `reference` alanlarının seçenekleri (alan ID'si → kayıtlar, taslaklar dahil). */
export async function referenceOptions(site: SiteDef): Promise<RefOptions> {
  const fields = site.model.types.flatMap((type) => type.fields).filter((field) => field.kind === "reference" && field.refType);
  const entries = await Promise.all(fields.map(async (field) => {
    const type = typeOf(site, field.refType!);
    const title = type.fields.find((item) => item.id === type.titleField);
    const key = title?.localized ? site.model.fieldKey(type.titleField, site.model.primaryLocale) : type.titleField;
    const rows = check(await db(site).from(type.id).select(`id, ${key}`).order(key).limit(1000)) as unknown as Record<string, string>[];
    return [field.id, rows.map((row) => ({ value: row.id, label: String(row[key] || row.id) }))] as const;
  }));
  return Object.fromEntries(entries);
}

// ─── Yazma ───────────────────────────────────────────────────────────────────

export async function createEntry(site: SiteDef, type: ContentTypeDef, values: ContentValues) {
  const row = check(await db(site).from(type.id).insert({ ...toRow(site, type, values), status: "draft" }).select("*").single()) as Row;
  return toEntry(type.id, row);
}

const conflict = () => new UserError(t.errors.contentConflict);

export async function updateEntry(site: SiteDef, entry: ContentEntry, expectedVersion: number, values: ContentValues) {
  if (entry.version !== expectedVersion) throw conflict();
  const type = assertContentEntry(site, entry);
  // Sürüm koşulu yarışı engeller: arada biri kaydettiyse hiçbir satır güncellenmez.
  const rows = check(await db(site).from(type.id).update(toRow(site, type, values)).eq("id", entry.id).eq("version", expectedVersion).select("*")) as Row[];
  if (!rows.length) throw conflict();
  return toEntry(type.id, rows[0]);
}

export async function publishEntry(site: SiteDef, entry: ContentEntry) {
  // published_at ilk yayında trigger ile atanır, sonraki yayınlarda korunur (supabase/schema.sql).
  check(await db(site).from(entry.type).update({ status: "published" }).eq("id", entry.id));
}

export async function unpublishEntry(site: SiteDef, entry: ContentEntry) {
  check(await db(site).from(entry.type).update({ status: "draft" }).eq("id", entry.id));
}

export async function deleteEntry(site: SiteDef, entry: ContentEntry) {
  if (entry.state !== "draft") throw new UserError(t.errors.unpublishFirst);
  check(await db(site).from(entry.type).delete().eq("id", entry.id));
}

/** Supabase tabloları için ortak istemci (talepler gibi içerik dışı tablolar da kullanır). */
export { db as supabaseFor };
