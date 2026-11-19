import { t } from "@/lib/i18n";
import type { ContentEntry, EntryState } from "./content-entry";
import { findType } from "./content-model";
import type { SiteDef } from "./sites";

export type PublicationState = EntryState;
export const publicationLabels: Record<PublicationState, string> = t.publication.states;
export const publicationTones = { draft: "neutral", published: "success", changed: "warning" } as const;

const read = (entry: ContentEntry, field: string) => entry.fields[field];

export function entryTitle(site: SiteDef, entry: ContentEntry) {
  const type = findType(site.model, entry.type);
  const titleField = type?.fields.find((field) => field.id === type.titleField);
  const key = titleField?.localized ? site.model.fieldKey(titleField.id, site.model.primaryLocale) : type?.titleField ?? "title";
  return String(read(entry, key) || read(entry, "name") || entry.id);
}

export function publicationState(entry: ContentEntry): PublicationState {
  return entry.state;
}

export function previewPath(site: SiteDef, entry: ContentEntry) {
  const type = findType(site.model, entry.type);
  if (!type) return "";
  return type.path({ slug: String(read(entry, "slug") || ""), kind: String(read(entry, "kind") || "") });
}

/** Çevirisi eksik dilleri bulur (ana dilde dolu olan alanlara göre). */
export function missingTranslations(site: SiteDef, entry: ContentEntry) {
  const { model } = site;
  const type = findType(model, entry.type);
  if (!type) return [];
  const filled = (key: string) => {
    const value = read(entry, key);
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  };
  const localized = type.fields.filter((field) => field.localized && filled(model.fieldKey(field.id, model.primaryLocale)));
  return model.locales.filter((locale) => locale !== model.primaryLocale && localized.some((field) => !filled(model.fieldKey(field.id, locale))));
}

export function relativeTime(value?: string, now = Date.now()) {
  if (!value) return "—";
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  if (Number.isNaN(seconds)) return "—";
  const format = new Intl.RelativeTimeFormat(t.meta.locale, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31_536_000], ["month", 2_592_000], ["week", 604_800], ["day", 86_400], ["hour", 3_600], ["minute", 60]];
  for (const [unit, size] of steps) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  return t.common.justNow;
}
