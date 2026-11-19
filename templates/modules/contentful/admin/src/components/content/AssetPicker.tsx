"use client";

import { t } from "@/lib/i18n";
import { Check, ImageIcon, LoaderCircle, Upload, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadAssetForField } from "@/app/media-actions";
import ImageDropzone, { titleFromFile } from "@/components/media/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LazyImage from "@/components/LazyImage";
import SearchInput from "@/components/SearchInput";
import { useDebouncedValue } from "@/hooks/use-timing";
import { cn } from "@/lib/utils";

export type AssetOption = { id: string; title: string; url: string | null };

export function thumbnail(asset: AssetOption, width = 320) {
  if (!asset.url) return null;
  return asset.url.endsWith(".svg") ? asset.url : `${asset.url}?w=${width}&fm=webp`;
}

/**
 * Görsel alanı: kütüphaneden seçer ya da bilgisayardan yükler (yüklenen görsel kütüphaneye eklenir ve seçilir).
 * Seçilen Asset ID gizli alanda gönderilir.
 */
export default function AssetPicker({ siteKey, name, defaultValue = "", assets: initialAssets }: { siteKey: string; name: string; defaultValue?: string; assets: AssetOption[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("library");
  const [draft, setDraft] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const selected = assets.find((asset) => asset.id === value);
  const needle = useDebouncedValue(query.trim(), 200).toLocaleLowerCase("tr");
  const visible = assets.filter((asset) => asset.title.toLocaleLowerCase("tr").includes(needle));
  const preview = selected && thumbnail(selected, 640);

  function show(next: boolean, startTab = "library") {
    setOpen(next);
    if (next) { setDraft(value); setQuery(""); setTab(startTab); }
  }

  function uploaded(asset: AssetOption) {
    setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
    setValue(asset.id);
    setOpen(false);
    toast.success(t.media.uploadedSelected);
  }

  return <div className="space-y-2">
    <input type="hidden" name={name} value={value}/>
    <div className="relative overflow-hidden rounded-lg border bg-muted/40">
      {preview ? <LazyImage key={preview} src={preview} alt={selected.title} wrapperClassName="aspect-video w-full" className="size-full object-cover"/> : <div className="flex aspect-video flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <ImageIcon className="size-6"/>{value && !selected ? <span className="px-4 text-center">{t.media.missingInLibrary(value)}</span> : t.media.noneSelected}
      </div>}
      {value && <Button type="button" variant="secondary" size="icon-xs" className="absolute top-2 right-2 shadow" aria-label={t.media.removeImage} onClick={() => setValue("")}><X/></Button>}
    </div>
    {selected && <p className="truncate text-xs text-muted-foreground">{selected.title}</p>}
    <Dialog open={open} onOpenChange={(next) => show(next)}>
      <div className="grid grid-cols-2 gap-2">
        <DialogTrigger asChild><Button type="button" variant="outline" size="sm"><ImageIcon/>{value ? t.media.change : t.media.pickFromLibrary}</Button></DialogTrigger>
        <Button type="button" variant="outline" size="sm" onClick={() => show(true, "upload")}><Upload/>{t.media.uploadNewShort}</Button>
      </div>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader><DialogTitle>{t.media.image}</DialogTitle><DialogDescription>{t.media.pickerHint}</DialogDescription></DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="gap-4">
          <TabsList className="w-full sm:w-fit"><TabsTrigger value="library">{t.media.library}</TabsTrigger><TabsTrigger value="upload">{t.media.uploadNewShort}</TabsTrigger></TabsList>
          <TabsContent value="library" className="space-y-4">
            <SearchInput value={query} onChange={setQuery} searching={query.trim().toLocaleLowerCase("tr") !== needle} placeholder={`${t.media.search}…`} label={t.media.search} className="sm:w-full"/>
            <ScrollArea className="h-[min(55vh,26rem)] pr-3">
              {visible.length === 0 ? <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground">
                {assets.length ? t.media.noMatch : t.media.empty}
                <Button type="button" variant="outline" size="sm" onClick={() => setTab("upload")}><Upload/>{t.media.uploadNew}</Button>
              </div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{visible.map((asset) => {
                const active = asset.id === draft;
                const src = thumbnail(asset);
                return <button key={asset.id} type="button" onClick={() => setDraft(asset.id)} onDoubleClick={() => { setValue(asset.id); setOpen(false); }} aria-pressed={active}
                  className={cn("group relative overflow-hidden rounded-lg border text-left outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50", active ? "border-primary ring-2 ring-primary" : "hover:border-primary/50")}>
                  {src ? <LazyImage src={src} alt="" wrapperClassName="aspect-square w-full bg-muted" className="size-full object-cover"/> : <div className="flex aspect-square items-center justify-center bg-muted text-xs text-muted-foreground">{t.media.processing}</div>}
                  <span className="block truncate px-2 py-1.5 text-xs">{asset.title}</span>
                  {active && <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3"/></span>}
                </button>;
              })}</div>}
            </ScrollArea>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
              <Button type="button" disabled={!draft} onClick={() => { setValue(draft); setOpen(false); }}>{t.media.select}</Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="upload"><UploadPane siteKey={siteKey} onCancel={() => setOpen(false)} onUploaded={uploaded}/></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  </div>;
}

/** Ayrı bir form değil: içerik formunun içinde durduğu için gönderim elle (FormData) yapılır. */
function UploadPane({ siteKey, onCancel, onUploaded }: { siteKey: string; onCancel: () => void; onUploaded: (asset: AssetOption) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const ready = Boolean(file) && title.trim().length >= 2 && description.trim().length >= 2;

  function submit() {
    if (!file) return;
    const data = new FormData();
    data.set("siteKey", siteKey);
    data.set("file", file);
    data.set("title", title);
    data.set("description", description);
    startTransition(async () => {
      const result = await uploadAssetForField(data);
      if (result.ok) onUploaded(result.asset);
      else { setErrors(result.fieldErrors ?? {}); toast.error(result.message); }
    });
  }

  const error = (key: string) => errors[key]?.replace(/^[^:]+: /, "");

  return <div className="grid gap-6">
    <FieldGroup>
      <ImageDropzone file={file} onFile={(next) => { setFile(next); if (!title) setTitle(titleFromFile(next)); }}/>
      <Field data-invalid={error("title") ? true : undefined}>
        <FieldLabel htmlFor="asset-upload-title">{t.fields.title}</FieldLabel>
        <Input id="asset-upload-title" value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)}/>
        {error("title") && <FieldError>{error("title")}</FieldError>}
      </Field>
      <Field data-invalid={error("description") ? true : undefined}>
        <FieldLabel htmlFor="asset-upload-alt">Alternatif metin</FieldLabel>
        <Input id="asset-upload-alt" value={description} maxLength={300} placeholder={t.media.altPlaceholder} onChange={(event) => setDescription(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); if (ready && !pending) submit(); } }}/>
        {error("description") ? <FieldError>{error("description")}</FieldError> : <FieldDescription>{t.media.altHint}</FieldDescription>}
      </Field>
    </FieldGroup>
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>{t.common.cancel}</Button>
      <Button type="button" disabled={!ready || pending} onClick={submit}>{pending ? <><LoaderCircle className="animate-spin"/>{t.media.uploading}</> : <><Upload/>{t.media.uploadAndSelect}</>}</Button>
    </DialogFooter>
  </div>;
}
