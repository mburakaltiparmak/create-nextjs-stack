"use client";

import { t } from "@/lib/i18n";
import { Trash2 } from "lucide-react";
import { ActionForm, FormField, SubmitButton } from "@/components/ActionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormActionHandler } from "@/lib/action-state";
import { leadStatuses, leadStatusLabels, type LeadStatus } from "@/lib/lead-model";

export default function LeadFollowUp({ id, version, status, internalNote, canEdit, canDelete, actions }: { id: string; version: number; status: LeadStatus; internalNote: string; canEdit: boolean; canDelete: boolean; actions: { save: FormActionHandler; remove: FormActionHandler } }) {
  return <div className="grid content-start gap-6">
    <Card>
      <CardHeader><CardTitle>{t.leads.followUp}</CardTitle><CardDescription>{t.leads.followUpHint}</CardDescription></CardHeader>
      <CardContent>{canEdit ? <ActionForm action={actions.save} feedback="toast" key={version}>
        <input type="hidden" name="id" value={id}/><input type="hidden" name="version" value={version}/>
        <FieldGroup>
          <FormField name="status" label={t.fields.status}>
            <Select name="status" defaultValue={status}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{leadStatuses.map((value) => <SelectItem key={value} value={value}>{leadStatusLabels[value]}</SelectItem>)}</SelectContent></Select>
          </FormField>
          <FormField name="internalNote" label={t.fields.internalNote} description={t.leads.noteHint}>
            <Textarea name="internalNote" maxLength={2000} rows={5} defaultValue={internalNote} placeholder={t.leads.notePlaceholder}/>
          </FormField>
          <SubmitButton className="w-full" pendingLabel={t.form.saving}>{t.form.save}</SubmitButton>
        </FieldGroup>
      </ActionForm> : <p className="text-sm">Durum: <strong>{leadStatusLabels[status]}</strong></p>}</CardContent>
    </Card>
    {canDelete && <Card className="border-destructive/30">
      <CardHeader><CardTitle className="text-destructive">{t.leads.delete}</CardTitle><CardDescription>{t.leads.deleteHint}</CardDescription></CardHeader>
      <CardContent><ActionForm action={actions.remove} feedback="toast" confirm={{ title: t.leads.deleteConfirm, description: t.leads.deleteConfirmHint, action: t.publication.deleteAction, destructive: true }}>
        <input type="hidden" name="id" value={id}/>
        <SubmitButton variant="destructive" className="w-full" pendingLabel={t.common.deleting}><Trash2/>{t.leads.delete}</SubmitButton>
      </ActionForm></CardContent>
    </Card>}
  </div>;
}
