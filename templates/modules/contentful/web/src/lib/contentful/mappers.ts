/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Contentful entry'lerini, Supabase varyantının döndürdüğü düz satır şekline
 * çevirir. Amaç: sayfalar ve bileşenler veri kaynağından habersiz kalsın.
 *
 *   Contentful  { sys: { id, createdAt }, fields: { title, category_id: Entry } }
 *   →           { id, created_at, updated_at, title, category_id: "...", categories: {...} }
 */

const DEFAULT_LINK_DEPTH = 1;

function flattenValue(value: any, depth: number): any {
  if (Array.isArray(value)) {
    return value.map((item) => flattenValue(item, depth));
  }

  const type = value?.sys?.type;

  // Asset → doğrudan HTTPS URL. (Bu template görselleri Cloudinary'de tutar,
  // ama Contentful asset alanı eklersen burası onu da çözer.)
  if (type === 'Asset') {
    const url = value.fields?.file?.url;
    return url ? (url.startsWith('//') ? `https:${url}` : url) : null;
  }

  // Çözülmüş referans → derinlik kaldıysa iç içe düzleştir, yoksa sadece ID.
  if (type === 'Entry') {
    return depth > 0 ? flattenEntry(value, depth - 1) : value.sys.id;
  }

  // Çözülmemiş link (include derinliği yetmediyse veya entry silinmişse).
  if (type === 'Link') {
    return value.sys.id ?? null;
  }

  return value;
}

export function flattenEntry(entry: any, depth = DEFAULT_LINK_DEPTH): any {
  if (!entry?.sys) return null;

  const row: any = {
    id: entry.sys.id,
    created_at: entry.sys.createdAt,
    updated_at: entry.sys.updatedAt,
  };

  for (const [key, value] of Object.entries(entry.fields ?? {})) {
    row[key] = flattenValue(value, depth);
  }

  return row;
}

export function flattenEntries(entries: any[], depth = DEFAULT_LINK_DEPTH): any[] {
  return entries.map((entry) => flattenEntry(entry, depth)).filter(Boolean);
}

/**
 * Supabase'in `select("*, categories(title, slug)")` çıktısını taklit eder:
 * referans alanı ID'ye indirgenir, çözülmüş kayıt takma ad altında durur.
 *
 *   normalizeReference(row, "category_id", "categories")
 *   → row.category_id = "6xK..."   row.categories = { id, title, slug, ... }
 */
export function normalizeReference(row: any, key: string, alias: string): any {
  if (!row) return row;

  const value = row[key];

  if (value && typeof value === 'object') {
    row[alias] = value;
    row[key] = value.id ?? null;
  } else {
    row[alias] = null;
    row[key] = value ?? null;
  }

  return row;
}
