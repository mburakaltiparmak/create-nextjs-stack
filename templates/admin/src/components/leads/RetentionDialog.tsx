"use client";

import { t } from "@/lib/i18n";
import { Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import { ActionForm, FormField, SubmitButton } from "@/components/ActionForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import type { FormActionHandler } from "@/lib/action-state";

export default function RetentionDialog({ days, version, maxDays, actions }: { days: number | null; version: number; maxDays: number; actions: { save: FormActionHandler; purge: FormActionHandler } }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline"><Clock/>{t.leads.retentionButton(days ? t.leads.days(days) : t.leads.unlimited)}</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t.leads.retentionTitle}</DialogTitle>
        <DialogDescription>{t.leads.retentionHint}</DialogDescription>
      </DialogHeader>
      <ActionForm action={actions.save} feedback="toast" onSuccess={() => setOpen(false)} className="grid gap-4"
        confirm={{ title: t.leads.retentionConfirm, description: t.leads.retentionConfirmHint, action: t.form.save }}>
        <input type="hidden" name="version" value={version}/>
        <FormField name="days" label={t.leads.retention} description={t.leads.retentionRange(maxDays)}>
          <InputGroup className="w-48"><InputGroupInput name="days" type="number" min={1} max={maxDays} step={1} defaultValue={days ?? ""} placeholder={t.leads.unlimitedPlaceholder}/><InputGroupAddon align="inline-end">{t.leads.dayUnit}</InputGroupAddon></InputGroup>
        </FormField>
        <DialogFooter><SubmitButton pendingLabel={t.form.saving}>{t.form.save}</SubmitButton></DialogFooter>
      </ActionForm>
      {days && <>
        <Separator/>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-medium">{t.leads.purgeNow}</p><p className="text-sm text-muted-foreground">{t.leads.purgeNowHint(days)}</p></div>
          <ActionForm action={actions.purge} feedback="toast" confirm={{ title: t.leads.purgeConfirm, description: t.leads.purgeConfirmHint(days), action: t.publication.deleteAction, destructive: true }}>
            <SubmitButton variant="destructive" pendingLabel={t.common.deleting}><Trash2/>{t.leads.deleteNow}</SubmitButton>
          </ActionForm>
        </div>
      </>}
    </DialogContent>
  </Dialog>;
}
