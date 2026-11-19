import { backend } from "./backend";
import type { SiteModel } from "./content-model";
import { siteModel } from "./models/site";

/**
 * Panelin yönettiği siteler. Gizli değer içermez (istemci de kullanır).
 *
 * Panel birden çok siteyi yönetebilecek şekilde kuruludur (her site kendi modeli ve numaralı ortam
 * değişkenleriyle: CONTENTFUL_SPACE_ID_2, SITE_URL_2 …); başlangıçta tek site vardır. Yeni site eklemek için
 * siteKeys'e anahtar, `sites`'a tanım ekleyin ve modelini src/lib/models/ altına yazın.
 */
export type SiteDef = {
  key: SiteKey;
  label: string;
  domain: string;
  /** Ortam değişkeni soneki (1 = soneksiz adlar da geçerli; bkz. lib/env.ts). */
  number: number;
  /** İletişim formu talepleri (Talepler sayfası) bu sitede mi tutuluyor. */
  leads: boolean;
  images: "cloudinary" | "assets";
  model: SiteModel;
};

export const siteKeys = ["main"] as const;
export type SiteKey = (typeof siteKeys)[number];

export const sites: Record<SiteKey, SiteDef> = {
  main: {
    key: "main",
    label: process.env.NEXT_PUBLIC_SITE_NAME || "My Site",
    domain: (process.env.NEXT_PUBLIC_SITE_DOMAIN || "example.com").replace(/^https?:\/\//, ""),
    number: 1,
    leads: true,
    images: backend.images,
    model: siteModel,
  },
};

export function isSiteKey(value: unknown): value is SiteKey {
  return typeof value === "string" && siteKeys.includes(value as SiteKey);
}

export function getSite(key: SiteKey): SiteDef {
  return sites[key];
}

export const allSites = siteKeys.map((key) => sites[key]);

/** İletişim formu taleplerinin tutulduğu site (Talepler sayfası). */
export const leadsSite = allSites.find((site) => site.leads) ?? allSites[0];

export const siteLabels: Record<string, string> = Object.fromEntries(siteKeys.map((key) => [key, sites[key].label]));
