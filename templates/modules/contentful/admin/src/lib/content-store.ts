import { t } from "@/lib/i18n";
import "server-only";
import type { ContentEntry, EntryState } from "@/lib/content-entry";
import { findType, type ContentTypeDef } from "@/lib/content-model";
import type { ContentValues } from "@/lib/content-validation";
import * as contentful from "@/lib/contentful";
import { UserError } from "@/lib/errors";
import type { SiteDef } from "@/lib/sites";

/**
 * İçerik deposu — Contentful sürümü (Management API, lib/contentful.ts). Contentful entry'lerini panelin
 * veri kaynağından bağımsız kayıt tipine (lib/content-entry.ts) çevirir; dışa aktarımlar Supabase
 * sürümüyle aynıdır.
 */

function state(entry: contentful.Entry): EntryState {
  if (!entry.sys.publishedVersion) return "draft";
  // Yayından hemen sonra sürüm = yayınlanan sürüm + 1 olur; daha büyükse yayınlanmamış düzenleme vardır.
  return entry.sys.version > entry.sys.publishedVersion + 1 ? "changed" : "published";
}

function plain(value: unknown) {
  const link = value as { sys?: { type?: string; id?: string } } | null;
  return link && typeof link === "object" && link.sys?.type === "Link" ? link.sys.id : value;
}

function toEntry(entry: contentful.Entry): ContentEntry {
  const fields = Object.fromEntries(Object.entries(entry.fields).map(([key, byLocale]) => [key, plain(byLocale?.[contentful.contentfulLocale])]));
  return { id: entry.sys.id, type: entry.sys.contentType.sys.id, version: entry.sys.version, state: state(entry), updatedAt: entry.sys.updatedAt, fields };
}

export async function listEntries(site: SiteDef, contentType?: string): Promise<ContentEntry[]> {
  return (await contentful.listEntries(site, contentType)).items.map(toEntry);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Contentful entry ID'leri tipten bağımsız benzersizdir
export async function getEntry(site: SiteDef, id: string, contentType?: string): Promise<ContentEntry> {
  return toEntry(await contentful.getEntry(site, id));
}

export function assertContentEntry(site: SiteDef, entry: ContentEntry): ContentTypeDef {
  const type = findType(site.model, entry.type);
  if (!type) throw new UserError(t.errors.notEditable);
  return type;
}

export const slugAvailable = contentful.slugAvailable;
export const referenceOptions = contentful.referenceOptions;

export async function createEntry(site: SiteDef, type: ContentTypeDef, values: ContentValues) {
  return toEntry(await contentful.createEntry(site, type, values));
}

export async function updateEntry(site: SiteDef, entry: ContentEntry, expectedVersion: number, values: ContentValues) {
  return toEntry(await contentful.updateEntry(site, await contentful.getEntry(site, entry.id), expectedVersion, values));
}

export async function publishEntry(site: SiteDef, entry: ContentEntry) {
  await contentful.publishEntry(site, await contentful.getEntry(site, entry.id));
}

export async function unpublishEntry(site: SiteDef, entry: ContentEntry) {
  await contentful.unpublishEntry(site, await contentful.getEntry(site, entry.id));
}

export async function deleteEntry(site: SiteDef, entry: ContentEntry) {
  await contentful.deleteEntry(site, await contentful.getEntry(site, entry.id));
}
