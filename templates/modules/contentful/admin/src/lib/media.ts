import "server-only";
import { listAssets, toAssetOption } from "@/lib/contentful";
import type { SiteDef } from "@/lib/sites";

/** Formdaki görsel alanının seçenekleri: Contentful medya kütüphanesi (en yeni 200 görsel). */
export type ImageOption = { id: string; title: string; url: string | null };

export async function imageOptions(site: SiteDef): Promise<ImageOption[]> {
  return (await listAssets(site)).items.map(toAssetOption);
}
