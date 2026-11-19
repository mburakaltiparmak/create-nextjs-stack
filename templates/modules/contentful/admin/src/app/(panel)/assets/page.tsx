import { t } from "@/lib/i18n";
import { ImageIcon } from "lucide-react";
import type { Metadata } from "next";
import { uploadAsset } from "@/app/media-actions";
import MediaGrid from "@/components/media/MediaGrid";
import UploadDialog from "@/components/media/UploadDialog";
import { EmptyState, PageHeader } from "@/components/Page";
import { can, requirePrincipal } from "@/lib/authorization";
import { contentfulLocale, listAssets, toAssetOption } from "@/lib/contentful";
import { currentSite } from "@/lib/site";

export const metadata: Metadata = { title: t.nav.media };

export default async function AssetsPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const principal = await requirePrincipal();
  const site = await currentSite(principal, (await searchParams).site);
  if (!site) return <EmptyState icon={ImageIcon} title={t.common.noSite} description={t.common.noSiteHint}/>;
  if (site.images !== "assets") return <EmptyState icon={ImageIcon} title={t.media.noLibrary}/>;
  const { items } = await listAssets(site);
  const assets = items.map((asset) => ({ ...toAssetOption(asset), description: asset.fields.description?.[contentfulLocale] || "", version: asset.sys.version, contentType: asset.fields.file?.[contentfulLocale]?.contentType ?? "" }));
  return <>
    <PageHeader title={t.nav.media} description={t.media.pageHint(site.label)}>
      <UploadDialog siteKey={site.key} action={uploadAsset}/>
    </PageHeader>
    <MediaGrid siteKey={site.key} assets={assets} canEdit={can(principal, "edit", site.key)} canPublish={can(principal, "publish", site.key)}/>
  </>;
}
