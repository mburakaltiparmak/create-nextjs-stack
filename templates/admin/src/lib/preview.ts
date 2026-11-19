import "server-only";
import { createHmac } from "node:crypto";
import { configFor } from "@/lib/env";
import type { SiteDef } from "@/lib/sites";

/** 5 dakika geçerli, HMAC imzalı önizleme bağlantısı; sitenin /api/preview rotası jetonu doğrulayıp draft mode açar. */
export function previewUrl(site: SiteDef, path: string) {
  const { previewSecret, siteUrl } = configFor(site);
  if (!previewSecret) return null;
  const payload = { siteKey: site.key, path: path.startsWith("/") && !path.startsWith("//") ? path : "/", exp: Math.floor(Date.now() / 1000) + 300 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", previewSecret).update(encoded).digest("base64url");
  return `${siteUrl}/api/preview?token=${encoded}.${signature}`;
}
