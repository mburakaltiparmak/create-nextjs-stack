"use client";

import { t } from "@/lib/i18n";
import { Eye, EyeOff, Send } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/ActionForm";
import type { FormActionHandler } from "@/lib/action-state";
import type { PublicationState } from "@/lib/entry-view";

/** Detay sayfası başlığındaki önizle / yayınla / yayından kaldır düğmeleri. */
export default function PublicationControls({ siteKey, id, contentType, state, previewPath, canPublish, actions, subject = t.publication.subject }: { siteKey: string; id: string; contentType?: string; state: PublicationState; previewPath?: string; canPublish: boolean; actions: { publication: FormActionHandler; preview?: FormActionHandler }; subject?: string }) {
  const hidden = (operation: string) => <><input type="hidden" name="siteKey" value={siteKey}/><input type="hidden" name="id" value={id}/>{contentType && <input type="hidden" name="contentType" value={contentType}/>}<input type="hidden" name="operation" value={operation}/></>;
  return <>
    {previewPath && actions.preview && <ActionForm action={actions.preview} feedback="toast"><input type="hidden" name="siteKey" value={siteKey}/><input type="hidden" name="path" value={previewPath}/><SubmitButton variant="outline" pendingLabel={t.publication.opening}><Eye/>{t.publication.preview}</SubmitButton></ActionForm>}
    {canPublish && state !== "draft" && <ActionForm action={actions.publication} feedback="toast" confirm={{ title: t.publication.unpublishConfirm, description: t.publication.unpublishHint(subject), action: t.publication.unpublish }}>{hidden("unpublish")}<SubmitButton variant="ghost" pendingLabel={t.publication.unpublishing}><EyeOff/>{t.publication.unpublish}</SubmitButton></ActionForm>}
    {canPublish && state !== "published" && <ActionForm action={actions.publication} feedback="toast">{hidden("publish")}<SubmitButton pendingLabel={t.publication.publishing}><Send/>{state === "changed" ? t.publication.publishChanges : t.publication.publish}</SubmitButton></ActionForm>}
  </>;
}
