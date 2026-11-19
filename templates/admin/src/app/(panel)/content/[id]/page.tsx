import { t } from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { changePublication, openPreview } from "@/app/actions";
import ContentForm from "@/components/ContentForm";
import PublicationControls from "@/components/content/PublicationControls";
import { PageHeader, StatusBadge } from "@/components/Page";
import { can, requirePrincipal } from "@/lib/authorization";
import { assertContentEntry, getEntry, referenceOptions } from "@/lib/content-store";
import { imageOptions } from "@/lib/media";
import { entryTitle, missingTranslations, previewPath, publicationLabels, publicationState, publicationTones, relativeTime } from "@/lib/entry-view";
import { configFor } from "@/lib/env";
import { currentSite } from "@/lib/site";

export const metadata: Metadata = { title: t.content.edit };

export default async function EditContentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ site?: string; type?: string }> }) {
  const principal = await requirePrincipal();
  const query = await searchParams;
  const requested = query.site;
  const site = await currentSite(principal, requested);
  // Kayıt bir siteye aittir; bağlantıdaki site erişilemiyorsa kayıt da gösterilmez.
  if (!site || (requested && requested !== site.key)) notFound();
  const entry = await getEntry(site, (await params).id, query.type);
  const type = assertContentEntry(site, entry);
  const [assets, refOptions] = await Promise.all([
    imageOptions(site).catch(() => []),
    referenceOptions(site),
  ]);
  const state = publicationState(entry);
  const missing = missingTranslations(site, entry);

  return <>
    <PageHeader title={entryTitle(site, entry)} description={<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <StatusBadge tone={publicationTones[state]}>{publicationLabels[state]}</StatusBadge>
      {missing.length > 0 && <StatusBadge tone="warning" dot={false}>{t.content.missingTranslation} {missing.map((locale) => locale.toUpperCase()).join(", ")}</StatusBadge>}
      <span>{type.label} · {site.label} · {t.content.lastEdited(relativeTime(entry.updatedAt))} · {t.content.version(entry.version)}</span>
    </span>}>
      <PublicationControls siteKey={site.key} id={entry.id} contentType={entry.type} state={state} previewPath={previewPath(site, entry)} canPublish={can(principal, "publish", site.key)} actions={{ publication: changePublication, preview: openPreview }}/>
    </PageHeader>
    <ContentForm key={`${site.key}-${entry.id}`} siteKey={site.key} entry={entry} siteUrl={configFor(site).siteUrl} assets={assets} refOptions={refOptions}/>
  </>;
}
