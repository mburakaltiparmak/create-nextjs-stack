import { createHmac, timingSafeEqual } from "node:crypto";

/** admin/src/lib/sites.ts'teki site anahtarı. */
const SITE_KEY = "main";

export type PreviewPayload = { siteKey: string; path: string; exp: number };

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Admin'in "Önizle" düğmesinin ürettiği kısa ömürlü jeton: base64url({ siteKey, path, exp }).HMAC-SHA256
 * (bkz. admin/src/lib/preview.ts). Geçersiz, süresi dolmuş veya başka siteye aitse null döner.
 */
export function verifyPreviewToken(token: string, secret: string, now = Date.now()): PreviewPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as PreviewPayload;
    if (payload.siteKey !== SITE_KEY) return null;
    if (typeof payload.path !== "string" || !payload.path.startsWith("/") || payload.path.startsWith("//")) return null;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(now / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
