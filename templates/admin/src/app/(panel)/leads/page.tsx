import { t } from "@/lib/i18n";
import type { Metadata } from "next";
import { purgeExpiredLeadsNow, saveLeadRetention } from "@/app/actions";
import LeadsTable from "@/components/leads/LeadsTable";
import RetentionDialog from "@/components/leads/RetentionDialog";
import { PageHeader } from "@/components/Page";
import { can, requirePrincipal } from "@/lib/authorization";
import { relativeTime } from "@/lib/entry-view";
import { formatLeadDate, maxRetentionDays } from "@/lib/lead-model";
import { leadsSite } from "@/lib/sites";
import { getLeadRetention, listLeads } from "@/lib/leads";

export const metadata: Metadata = { title: t.leads.title };

export default async function LeadsPage() {
  const principal = await requirePrincipal("read", leadsSite.key);
  const [{ items, total }, retention] = await Promise.all([listLeads(), getLeadRetention()]);
  const rows = items.map((lead) => ({ id: lead.id, name: lead.name, company: lead.company, email: lead.email, subject: lead.subject, locale: lead.locale, status: lead.status, notificationFailed: lead.notificationStatus === "failed", submitted: formatLeadDate(lead.submittedAt), submittedRelative: relativeTime(lead.submittedAt) }));

  return <>
    <PageHeader title={t.leads.title} description={t.leads.description(leadsSite.domain)}>
      {can(principal, "delete", leadsSite.key)
        ? <RetentionDialog days={retention.days} version={retention.version} maxDays={maxRetentionDays} actions={{ save: saveLeadRetention, purge: purgeExpiredLeadsNow }}/>
        : <span className="text-sm text-muted-foreground">{t.leads.retentionLabel} {retention.days ? t.leads.days(retention.days) : t.leads.unlimited}</span>}
    </PageHeader>
    <LeadsTable rows={rows}/>
    {total > items.length && <p className="text-sm text-muted-foreground">{t.leads.truncated(items.length, total)}</p>}
  </>;
}
