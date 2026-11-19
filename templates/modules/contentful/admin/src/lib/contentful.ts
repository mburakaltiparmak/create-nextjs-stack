import { t } from "@/lib/i18n";
import "server-only";
import { findType, type ContentTypeDef, type RefOptions } from "@/lib/content-model";
import type { ContentValues, LocalizedValue } from "@/lib/content-validation";
import { configFor } from "@/lib/env";
import { ServiceError, UserError } from "@/lib/errors";
import type { SiteDef } from "@/lib/sites";

export type Entry = {
  sys: { id: string; version: number; publishedVersion?: number; updatedAt?: string; contentType: { sys: { id: string } } };
  fields: Record<string, Record<string, unknown>>;
};
export type Asset = {
  sys: { id: string; version: number; publishedVersion?: number };
  fields: { title?: Record<string, string>; description?: Record<string, string>; file?: Record<string, { url?: string; fileName?: string; contentType?: string }> };
};

function config(site: SiteDef) {
  const { contentfulSpace, contentfulEnvironment, contentfulToken } = configFor(site);
  if (!contentfulSpace || !contentfulToken) throw new UserError(t.errors.contentfulMissing(site.label));
  return { space: contentfulSpace, base: `https://api.contentful.com/spaces/${contentfulSpace}/environments/${contentfulEnvironment}`, token: contentfulToken };
}

export async function management<T>(site: SiteDef, path: string, init: RequestInit = {}) {
  const { base, token } = config(site);
  const response = await fetch(`${base}${path}`, { ...init, cache: "no-store", headers: { Authorization: `Bearer ${token}`, "content-type": "application/vnd.contentful.management.v1+json", ...(init.headers || {}) } });
  if (!response.ok) throw new ServiceError("Contentful", response.status, await response.text());
  return response.status === 204 ? null as T : await response.json() as T;
}

/** Tüm alanlar space'in varsayılan dilinde tutulur; diller ayrı alanlardır (model.fieldKey). */
/**
 * Contentful space'inin varsayılan locale'i: tüm alanlar bu locale'de tutulur, içerik dilleri ayrı alanlardır
 * (model.fieldKey). Space'iniz başka bir varsayılanla kurulduysa CONTENTFUL_LOCALE verin.
 */
export const contentfulLocale = process.env.CONTENTFUL_LOCALE?.trim() || "en-US";

export const local = (site: SiteDef, value: unknown) => ({ [contentfulLocale]: value });
const assetLink = (site: SiteDef, id: string) => local(site, { sys: { type: "Link", linkType: "Asset", id } });
const entryLink = (site: SiteDef, id: string) => local(site, { sys: { type: "Link", linkType: "Entry", id } });

// ─── Entries ─────────────────────────────────────────────────────────────────

export async function listEntries(site: SiteDef, contentType?: string) {
  const query = new URLSearchParams({ limit: "500", order: "-sys.updatedAt" });
  if (contentType) query.set("content_type", contentType);
  else query.set("sys.contentType.sys.id[in]", site.model.types.map((type) => type.id).join(","));
  return management<{ items: Entry[] }>(site, `/entries?${query}`);
}

/** `reference` alanları için seçenekler: hedef tipteki tüm kayıtlar (taslaklar dahil), başlığa göre sıralı. */
export async function listEntryOptions(site: SiteDef, contentType: string) {
  const type = findType(site.model, contentType);
  if (!type) return [];
  const titleField = type.fields.find((field) => field.id === type.titleField);
  const key = titleField?.localized ? site.model.fieldKey(type.titleField, site.model.primaryLocale) : type.titleField;
  const query = new URLSearchParams({ content_type: contentType, limit: "1000", order: `fields.${key}` });
  const { items } = await management<{ items: Entry[] }>(site, `/entries?${query}`);
  return items.map((entry) => ({ value: entry.sys.id, label: String(entry.fields[key]?.[contentfulLocale] || entry.sys.id) }));
}

/** Modeldeki tüm `reference` alanlarının seçenekleri (alan ID'si → kayıtlar); içerik formuna geçilir. */
export async function referenceOptions(site: SiteDef): Promise<RefOptions> {
  const fields = site.model.types.flatMap((type) => type.fields).filter((field) => field.kind === "reference" && field.refType);
  const entries = await Promise.all(fields.map(async (field) => [field.id, await listEntryOptions(site, field.refType!)] as const));
  return Object.fromEntries(entries);
}

export async function getEntry(site: SiteDef, id: string) { return management<Entry>(site, `/entries/${encodeURIComponent(id)}`); }

/** Panelde yalnız sitenin içerik modelindeki tipler düzenlenir (talepler ve ayarlar ayrı ekranlardadır). */
export function assertContentEntry(site: SiteDef, entry: Entry): ContentTypeDef {
  const type = findType(site.model, entry.sys.contentType.sys.id);
  if (!type) throw new UserError(t.errors.notEditable);
  return type;
}

export async function slugAvailable(site: SiteDef, contentType: string, slug: string, exceptId?: string) {
  const query = new URLSearchParams({ content_type: contentType, "fields.slug": slug, limit: "2" });
  const result = await management<{ items: Entry[] }>(site, `/entries?${query}`);
  return !result.items.some((entry) => entry.sys.id !== exceptId);
}

function isEmpty(value: unknown) {
  return value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
}

/**
 * Form değerlerini Contentful alanlarına çevirir. Mevcut alanlar korunur; boş isteğe bağlı alanlar ve
 * boş çeviriler silinir (sitede ana dile düşer).
 */
function toFields(site: SiteDef, type: ContentTypeDef, values: ContentValues, existing: Entry["fields"] = {}) {
  const fields = structuredClone(existing);
  const { model } = site;
  for (const field of type.fields) {
    const value = values[field.id];
    if (field.localized) {
      const byLocale = (value ?? {}) as LocalizedValue;
      for (const locale of model.locales) {
        const key = model.fieldKey(field.id, locale);
        const raw = byLocale[locale];
        const cleaned = Array.isArray(raw) ? raw.map((item) => item.trim()).filter(Boolean) : raw?.trim();
        if (isEmpty(cleaned)) delete fields[key];
        else fields[key] = local(site, cleaned);
      }
    } else if (isEmpty(value)) {
      delete fields[field.id];
    } else if (field.kind === "image") {
      fields[field.id] = assetLink(site, String(value));
    } else if (field.kind === "reference") {
      fields[field.id] = entryLink(site, String(value));
    } else {
      fields[field.id] = local(site, value);
    }
  }
  return fields;
}

export async function createEntry(site: SiteDef, type: ContentTypeDef, values: ContentValues) {
  return management<Entry>(site, "/entries", { method: "POST", headers: { "x-contentful-content-type": type.id }, body: JSON.stringify({ fields: toFields(site, type, values) }) });
}

export async function updateEntry(site: SiteDef, entry: Entry, expectedVersion: number, values: ContentValues) {
  if (entry.sys.version !== expectedVersion) throw new UserError(t.errors.contentConflict);
  const type = assertContentEntry(site, entry);
  return management<Entry>(site, `/entries/${entry.sys.id}`, { method: "PUT", headers: { "x-contentful-version": String(expectedVersion) }, body: JSON.stringify({ fields: toFields(site, type, values, entry.fields) }) });
}

export async function publishEntry(site: SiteDef, entry: Entry) { return management<Entry>(site, `/entries/${entry.sys.id}/published`, { method: "PUT", headers: { "x-contentful-version": String(entry.sys.version) } }); }
export async function unpublishEntry(site: SiteDef, entry: Entry) { return management<void>(site, `/entries/${entry.sys.id}/published`, { method: "DELETE", headers: { "x-contentful-version": String(entry.sys.version) } }); }
export async function deleteEntry(site: SiteDef, entry: Entry) {
  if (entry.sys.publishedVersion) throw new UserError(t.errors.unpublishFirst);
  return management<void>(site, `/entries/${entry.sys.id}`, { method: "DELETE", headers: { "x-contentful-version": String(entry.sys.version) } });
}

// ─── Assets (yalnız görselleri Contentful'da tutan siteler) ──────────────────

export async function listAssets(site: SiteDef) { return management<{ items: Asset[] }>(site, "/assets?limit=200&order=-sys.updatedAt"); }

/**
 * Görseli kullanan kayıtlar (taslaklar dahil). `linked`: görsel alanında seçili olanlar; `embedded`: yalnız metin içinde
 * adresiyle geçenler (adres asset ID'sini içerdiği için tam metin aramasıyla bulunur).
 */
export async function assetReferences(site: SiteDef, id: string) {
  const [linked, found] = await Promise.all([
    management<{ items: Entry[] }>(site, `/entries?links_to_asset=${encodeURIComponent(id)}&limit=20`),
    management<{ items: Entry[] }>(site, `/entries?query=${encodeURIComponent(id)}&limit=20`),
  ]);
  const linkedIds = new Set(linked.items.map((entry) => entry.sys.id));
  return { linked: linked.items, embedded: found.items.filter((entry) => !linkedIds.has(entry.sys.id)) };
}

/** Yayındaysa önce yayından kaldırır, sonra kalıcı olarak siler. Kullanımda olup olmadığı çağıran tarafta kontrol edilir. */
export async function deleteAsset(site: SiteDef, id: string) {
  let asset = await management<Asset>(site, `/assets/${encodeURIComponent(id)}`);
  if (asset.sys.publishedVersion) asset = await management<Asset>(site, `/assets/${asset.sys.id}/published`, { method: "DELETE", headers: { "x-contentful-version": String(asset.sys.version) } });
  await management<void>(site, `/assets/${asset.sys.id}`, { method: "DELETE", headers: { "x-contentful-version": String(asset.sys.version) } });
}

async function uploadFile(site: SiteDef, file: File) {
  const { space, token } = config(site);
  const upload = await fetch(`https://upload.contentful.com/spaces/${space}/uploads`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "content-type": "application/octet-stream" }, body: Buffer.from(await file.arrayBuffer()) });
  if (!upload.ok) throw new ServiceError("Contentful", upload.status, await upload.text());
  const uploaded = await upload.json() as { sys: { id: string } };
  return local(site, { contentType: file.type, fileName: file.name, uploadFrom: { sys: { type: "Link", linkType: "Upload", id: uploaded.sys.id } } });
}

/** Dosyayı işletir, işlenene kadar bekler ve görseli yayınlar. */
async function processAndPublish(site: SiteDef, asset: Asset) {
  const locale = contentfulLocale;
  await management(site, `/assets/${asset.sys.id}/files/${locale}/process`, { method: "PUT", headers: { "x-contentful-version": String(asset.sys.version) } });
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    asset = await management<Asset>(site, `/assets/${asset.sys.id}`);
    if (asset.fields.file?.[locale]?.url) break;
  }
  if (!asset.fields.file?.[locale]?.url) throw new UserError(t.media.processingTimeout);
  return management<Asset>(site, `/assets/${asset.sys.id}/published`, { method: "PUT", headers: { "x-contentful-version": String(asset.sys.version) } });
}

export async function createAsset(site: SiteDef, file: File, title: string, description: string) {
  const asset = await management<Asset>(site, "/assets", { method: "POST", body: JSON.stringify({ fields: { title: local(site, title), description: local(site, description), file: await uploadFile(site, file) } }) });
  return processAndPublish(site, asset);
}

/**
 * Görselin dosyasını değiştirir (ör. kırpılmış hali); ID aynı kalır, görsel alanında seçili olduğu tüm içerikler
 * yeni dosyayı gösterir. Başlık ve alternatif metin korunur.
 */
export async function replaceAssetFile(site: SiteDef, id: string, file: File, expectedVersion: number) {
  const current = await management<Asset>(site, `/assets/${encodeURIComponent(id)}`);
  if (current.sys.version !== expectedVersion) throw new ServiceError("Contentful", 409);
  const updated = await management<Asset>(site, `/assets/${current.sys.id}`, { method: "PUT", headers: { "x-contentful-version": String(current.sys.version) }, body: JSON.stringify({ fields: { ...current.fields, file: await uploadFile(site, file) } }) });
  return processAndPublish(site, updated);
}

// ─── Görünüm yardımcıları ────────────────────────────────────────────────────

export function assetUrl(asset: Asset) {
  const url = asset.fields.file?.[contentfulLocale]?.url;
  return url ? (url.startsWith("//") ? `https:${url}` : url) : null;
}

export function toAssetOption(asset: Asset) {
  const file = asset.fields.file?.[contentfulLocale];
  return { id: asset.sys.id, title: asset.fields.title?.[contentfulLocale] || file?.fileName || asset.sys.id, url: assetUrl(asset) };
}
