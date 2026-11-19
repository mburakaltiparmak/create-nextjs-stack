import { t } from "@/lib/i18n";
import { ArrowLeft, Building2, CalendarDays, Globe, Mail, MessageSquareText, Phone, ShieldCheck, ShieldX, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { removeLead, saveLead } from "@/app/actions";
import LeadFollowUp from "@/components/leads/LeadFollowUp";
import { PageHeader, StatusBadge } from "@/components/Page";
import { AppLink as Link } from "@/components/shell/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { audited } from "@/lib/audit";
import { can, requirePrincipal } from "@/lib/authorization";
import { formatLeadDate, leadIdPattern, leadLocaleLabels, leadStatusLabels, leadStatusTones, notificationLabels } from "@/lib/lead-model";
import { leadsSite } from "@/lib/sites";
import { getLead } from "@/lib/leads";

export const metadata: Metadata = { title: t.leads.detail };

function Detail({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return <div className="flex gap-3">
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4"/></div>
    <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-sm font-medium break-words">{children}</dd></div>
  </div>;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requirePrincipal("read", leadsSite.key);
  const id = (await params).id;
  if (!leadIdPattern.test(id)) notFound();
  // Kişisel veriye erişim GDPR kapsamında izlenebilir olsun diye her görüntüleme loglanır.
  const lead = await audited(principal, { action: "lead.view", resourceType: "lead", resourceId: id }, () => getLead(id));
  const notificationFailed = lead.notificationStatus === "failed";
  const reply = `mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.subject}`)}`;

  return <>
    <Button variant="ghost" size="sm" className="-mb-2 w-fit" asChild><Link href="/leads"><ArrowLeft/>{t.leads.back}</Link></Button>
    <PageHeader title={lead.name} description={<span className="flex flex-wrap items-center gap-2"><StatusBadge tone={leadStatusTones[lead.status]}>{leadStatusLabels[lead.status]}</StatusBadge><span>{lead.subject}</span></span>}>
      {lead.email && <Button asChild><a href={reply}><Mail/>{t.leads.reply}</a></Button>}
    </PageHeader>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid content-start gap-6">
        <Card>
          <CardHeader><CardTitle>{t.leads.contact}</CardTitle></CardHeader>
          <CardContent><dl className="grid gap-5 sm:grid-cols-2">
            <Detail icon={Mail} label={t.fields.email}>{lead.email ? <a href={reply} className="hover:text-primary hover:underline">{lead.email}</a> : "—"}</Detail>
            <Detail icon={Phone} label={t.leads.phone}>{lead.phone ? <a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`} className="hover:text-primary hover:underline">{lead.phone}</a> : "—"}</Detail>
            <Detail icon={Building2} label={t.leads.company}>{lead.company || "—"}</Detail>
            <Detail icon={CalendarDays} label={t.leads.submitted}>{formatLeadDate(lead.submittedAt)}</Detail>
            <Detail icon={Globe} label={t.leads.siteLanguage}>{leadLocaleLabels[lead.locale] ?? (lead.locale || "—")}</Detail>
            <Detail icon={lead.consent ? ShieldCheck : ShieldX} label={t.leads.privacy}>{lead.consent ? t.leads.consented : t.leads.noConsent}</Detail>
          </dl></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t.leads.message}</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Detail icon={MessageSquareText} label={t.leads.subject}>{lead.subject || "—"}</Detail>
            <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">{lead.message || <span className="text-muted-foreground">{t.leads.noMessage}</span>}</div>
            <p className={notificationFailed ? "text-sm text-destructive" : "text-xs text-muted-foreground"}>{t.leads.notificationEmail} {notificationLabels[lead.notificationStatus] || lead.notificationStatus}{notificationFailed && ` — ${t.leads.notificationFailed}`}</p>
          </CardContent>
        </Card>
      </div>
      <LeadFollowUp id={lead.id} version={lead.version} status={lead.status} internalNote={lead.internalNote} canEdit={can(principal, "edit", leadsSite.key)} canDelete={can(principal, "delete", leadsSite.key)} actions={{ save: saveLead, remove: removeLead }}/>
    </div>
  </>;
}
