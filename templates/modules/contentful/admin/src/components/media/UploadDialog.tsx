"use client";

import { t } from "@/lib/i18n";
import { Upload } from "lucide-react";
import { useState } from "react";
import { ActionForm, FormField, notify, SubmitButton } from "@/components/ActionForm";
import ImageDropzone, { titleFromFile } from "@/components/media/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormActionHandler } from "@/lib/action-state";

export default function UploadDialog({ siteKey, action }: { siteKey: string; action: FormActionHandler }) {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  function change(next: boolean) {
    setOpen(next);
    if (!next) { setFile(null); setTitle(""); setRound((value) => value + 1); }
  }

  return <Dialog open={open} onOpenChange={change}>
    <DialogTrigger asChild><Button><Upload/>{t.media.uploadImage}</Button></DialogTrigger>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>{t.media.uploadImage}</DialogTitle><DialogDescription>{t.media.uploadDialogHint}</DialogDescription></DialogHeader>
      <ActionForm key={round} action={action} className="grid gap-6" onSuccess={(state) => { notify(state); change(false); }}>
        <input type="hidden" name="siteKey" value={siteKey}/>
        <FieldGroup>
          <FormField name="file"><ImageDropzone name="file" required file={file} onFile={(next) => { setFile(next); if (!title) setTitle(titleFromFile(next)); }}/></FormField>
          <FormField name="title" label={t.fields.title}><Input name="title" required minLength={2} maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)}/></FormField>
          <FormField name="description" label={t.fields.description} description={t.media.altHint}><Input name="description" required minLength={2} maxLength={300} placeholder={t.media.altPlaceholder}/></FormField>
        </FieldGroup>
        <DialogFooter><Button type="button" variant="outline" onClick={() => change(false)}>{t.common.cancel}</Button><SubmitButton disabled={!file} pendingLabel={t.media.uploading}>{t.media.upload}</SubmitButton></DialogFooter>
      </ActionForm>
    </DialogContent>
  </Dialog>;
}
