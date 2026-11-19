import { t } from "@/lib/i18n";
import { FileText } from "lucide-react";
import type { Metadata } from "next";
import ContentForm from "@/components/ContentForm";
import { EmptyState, PageHeader } from "@/components/Page";
import { requirePrincipal } from "@/lib/authorization";
import { findType } from "@/lib/content-model";
import { referenceOptions } from "@/lib/content-store";
import { imageOptions } from "@/lib/media";
import { configFor } from "@/lib/env";
import { currentSite } from "@/lib/site";

export const metadata: Metadata = { title: t.content.newContent };

export default async function NewContentPage({ searchParams }: { searchParams: Promise<{ site?: string; type?: string }> }) {
  const principal = await requirePrincipal();
  const params = await searchParams;
  const site = await currentSite(principal, params.site);
  if (!site) return <EmptyState icon={FileText} title={t.common.noSite} description={t.common.noSiteHint}/>;
  await requirePrincipal("edit", site.key);
  const [assets, refOptions] = await Promise.all([
    imageOptions(site).catch(() => []),
    referenceOptions(site),
  ]);
  return <>
    <PageHeader title={(() => { const type = params.type ? findType(site.model, params.type) : undefined; return type ? t.content.newOf(type.label) : t.content.newContent; })()} description={t.content.newHint(site.domain)}/>
    <ContentForm key={site.key} siteKey={site.key} initialType={params.type} siteUrl={configFor(site).siteUrl} assets={assets} refOptions={refOptions}/>
  </>;
}
