import { t } from "@/lib/i18n";
import { z } from "zod";
import type { ContentTypeDef, FieldDef, SiteModel } from "./content-model";
import { backend } from "./backend";
import { allSites } from "./sites";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Formdan okunan değerler: dile göre alanlar { <dil>: değer } nesnesi, diğerleri düz değerdir. */
export type LocalizedValue = Partial<Record<string, string | string[]>>;
export type ContentValues = Record<string, string | number | boolean | null | string[] | LocalizedValue>;

type Scalar = string | number | boolean | null | string[];

function base(field: FieldDef, model: SiteModel): z.ZodType<Scalar> {
  const max = field.max ?? (field.kind === "markdown" ? 50_000 : field.kind === "textarea" ? 2_000 : 160);
  switch (field.kind) {
    case "slug":
      return z.string().trim().regex(slugPattern, t.validation.slugFormat).max(80)
        .refine((value) => !(model.reservedSlugs ?? []).includes(value), t.validation.reservedSlug);
    case "url":
      return z.union([z.literal(""), z.url({ protocol: /^https?$/, error: t.validation.url }).max(300)]);
    case "image":
      // Cloudinary: görsel adresi (https://… veya site içi /yol); medya kütüphanesi: görselin kimliği.
      return backend.images === "cloudinary"
        ? z.union([z.literal(""), z.string().trim().max(500).regex(/^(https?:\/\/|\/)/, t.validation.imageUrl)])
        : z.union([z.literal(""), z.string().trim().regex(/^[A-Za-z0-9_.-]{1,80}$/, t.validation.imagePick)]);
    case "link":
      return z.string().trim().max(300).refine((value) => (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//.test(value), t.validation.link);
    case "number":
      return z.union([z.literal("").transform(() => null), z.coerce.number().int().min(0).max(10_000)]);
    case "date":
      return z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t.validation.date)]);
    case "select": {
      const options = z.enum((field.options ?? []).map((option) => option.value) as [string, ...string[]]);
      return field.required ? options : z.union([z.literal(""), options]);
    }
    case "boolean":
      // İşaretli kutu/anahtar "on" gönderir, işaretsiz hiç göndermez.
      return z.string().transform((value) => value === "on" || value === "true");
    case "reference":
      return z.union([z.literal(""), z.string().trim().regex(/^[A-Za-z0-9_.-]{1,64}$/, t.validation.reference)]);
    case "list":
      return z.array(z.string().trim().max(500)).max(100);
    default:
      return z.string().trim().max(max);
  }
}

function isBlank(value: Scalar | undefined) {
  return value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
}

function fieldSchema(field: FieldDef, model: SiteModel) {
  const value = base(field, model);
  const primary = model.primaryLocale;
  const message = field.localized ? t.validation.requiredLocale(model.localeLabels[primary], primary.toUpperCase()) : t.validation.required;
  const required = (schema: z.ZodType<Scalar>) =>
    field.required && field.kind !== "number" && field.kind !== "boolean" ? schema.refine((v) => !isBlank(v), message) : schema;

  if (!field.localized) return required(value);
  // Yalnız ana dil zorunludur; diğer diller boş kalırsa sitede ana dile düşer.
  return z.object(Object.fromEntries(model.locales.map((locale) => [locale, locale === primary ? required(value) : value.optional()])));
}

export function contentSchema(model: SiteModel, type: ContentTypeDef) {
  return z.object(Object.fromEntries(type.fields.map((field) => [field.id, fieldSchema(field, model)])));
}

/** Madde listeleri formda JSON dizisi olarak gelir. */
function readList(raw: string) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** FormData → doğrulanmış değerler. Dile göre alanlar `<alan>.<dil>` adıyla gönderilir. */
export function parseContent(model: SiteModel, type: ContentTypeDef, formData: FormData): ContentValues {
  const raw: Record<string, unknown> = {};
  for (const field of type.fields) {
    const read = (name: string) => {
      const value = String(formData.get(name) ?? "");
      return field.kind === "list" ? readList(value) : value;
    };
    raw[field.id] = field.localized ? Object.fromEntries(model.locales.map((locale) => [locale, read(`${field.id}.${locale}`)])) : read(field.id);
  }
  return contentSchema(model, type).parse(raw) as ContentValues;
}

/** Hata mesajlarında kullanılan alan etiketleri (tüm sitelerin modellerinden). */
export const fieldLabels: Record<string, string> = Object.fromEntries(
  allSites.flatMap((site) => site.model.types.flatMap((type) => type.fields.map((field) => [field.id, field.label]))),
);
