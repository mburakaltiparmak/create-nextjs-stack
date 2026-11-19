import "server-only";
import type { SiteDef } from "@/lib/sites";

/**
 * Site bazlı ayarlar numaralı değişkenlerden okunur (CONTENTFUL_SPACE_ID_2, SITE_URL_2 …);
 * site 1 için soneksiz adlar da geçerlidir. Tek siteli kurulumda soneksiz adları kullanın.
 */
export function siteConfig(n: number) {
  const read = (key: string) => process.env[`${key}_${n}`]?.trim() || (n === 1 ? process.env[key]?.trim() : undefined) || undefined;
  return {
    contentfulSpace: read("CONTENTFUL_SPACE_ID"),
    contentfulEnvironment: read("CONTENTFUL_ENVIRONMENT") || "master",
    contentfulToken: read("CONTENTFUL_MANAGEMENT_TOKEN"),
    siteUrl: (read("SITE_URL") || "http://localhost:3000").replace(/\/$/, ""),
    previewSecret: read("PREVIEW_SECRET"),
  };
}

export const configFor = (site: SiteDef) => siteConfig(site.number);

export const env = {
  cronSecret: process.env.CRON_SECRET?.trim(),
};
