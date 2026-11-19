"use client";

import { t } from "@/lib/i18n";
import { Check, Copy, Crop, ExternalLink, ImageIcon, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { removeAsset, saveEditedAsset } from "@/app/media-actions";
import { ActionForm, SubmitButton } from "@/components/ActionForm";
import { thumbnail, type AssetOption } from "@/components/content/AssetPicker";
import LazyImage from "@/components/LazyImage";
import CropDialog from "@/components/media/CropDialog";
import { EmptyState } from "@/components/Page";
import SearchInput from "@/components/SearchInput";
import { useSearchQuery } from "@/hooks/use-url-state";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type LibraryAsset = AssetOption & { description: string; version: number; contentType: string };

const editableTypes = ["image/jpeg", "image/png", "image/webp"];

/** Medya kütüphanesi: arama, ID kopyalama, düzenleme (kırp/yaklaştır/döndür) ve kullanılmayan görseli silme. */
export default function MediaGrid({ siteKey, assets, canEdit, canPublish }: { siteKey: string; assets: LibraryAsset[]; canEdit: boolean; canPublish: boolean }) {
  const { query, setQuery, debounced, searching } = useSearchQuery();
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ asset: LibraryAsset; file: File } | null>(null);
  const router = useRouter();

  /** Orijinal dosya Contentful CDN'inden (CORS açık) indirilir; düzenleme hep tam çözünürlükten başlar. */
  async function edit(asset: LibraryAsset) {
    if (!asset.url) return;
    setLoading(asset.id);
    try {
      const response = await fetch(asset.url);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const name = decodeURIComponent(asset.url.split("/").pop() || "gorsel");
      setEditing({ asset, file: new File([blob], name, { type: blob.type || asset.contentType }) });
    } catch {
      toast.error(t.media.downloadFailed);
    } finally {
      setLoading(null);
    }
  }

  function save(mode: "copy" | "replace") {
    return async (file: File) => {
      if (!editing) return;
      const data = new FormData();
      data.set("siteKey", siteKey);
      data.set("mode", mode);
      data.set("id", editing.asset.id);
      data.set("version", String(editing.asset.version));
      data.set("title", editing.asset.title);
      data.set("description", editing.asset.description);
      data.set("file", file);
      const result = await saveEditedAsset(data);
      if (!result.ok) throw new Error(result.message);
      toast.success(result.message);
      setEditing(null);
      router.refresh();
    };
  }
  const needle = debounced.toLocaleLowerCase("tr");
  const visible = assets.filter((asset) => !needle || `${asset.title} ${asset.description}`.toLocaleLowerCase("tr").includes(needle));

  function copy(id: string) {
    void navigator.clipboard.writeText(id).then(() => { setCopied(id); toast.success(t.media.idCopied); setTimeout(() => setCopied(null), 1500); });
  }

  return <div className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <SearchInput value={query} onChange={setQuery} searching={searching} placeholder={`${t.media.search}…`} label={t.media.search}/>
      <p className="shrink-0 text-sm text-muted-foreground tabular-nums">{visible.length} görsel</p>
    </div>
    {visible.length === 0 ? <EmptyState icon={ImageIcon} title={assets.length ? t.media.noMatch : t.media.empty} description={assets.length ? t.media.noMatchHint : t.media.emptyHint}/> : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{visible.map((asset) => {
      const src = thumbnail(asset, 480);
      return <figure key={asset.id} className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px]">
          {src ? <LazyImage src={src} alt={asset.description || asset.title} wrapperClassName="size-full" className="size-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.03]"/> : <div className="flex size-full items-center justify-center text-xs text-muted-foreground">{t.media.processing}</div>}
          <div className="absolute inset-x-2 top-2 flex justify-end gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            {canEdit && asset.url && editableTypes.includes(asset.contentType) && <Tooltip><TooltipTrigger asChild><Button size="icon-xs" variant="secondary" className="shadow" aria-label={t.media.editAria} disabled={loading === asset.id} onClick={() => edit(asset)}>{loading === asset.id ? <LoaderCircle className="animate-spin"/> : <Crop/>}</Button></TooltipTrigger><TooltipContent>{t.media.editTooltip}</TooltipContent></Tooltip>}
            <Tooltip><TooltipTrigger asChild><Button size="icon-xs" variant="secondary" className="shadow" aria-label={t.media.copyId} onClick={() => copy(asset.id)}>{copied === asset.id ? <Check/> : <Copy/>}</Button></TooltipTrigger><TooltipContent>{t.media.copyId}</TooltipContent></Tooltip>
            {asset.url && <Tooltip><TooltipTrigger asChild><Button size="icon-xs" variant="secondary" className="shadow" asChild><a href={asset.url} target="_blank" rel="noreferrer" aria-label={t.media.openOriginal}><ExternalLink/></a></Button></TooltipTrigger><TooltipContent>{t.media.openOriginal}</TooltipContent></Tooltip>}
          </div>
        </div>
        <figcaption className="flex items-center gap-2 px-3 py-2.5">
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{asset.title}</p><p className="truncate text-xs text-muted-foreground">{asset.description || "Alternatif metin yok"}</p></div>
          {canPublish && <ActionForm action={removeAsset} feedback="toast" className="shrink-0" confirm={{ title: t.media.deleteConfirm, description: t.media.deleteHint(asset.title), action: t.common.delete, destructive: true }}>
            <input type="hidden" name="siteKey" value={siteKey}/>
            <input type="hidden" name="id" value={asset.id}/>
            <SubmitButton variant="ghost" size="icon-sm" aria-label={t.media.deleteAria(asset.title)} className="text-muted-foreground hover:text-destructive" pendingLabel=""><Trash2/></SubmitButton>
          </ActionForm>}
        </figcaption>
      </figure>;
    })}</div>}
    <CropDialog file={editing?.file ?? null} open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null); }}
      {...(canPublish
        ? { onConfirm: save("replace"), confirmLabel: t.media.replace, secondary: { label: t.media.saveAsCopy, onConfirm: save("copy") } }
        : { onConfirm: save("copy"), confirmLabel: t.media.saveAsCopy })}/>
  </div>;
}
