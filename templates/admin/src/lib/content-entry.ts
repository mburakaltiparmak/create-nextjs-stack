/**
 * Veri kaynağından bağımsız içerik kaydı. Supabase satırı da Contentful entry'si de buna çevrilir
 * (lib/content-store.ts); formlar, listeler ve özet sayfası yalnız bu şekli bilir. İstemci de kullanır.
 *
 *   fields   Depodaki alan adı → düz değer. Dile göre alanlar model.fieldKey ile ayrı anahtarlardır
 *            (title_tr); görsel alanı görsel kimliği/adresi, `reference` bağlanan kaydın ID'sidir.
 *   state    "changed": yayında ama yayınlanmamış düzenlemesi var (yalnız Contentful'da olur).
 */
export type EntryState = "draft" | "published" | "changed";

export type ContentEntry = {
  id: string;
  type: string;
  version: number;
  state: EntryState;
  updatedAt?: string;
  fields: Record<string, unknown>;
};
