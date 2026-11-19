/**
 * Ortak içerik modeli tipleri. Her sitenin kendi modeli src/lib/models/ altındadır; formlar, doğrulama ve
 * Contentful alan eşlemesi o modelden üretilir. İstemci bileşenleri de kullandığı için "server-only" değildir.
 */

import { t } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";

export type FieldKind =
  | "text"
  | "textarea"
  | "markdown"
  | "slug"
  | "url"
  | "link"
  | "number"
  | "date"
  | "select"
  /** Görsel. Veri kaynağına göre Cloudinary adresi ya da medya kütüphanesindeki görselin kimliği (lib/backend.ts images). */
  | "image"
  /** Satır başına bir madde (Contentful Array<Symbol>). */
  | "list"
  /** Evet/hayır (Contentful Boolean). */
  | "boolean"
  /** Başka bir içerik kaydına bağlantı (Contentful Entry Link); `refType` hedef tipi verir. */
  | "reference";

export type FieldDef = {
  id: string;
  label: string;
  kind: FieldKind;
  /** Dile göre düzenlenir; yalnız sitenin ana dili zorunludur, boş çeviri ana dile düşer. */
  localized?: boolean;
  required?: boolean;
  max?: number;
  rows?: number;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** `reference` alanlarında bağlanılan içerik tipinin ID'si. */
  refType?: string;
};

/** Formda `reference` alanlarının seçenekleri (alan ID'si → kayıtlar); sunucu sayfası yükler. */
export type RefOptions = Record<string, { value: string; label: string }[]>;

export type PathValues = { slug?: string; kind?: string };

export type ContentTypeDef = {
  id: string;
  label: string;
  /** Kenar menü ve liste başlığındaki çoğul ad (yoksa `label`). */
  plural?: string;
  /** Kenar menüdeki simge. */
  icon?: LucideIcon;
  hint: string;
  /** Listelerde başlık olarak gösterilen alan (dile göre alansa ana dildeki değeri). */
  titleField: string;
  fields: FieldDef[];
  /** Sitedeki adres (önizleme için); boş dönerse önizleme yoktur. */
  path: (values: PathValues) => string;
};

export type SiteModel = {
  locales: readonly string[];
  primaryLocale: string;
  localeLabels: Record<string, string>;
  /** Dile göre alanların Contentful'daki alan adı (ör. tagline / tagline_de ya da title_tr). */
  fieldKey: (id: string, locale: string) => string;
  types: ContentTypeDef[];
  /** Sabit sayfa adresleri; slug bunlarla çakışamaz. */
  reservedSlugs?: string[];
};

export const markdownHelp = t.content.markdownHelp;

export function findType(model: SiteModel, id: string) {
  return model.types.find((type) => type.id === id);
}
