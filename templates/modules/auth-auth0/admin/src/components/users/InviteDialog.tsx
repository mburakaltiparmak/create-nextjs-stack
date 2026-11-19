"use client";

import { t } from "@/lib/i18n";
import { UserPlus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ActionForm, FormField, notify, SubmitButton } from "@/components/ActionForm";
import AccessFields from "@/components/users/AccessFields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormActionHandler } from "@/lib/action-state";

export default function InviteDialog({ ttlDays, action }: { ttlDays: number; action: FormActionHandler }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Komut menüsünden ?invite=1 ile açılabilir.
  const [open, setOpen] = useState(params.get("invite") === "1");
  const [round, setRound] = useState(0);

  function change(next: boolean) {
    setOpen(next);
    if (!next) { setRound((value) => value + 1); if (params.get("invite")) router.replace(pathname, { scroll: false }); }
  }

  return <Dialog open={open} onOpenChange={change}>
    <DialogTrigger asChild><Button><UserPlus/>{t.users.invite}</Button></DialogTrigger>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{t.users.invite}</DialogTitle>
        <DialogDescription>{t.users.inviteHint(ttlDays)}</DialogDescription>
      </DialogHeader>
      {/* Her açılışta form sıfırdan başlar; e-postası gönderilemeyen davetin bağlantısı kapatılana kadar görünür. */}
      <ActionForm key={round} action={action} className="grid gap-6" onSuccess={(state) => { if (!state.link) { notify(state); change(false); } }}>
        <FieldGroup>
          <FormField name="email" label={t.fields.email}><Input name="email" type="email" required autoComplete="off" placeholder={t.users.emailPlaceholder} autoFocus/></FormField>
          <AccessFields/>
        </FieldGroup>
        <DialogFooter><Button type="button" variant="outline" onClick={() => change(false)}>{t.common.close}</Button><SubmitButton pendingLabel={t.users.sending}>{t.users.sendInvite}</SubmitButton></DialogFooter>
      </ActionForm>
    </DialogContent>
  </Dialog>;
}
