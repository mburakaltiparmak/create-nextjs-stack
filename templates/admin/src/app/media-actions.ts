"use server";

import { t } from "@/lib/i18n";
import { audited } from "@/lib/audit";
import { requirePrincipal } from "@/lib/authorization";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { UserError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSite, isSiteKey } from "@/lib/sites";
import { maxUploadBytes, uploadTypes } from "@/lib/uploads";

/**
 * Görsel yükleme — Supabase sürümü: dosya Cloudinary'ye gider, dönen adres formdaki görsel alanına yazılır.
 * Contentful modülü bu dosyayı medya kütüphanesi işlemleriyle (yükle, kırp, sil) değiştirir.
 */
export async function uploadCloudinaryImage(siteKey: string, formData: FormData): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    if (!isSiteKey(siteKey)) throw new UserError(t.errors.invalidSite);
    const target = getSite(siteKey);
    const principal = await requirePrincipal("edit", target.key);
    enforceRateLimit("asset.upload", principal.id);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > maxUploadBytes || !uploadTypes.includes(file.type)) throw new UserError(t.media.uploadRules(maxUploadBytes / 1024 / 1024));
    const url = await audited(principal, { action: "asset.cloudinary", resourceType: "asset", resourceId: file.name, metadata: { site: target.key, bytes: file.size } }, () => uploadToCloudinary(target, file));
    return { ok: true, url };
  } catch (error) {
    return { ok: false, message: error instanceof UserError ? error.message : t.media.uploadFailed };
  }
}
