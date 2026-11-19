"use server";

import { t } from "@/lib/i18n";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { runAction } from "@/lib/action";
import type { ActionState } from "@/lib/action-state";
import { audited } from "@/lib/audit";
import { requirePrincipal } from "@/lib/authorization";
import { findType, type ContentTypeDef } from "@/lib/content-model";
import { parseContent, slugPattern } from "@/lib/content-validation";
import { assertContentEntry, createEntry, deleteEntry, getEntry, publishEntry, slugAvailable, unpublishEntry, updateEntry } from "@/lib/content-store";
import { UserError } from "@/lib/errors";
import { leadIdPattern, leadUpdateSchema, retentionSchema } from "@/lib/lead-model";
import { deleteLead, getLeadRetention, purgeExpiredLeads, setLeadRetention, updateLead } from "@/lib/leads";
import { previewUrl } from "@/lib/preview";
import { enforceRateLimit } from "@/lib/rate-limit";
import { revalidateSite } from "@/lib/site-revalidate";
import { getSite, isSiteKey, leadsSite, type SiteDef } from "@/lib/sites";

function site(value: FormDataEntryValue | null): SiteDef {
  const key = String(value || "");
  if (!isSiteKey(key)) throw new UserError(t.errors.invalidSite);
  return getSite(key);
}

function contentType(target: SiteDef, value: FormDataEntryValue | null): ContentTypeDef {
  const type = findType(target.model, String(value || ""));
  if (!type) throw new UserError(t.errors.invalidType);
  return type;
}

const contentList = (target: SiteDef, type: ContentTypeDef) => `/content?site=${target.key}&type=${type.id}`;

// ─── İçerik ──────────────────────────────────────────────────────────────────

export async function saveContent(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const target = site(formData.get("siteKey"));
    const principal = await requirePrincipal("edit", target.key);
    const type = contentType(target, formData.get("contentType"));
    const values = parseContent(target.model, type, formData);
    const id = String(formData.get("id") || "");
    const slug = typeof values.slug === "string" ? values.slug : "";
    if (slug && !(await slugAvailable(target, type.id, slug, id || undefined))) throw new UserError(t.errors.slugTaken);
    await audited(principal, { action: id ? "content.update" : "content.create", resourceType: type.id, resourceId: id || "new", metadata: { site: target.key } }, async () => {
      if (!id) return createEntry(target, type, values);
      const entry = await getEntry(target, id, type.id);
      if (assertContentEntry(target, entry).id !== type.id) throw new UserError(t.errors.typeLocked);
      return updateEntry(target, entry, Number(formData.get("version")), values);
    });
    await revalidateSite(target, type.id);
    revalidatePath("/content", "layout");
    revalidatePath("/dashboard");
    redirect(`${contentList(target, type)}&notice=saved`);
  });
}

const publicationMessages: Record<string, string> = t.publication.done;

export async function changePublication(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const operation = String(formData.get("operation"));
    if (!publicationMessages[operation]) throw new UserError(t.errors.invalidOperation);
    const target = site(formData.get("siteKey"));
    const principal = await requirePrincipal(operation === "delete" ? "delete" : "publish", target.key);
    enforceRateLimit("content.publication", principal.id);
    const entry = await getEntry(target, String(formData.get("id")), String(formData.get("contentType") || "") || undefined);
    const type = assertContentEntry(target, entry);
    await audited(principal, { action: `content.${operation}`, resourceType: type.id, resourceId: entry.id, metadata: { site: target.key } }, async () => {
      if (operation === "publish") return publishEntry(target, entry);
      if (operation === "unpublish") return unpublishEntry(target, entry);
      return deleteEntry(target, entry);
    });
    await revalidateSite(target, type.id);
    revalidatePath("/content", "layout");
    revalidatePath("/dashboard");
    return publicationMessages[operation];
  });
}

export async function openPreview(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const target = site(formData.get("siteKey"));
    await requirePrincipal("read", target.key);
    const url = previewUrl(target, String(formData.get("path") || "/"));
    if (!url) throw new UserError(t.errors.previewMissing(target.label));
    redirect(url);
  });
}

/**
 * İçerik formundaki canlı slug kontrolü (istemci debounce ile çağırır). Hata fırlatmaz: kontrol yapılamazsa
 * `null` döner ve kayıt sırasında sunucu doğrulaması yine çalışır.
 */
export async function checkSlug(siteKey: string, type: string, slug: string, exceptId?: string): Promise<boolean | null> {
  try {
    if (!isSiteKey(siteKey) || !slugPattern.test(slug)) return null;
    const target = getSite(siteKey);
    if (!findType(target.model, type)) return null;
    const principal = await requirePrincipal("edit", target.key);
    enforceRateLimit("content.slugCheck", principal.id);
    return await slugAvailable(target, type, slug, exceptId || undefined);
  } catch {
    return null;
  }
}

// ─── Talepler ────────────────────────────────────────────────────────────────

export async function saveLead(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const principal = await requirePrincipal("edit", leadsSite.key);
    const id = z.string().regex(leadIdPattern).parse(formData.get("id"));
    const values = leadUpdateSchema.parse({ status: formData.get("status"), internalNote: formData.get("internalNote") || "" });
    await audited(principal, { action: "lead.update", resourceType: "lead", resourceId: id, metadata: { status: values.status } }, () => updateLead(id, Number(formData.get("version")), values));
    revalidatePath("/leads", "layout");
    revalidatePath("/dashboard");
    return t.leads.updated;
  });
}

export async function removeLead(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const principal = await requirePrincipal("delete", leadsSite.key);
    const id = z.string().regex(leadIdPattern).parse(formData.get("id"));
    await audited(principal, { action: "lead.delete", resourceType: "lead", resourceId: id }, () => deleteLead(id));
    revalidatePath("/leads", "layout");
    revalidatePath("/dashboard");
    redirect("/leads?notice=deleted");
  });
}

// Saklama süresini veri sorumlusu belirler; panel yalnız uygular. Silme yetkisi gerektirir.
export async function saveLeadRetention(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const principal = await requirePrincipal("delete", leadsSite.key);
    const days = retentionSchema.parse(String(formData.get("days") ?? "").trim());
    await audited(principal, { action: "lead.retention.update", resourceType: "siteSettings", resourceId: "siteSettings", metadata: { days: days ?? "unlimited" } }, () => setLeadRetention(Number(formData.get("version")), days));
    revalidatePath("/leads");
    return days ? t.leads.retentionSaved(days) : t.leads.retentionCleared;
  });
}

export async function purgeExpiredLeadsNow() {
  return runAction(async () => {
    const principal = await requirePrincipal("delete", leadsSite.key);
    enforceRateLimit("lead.purge", principal.id);
    const { days } = await getLeadRetention();
    if (!days) throw new UserError(t.leads.retentionFirst);
    const { deleted } = await audited(principal, { action: "lead.retention.purge", resourceType: "lead", resourceId: "all", metadata: { days } }, () => purgeExpiredLeads(days));
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return deleted ? t.leads.purged(deleted) : t.leads.nothingToPurge;
  });
}
