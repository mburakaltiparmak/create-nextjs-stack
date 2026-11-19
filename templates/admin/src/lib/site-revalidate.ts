import "server-only";
import { configFor } from "@/lib/env";
import type { SiteDef } from "@/lib/sites";

/**
 * Yayın değişikliklerinden sonra sitenin önbelleğini tazeler: web/src/app/api/revalidate rotasını
 * REVALIDATION_SECRET ile çağırır (etiket = içerik tipi ID'si). Başarısızlık kaydı engellemez; site en geç
 * kendi önbellek süresi dolunca güncellenir. Contentful modülünde bu iş Contentful webhook'uyla yapılır.
 */
export async function revalidateSite(site: SiteDef, contentType: string) {
  const { siteUrl, revalidationSecret } = configFor(site);
  if (!revalidationSecret) return;
  try {
    await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: revalidationSecret, tag: contentType }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ action: "site.revalidate", result: "failure", contentType, error: error instanceof Error ? error.message : "unknown" })}\n`);
  }
}
