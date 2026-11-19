import "server-only";
import type { SiteDef } from "@/lib/sites";

/**
 * Contentful'da sitenin önbelleğini Contentful webhook'u tazeler (web/src/app/api/revalidate/contentful;
 * kurulum: CONTENTFUL.md). Panelin ayrıca bir şey yapmasına gerek yoktur.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Supabase sürümüyle aynı imza
export async function revalidateSite(site: SiteDef, contentType: string) {}
