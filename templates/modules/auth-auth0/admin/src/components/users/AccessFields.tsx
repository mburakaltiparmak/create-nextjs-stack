"use client";

import { t } from "@/lib/i18n";
import { useState } from "react";
import { FormField } from "@/components/ActionForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { roleDescriptions, roleLabels } from "@/lib/labels";
import { siteKeys, sites } from "@/lib/sites";
import type { Role } from "@/lib/permissions";

const roles: Role[] = ["editor", "publisher", "administrator"];

/** Rol ve site seçimi; yönetici tüm sitelere eriştiği için site seçimi kapanır. */
export default function AccessFields({ defaultRole = "editor", defaultSites = [] }: { defaultRole?: Role; defaultSites?: string[] }) {
  const [role, setRole] = useState<Role>(defaultRole);
  const admin = role === "administrator";
  return <FieldGroup>
    <FormField name="role" label={t.fields.role} description={roleDescriptions[role]}>
      <Select name="role" value={role} onValueChange={(value) => setRole(value as Role)}>
        <SelectTrigger className="w-full"><SelectValue/></SelectTrigger>
        <SelectContent>{roles.map((value) => <SelectItem key={value} value={value}>{roleLabels[value]}</SelectItem>)}</SelectContent>
      </Select>
    </FormField>
    <FieldSet>
      <FieldLegend variant="label">{t.users.sites}</FieldLegend>
      {admin ? <p className="text-sm text-muted-foreground">{t.users.adminsAllSites}</p> : <div className="grid gap-2 sm:grid-cols-2">{siteKeys.map((key) => <Field key={key} orientation="horizontal" className="rounded-lg border px-3 py-2.5 has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/5">
        <Checkbox id={`site-${key}`} name="siteKeys" value={key} defaultChecked={defaultSites.includes(key)}/>
        <FieldLabel htmlFor={`site-${key}`} className="font-normal">{sites[key].label}<span className="ml-1 text-xs text-muted-foreground">{sites[key].domain}</span></FieldLabel>
      </Field>)}</div>}
    </FieldSet>
  </FieldGroup>;
}
