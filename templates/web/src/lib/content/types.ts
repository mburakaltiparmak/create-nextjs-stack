/**
 * Sitenin içerik tipleri — admin modeliyle (admin/src/lib/models/site.ts) aynı alanlar. Veri kaynağı
 * (Supabase tablosu veya Contentful) lib/content/service.ts'te bu şekle çevrilir; sayfalar yalnız bunu bilir.
 */
export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  coverImage: string | null;
  publishedOn: string | null;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  order: number | null;
};

/** Önbellek etiketleri = içerik tipi ID'leri (admin ve Contentful webhook'u bu adlarla tazeler). */
export const CONTENT_TAGS = { posts: "posts", pages: "pages" } as const;
export const CACHE_SECONDS = 300;
