import { t } from "@/lib/i18n";
import "server-only";
import { createHash } from "node:crypto";
import { configFor } from "@/lib/env";
import { ServiceError, UserError } from "@/lib/errors";
import type { SiteDef } from "@/lib/sites";

/**
 * İmzalı Cloudinary yüklemesi (REST API, SDK yok). API secret yalnız sunucuda kalır;
 * dönen güvenli adres içerik alanına (…_url) yazılır.
 */
export async function uploadToCloudinary(site: SiteDef, file: File) {
  const { cloudName, apiKey, apiSecret, folder } = configFor(site).cloudinary;
  if (!cloudName || !apiKey || !apiSecret) throw new UserError(t.media.cloudinaryMissing(site.label));

  const timestamp = String(Math.floor(Date.now() / 1000));
  const params: Record<string, string> = { timestamp, ...(folder ? { folder } : {}) };
  // İmza: parametreler alfabetik sırayla "k=v&k=v" + api_secret, SHA-1.
  const toSign = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  const signature = createHash("sha1").update(toSign + apiSecret).digest("hex");

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", apiKey);
  body.set("signature", signature);
  for (const [key, value] of Object.entries(params)) body.set(key, value);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
  if (!response.ok) throw new ServiceError("Cloudinary", response.status, await response.text());
  const data = await response.json() as { secure_url?: string };
  if (!data.secure_url) throw new UserError(t.media.cloudinaryNoUrl);
  return data.secure_url;
}
