"use server";

import { t } from "@/lib/i18n";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction } from "@/lib/action";
import type { ActionState } from "@/lib/action-state";
import { audited } from "@/lib/audit";
import { requirePrincipal } from "@/lib/authorization";
import { assetReferences, createAsset, deleteAsset, replaceAssetFile, toAssetOption, type Entry } from "@/lib/contentful";
import { UserError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSite, isSiteKey, type SiteDef } from "@/lib/sites";
import { maxUploadBytes, uploadTypes } from "@/lib/uploads";

/**
 * Medya kütüphanesi işlemleri — Contentful sürümü (yükle, kırpılmış hali kaydet, sil). Supabase sürümü
 * bunun yerine yalnız Cloudinary yüklemesi içerir.
 */

function site(value: FormDataEntryValue | null): SiteDef {
  const key = String(value || "");
  if (!isSiteKey(key)) throw new UserError(t.errors.invalidSite);
  return getSite(key);
}

/** Kayıt başlığı (görselin kullanıldığı içerikleri adlandırmak için). */
function entryTitle(target: SiteDef, entry: Entry) {
  const type = target.model.types.find((item) => item.id === entry.sys.contentType.sys.id);
  const field = type?.fields.find((item) => item.id === type.titleField);
  const key = field?.localized ? target.model.fieldKey(field.id, target.model.primaryLocale) : type?.titleField ?? "title";
  const value = Object.values(entry.fields[key] ?? {})[0];
  return String(value || entry.sys.id);
}

function uploadedImage(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > maxUploadBytes || !uploadTypes.includes(file.type)) throw new UserError(t.media.uploadRules(maxUploadBytes / 1024 / 1024));
  return file;
}

/** Görseli Contentful kütüphanesine yükleyip yayınlar; Medya sayfası ve içerik formundaki görsel seçici kullanır. */
async function uploadLibraryImage(formData: FormData) {
  const target = site(formData.get("siteKey"));
  if (target.images !== "assets") throw new UserError(t.media.noLibrary);
  const principal = await requirePrincipal("edit", target.key);
  enforceRateLimit("asset.upload", principal.id);
  const file = uploadedImage(formData);
  const title = z.string().trim().min(2).max(160).parse(formData.get("title"));
  const description = z.string().trim().min(2).max(300).parse(formData.get("description"));
  const asset = await audited(principal, { action: "asset.create", resourceType: "asset", resourceId: file.name, metadata: { site: target.key, contentType: file.type, bytes: file.size } }, () => createAsset(target, file, title, description));
  revalidatePath("/assets");
  return toAssetOption(asset);
}

export async function uploadAsset(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    await uploadLibraryImage(formData);
    return t.media.uploadedPublished;
  });
}

/** İçerik formundan yükleme: yüklenen görsel kütüphaneye eklenir ve alanda seçili olarak döner. */
export async function uploadAssetForField(formData: FormData): Promise<{ ok: true; asset: { id: string; title: string; url: string | null } } | { ok: false; message: string; fieldErrors?: Record<string, string> }> {
  let asset: Awaited<ReturnType<typeof uploadLibraryImage>> | null = null;
  const result = await runAction(async () => { asset = await uploadLibraryImage(formData); });
  return asset && result?.ok ? { ok: true, asset } : { ok: false, message: result?.message ?? t.media.uploadFailed, fieldErrors: result?.fieldErrors };
}

/**
 * Kütüphanedeki görselin düzenlenmiş (kırpılmış/döndürülmüş) hali. "copy" yeni görsel olarak ekler; "replace" aynı görselin
 * dosyasını değiştirir ve görsel alanında seçili olduğu tüm yayındaki içerikler hemen yeni hali gösterir (bu yüzden yayın yetkisi ister).
 * Metin içine adresiyle eklenmiş görselin dosyası değiştirilmez: eski adres bozulurdu.
 */
export async function saveEditedAsset(formData: FormData): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  const result = await runAction(async () => {
    const target = site(formData.get("siteKey"));
    if (target.images !== "assets") throw new UserError(t.media.noLibrary);
    const mode = z.enum(["copy", "replace"]).parse(formData.get("mode"));
    const id = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/).parse(formData.get("id"));
    const principal = await requirePrincipal(mode === "replace" ? "publish" : "edit", target.key);
    enforceRateLimit("asset.upload", principal.id);
    const file = uploadedImage(formData);
    if (mode === "copy") {
      const title = z.string().trim().min(2).max(160).parse(formData.get("title"));
      const description = z.string().trim().min(2).max(300).catch(title).parse(formData.get("description"));
      await audited(principal, { action: "asset.create", resourceType: "asset", resourceId: file.name, metadata: { site: target.key, from: id, bytes: file.size } }, () => createAsset(target, file, t.media.editedTitle(title).slice(0, 160), description));
      revalidatePath("/assets");
      return t.media.savedAsCopy;
    }
    const version = z.coerce.number().int().positive().parse(formData.get("version"));
    const { linked, embedded } = await assetReferences(target, id);
    if (embedded.length) throw new UserError(t.media.embedded(embedded.length, entryTitle(target, embedded[0])));
    await audited(principal, { action: "asset.replace", resourceType: "asset", resourceId: id, metadata: { site: target.key, bytes: file.size, usedBy: linked.length } }, () => replaceAssetFile(target, id, file, version));
    revalidatePath("/assets");
    return linked.length ? t.media.replacedUsed(linked.length) : t.media.replaced;
  });
  return result?.ok ? { ok: true, message: result.message } : { ok: false, message: result?.message ?? t.media.saveFailed };
}

/** Kullanılmayan görseli siler; bir içerikte (taslak dahil) kullanılıyorsa silmez ve hangileri olduğunu söyler. */
export async function removeAsset(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const target = site(formData.get("siteKey"));
    if (target.images !== "assets") throw new UserError(t.media.noLibrary);
    // Görsel silme yayıncılara da açık; kullanılan görsel zaten silinemez.
    const principal = await requirePrincipal("publish", target.key);
    const id = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/).parse(formData.get("id"));
    const { linked, embedded } = await assetReferences(target, id);
    const references = [...linked, ...embedded];
    if (references.length) {
      const names = references.slice(0, 3).map((entry) => `“${entryTitle(target, entry)}”`).join(", ");
      throw new UserError(t.media.inUse(references.length, `${names}${references.length > 3 ? "…" : ""}`));
    }
    await audited(principal, { action: "asset.delete", resourceType: "asset", resourceId: id, metadata: { site: target.key } }, () => deleteAsset(target, id));
    revalidatePath("/assets");
    return t.media.deleted;
  });
}
