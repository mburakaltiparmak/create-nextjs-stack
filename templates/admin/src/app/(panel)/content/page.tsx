import { t } from "@/lib/i18n";
import { FileText, Plus } from "lucide-react";
import type { Metadata } from "next";
import { changePublication, openPreview } from "@/app/actions";
import ContentTable from "@/components/content/ContentTable";
import { EmptyState, PageHeader } from "@/components/Page";
import { AppLink as Link } from "@/components/shell/navigation";
import { Button } from "@/components/ui/button";
import { can, requirePrincipal } from "@/lib/authorization";
import { findType } from "@/lib/content-model";
import { listEntries } from "@/lib/content-store";
import { entryTitle, missingTranslations, previewPath, publicationState, relativeTime } from "@/lib/entry-view";
import { currentSite } from "@/lib/site";

export const metadata: Metadata = { title: t.content.title };

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ site?: string; type?: string }> }) {
  const principal = await requirePrincipal();
  const params = await searchParams;
  const site = await currentSite(principal, params.site);
  if (!site) return <EmptyState icon={FileText} title={t.common.noSite} description={t.common.noSiteHint}/>;
  // Kenar menüden bir içerik tipi seçilir (?type=); tipsiz adres tüm tipleri gösterir (özet kartlarının bağlantıları).
  const type = params.type ? findType(site.model, params.type) : undefined;
  const items = await listEntries(site, type?.id);
  const rows = items.map((entry) => ({
    id: entry.id,
    title: entryTitle(site, entry),
    type: entry.type,
    state: publicationState(entry),
    updated: relativeTime(entry.updatedAt),
    previewPath: previewPath(site, entry),
    missing: missingTranslations(site, entry),
  }));

  return <>
    {type
      ? <PageHeader title={type.plural ?? type.label} description={`${type.hint} ${t.content.draftNote}`}>
        <Button asChild><Link href={`/content/new?site=${site.key}&type=${type.id}`}><Plus/>{t.content.newOf(type.label)}</Link></Button>
      </PageHeader>
      : <PageHeader title={t.content.all} description={t.content.allHint(site.domain)}>
        <Button asChild><Link href={`/content/new?site=${site.key}`}><Plus/>{t.content.newContent}</Link></Button>
      </PageHeader>}
    <ContentTable key={`${site.key}-${type?.id ?? "all"}`} rows={rows} fixedType={type?.id} siteKey={site.key} canPublish={can(principal, "publish", site.key)} canDelete={can(principal, "delete", site.key)} actions={{ publication: changePublication, preview: openPreview }}/>
  </>;
}
