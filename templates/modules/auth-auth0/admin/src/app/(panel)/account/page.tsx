import { t } from "@/lib/i18n";
import { ShieldCheck, ShieldOff } from "lucide-react";
import type { Metadata } from "next";
import { disableMfa, startMfaEnrollment } from "@/app/account-actions";
import { ActionForm, SubmitButton } from "@/components/ActionForm";
import { PageHeader, StatusBadge } from "@/components/Page";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePrincipal } from "@/lib/authorization";
import { relativeTime } from "@/lib/entry-view";
import { roleLabels } from "@/lib/labels";
import { listAuthenticators } from "@/lib/management";
import { sites } from "@/lib/sites";

export const metadata: Metadata = { title: t.account.title };

export default async function AccountPage() {
  const principal = await requirePrincipal();
  const authenticators = await listAuthenticators(principal.id).catch(() => null);
  const enabled = Boolean(authenticators?.length);

  return <>
    <PageHeader title={t.account.title} description={principal.email}/>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t.account.mfa}</CardTitle>
          <CardDescription>{t.account.mfaHint}</CardDescription>
          <CardAction>{authenticators === null ? <StatusBadge tone="warning">{t.account.unknown}</StatusBadge> : enabled ? <StatusBadge tone="success">{t.account.on}</StatusBadge> : <StatusBadge tone="neutral">{t.account.off}</StatusBadge>}</CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {enabled ? <>
            <p className="text-sm text-muted-foreground">Kurulum: {authenticators!.map((item) => relativeTime(item.created_at)).join(", ")}. Telefonunuzu değiştirdiyseniz kapatıp yeniden açın.</p>
            <ActionForm action={disableMfa} feedback="toast" confirm={{ title: t.account.disableConfirm, description: t.account.disableHint, action: t.account.disable, destructive: true }}>
              <SubmitButton variant="outline" pendingLabel={t.account.disabling}><ShieldOff/>{t.account.disable}</SubmitButton>
            </ActionForm>
          </> : <>
            <p className="text-sm text-muted-foreground">{t.account.enableHint}</p>
            <ActionForm action={startMfaEnrollment} feedback="toast">
              <SubmitButton pendingLabel={t.account.preparing}><ShieldCheck/>{t.account.enable}</SubmitButton>
            </ActionForm>
          </>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t.account.access}</CardTitle><CardDescription>{t.account.accessHint}</CardDescription></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p><span className="text-muted-foreground">{t.fields.role}: </span>{principal.roles.map((role) => roleLabels[role]).join(", ") || "—"}</p>
          <div className="flex flex-wrap gap-1.5">{principal.siteKeys.map((key) => <StatusBadge key={key} tone="neutral" dot={false}>{sites[key].label}</StatusBadge>)}</div>
        </CardContent>
      </Card>
    </div>
  </>;
}
