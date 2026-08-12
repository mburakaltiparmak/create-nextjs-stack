import type { Document } from '@contentful/rich-text-types';

/**
 * Düzleştirilmiş entry tipleri — `flattenEntry()` çıktısıyla birebir eşleşir.
 * Alan adları Supabase varyantındaki sütun adlarıyla aynı tutulmuştur.
 *
 * Contentful'daki content model'den otomatik tip üretmek için:
 *   npm run contentful:types   → src/lib/contentful/types.generated.ts
 */

export interface ContentfulRow {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Category extends ContentfulRow {
  title: string;
  slug: string;
  description: string | null;
  featured: boolean;
  published: boolean;
}

export interface Client extends ContentfulRow {
  name: string;
  logo_url: string | null;
  website: string | null;
}

export interface Product extends ContentfulRow {
  title: string;
  slug: string;
  description: string | null;
  /** Contentful web app'inden düzenlenen zengin metin gövdesi. */
  body: Document | null;
  featured_image_url: string | null;
  category_id: string | null;
  featured: boolean;
  published: boolean;
}

export interface Project extends ContentfulRow {
  title: string;
  slug: string;
  description: string | null;
  /** Contentful web app'inden düzenlenen zengin metin gövdesi. */
  body: Document | null;
  client_id: string | null;
  featured_image_url: string | null;
  published: boolean;
}

// Referans alanları çözülmüş hâlleri — Supabase'in join çıktısını taklit eder.
export interface ProductWithCategory extends Product {
  categories: Category | null;
}

export interface ProjectWithClient extends Project {
  clients: Client | null;
}
