import "server-only";
import type { SiteDef } from "@/lib/sites";

/**
 * Formdaki görsel alanının seçenekleri. Supabase sürümünde görseller Cloudinary'ye formdan yüklenir,
 * seçilecek kütüphane yoktur; Contentful modülü bu dosyayı medya kütüphanesini listeleyen sürümle değiştirir.
 */
export type ImageOption = { id: string; title: string; url: string | null };

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Contentful sürümüyle aynı imza
export async function imageOptions(site: SiteDef): Promise<ImageOption[]> {
  return [];
}
