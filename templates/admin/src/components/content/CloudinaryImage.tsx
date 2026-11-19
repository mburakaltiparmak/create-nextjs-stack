"use client";

/* eslint-disable @next/next/no-img-element -- önizleme Cloudinary adresinden doğrudan gösterilir */
import { t } from "@/lib/i18n";
import { ImageUp, LoaderCircle, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadCloudinaryImage } from "@/app/media-actions";
import CropDialog from "@/components/media/CropDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { croppable } from "@/lib/crop";
import { maxUploadBytes, uploadTypes } from "@/lib/uploads";

/** Cloudinary'de tutulan görsel: yükle veya adres yapıştır; adres gizli alanla formla birlikte gönderilir. */
export default function CloudinaryImage({ name, siteKey, siteUrl, defaultValue }: { name: string; siteKey: string; siteUrl: string; defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  // Seçilen JPEG/PNG/WebP önce düzenleme penceresinde açılır; SVG doğrudan yüklenir.
  const [editing, setEditing] = useState<File | null>(null);

  function choose(file: File | undefined) {
    if (!file) return;
    if (!uploadTypes.includes(file.type) || file.size > maxUploadBytes) {
      toast.error(t.media.uploadRules(maxUploadBytes / 1024 / 1024));
      if (input.current) input.current.value = "";
      return;
    }
    if (croppable(file)) setEditing(file);
    else upload(file);
  }

  function closeEditor() {
    setEditing(null);
    if (input.current) input.current.value = "";
  }

  function upload(file: File) {
    setEditing(null);
    const data = new FormData();
    data.set("file", file);
    startTransition(async () => {
      const result = await uploadCloudinaryImage(siteKey, data);
      if (result.ok) {
        setUrl(result.url);
        toast.success(t.media.uploadedRememberSave);
      } else toast.error(result.message);
      if (input.current) input.current.value = "";
    });
  }

  // Cloudinary adresleri küçültülerek, site içi yollar (/images/…) sitenin kendi adresinden gösterilir.
  const preview = !url ? null : /^https?:\/\//.test(url) ? url.replace("/upload/", "/upload/w_640,f_auto,q_auto/") : url.startsWith("/") ? `${siteUrl}${url}` : null;

  return <div className="space-y-2">
    <input type="hidden" name={name} value={url}/>
    <div className="relative overflow-hidden rounded-lg border bg-muted/40">
      {preview ? <img src={preview} alt="" className="aspect-video w-full object-cover"/> : <div className="flex aspect-video flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <ImageUp className="size-6"/>{url ? <span className="px-4 text-center break-all">{url}</span> : t.media.noImage}
      </div>}
      {pending && <div className="absolute inset-0 flex items-center justify-center bg-background/70"><LoaderCircle className="size-6 animate-spin text-primary" aria-label={t.common.loading}/></div>}
      {url && !pending && <Button type="button" variant="secondary" size="icon-xs" className="absolute top-2 right-2 shadow" aria-label={t.media.removeImage} onClick={() => setUrl("")}><X/></Button>}
    </div>
    <input ref={input} type="file" accept={uploadTypes.join(",")} className="sr-only" tabIndex={-1} onChange={(event) => choose(event.target.files?.[0])}/>
    <CropDialog file={editing} open={Boolean(editing)} onOpenChange={(open) => { if (!open) closeEditor(); }} onConfirm={upload} onSkip={() => editing && upload(editing)} confirmLabel={t.media.applyAndUpload}/>
    <Button type="button" variant="outline" size="sm" className="w-full" disabled={pending} onClick={() => input.current?.click()}><ImageUp/>{url ? t.media.changeImage : t.media.uploadImage}</Button>
    <Input value={url} onChange={(event) => setUrl(event.target.value.trim())} placeholder={t.media.pasteUrl} className="h-8 text-xs" aria-label={t.media.imageUrl}/>
  </div>;
}
