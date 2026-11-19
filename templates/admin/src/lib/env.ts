import "server-only";
import type { SiteDef } from "@/lib/sites";

/**
 * Site bazlı ayarlar numaralı değişkenlerden okunur (SUPABASE_SERVICE_ROLE_KEY_2, SITE_URL_2 …);
 * site 1 için soneksiz adlar da geçerlidir. Tek siteli kurulumda soneksiz adları kullanın.
 */
export function siteConfig(n: number) {
  const read = (key: string) => process.env[`${key}_${n}`]?.trim() || (n === 1 ? process.env[key]?.trim() : undefined) || undefined;
  return {
    supabaseUrl: read("NEXT_PUBLIC_SUPABASE_URL") || read("SUPABASE_URL"),
    supabaseServiceKey: read("SUPABASE_SERVICE_ROLE_KEY"),
    siteUrl: (read("SITE_URL") || "http://localhost:3000").replace(/\/$/, ""),
    previewSecret: read("PREVIEW_SECRET"),
    revalidationSecret: read("REVALIDATION_SECRET"),
    cloudinary: {
      cloudName: read("CLOUDINARY_CLOUD_NAME") || read("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
      apiKey: read("CLOUDINARY_API_KEY"),
      apiSecret: read("CLOUDINARY_API_SECRET"),
      folder: read("CLOUDINARY_FOLDER") || "admin_uploads",
    },
  };
}

export const configFor = (site: SiteDef) => siteConfig(site.number);

export const env = {
  cronSecret: process.env.CRON_SECRET?.trim(),
};
