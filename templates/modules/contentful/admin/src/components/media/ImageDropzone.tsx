"use client";

/* eslint-disable @next/next/no-img-element -- yerel dosya önizlemesi (blob:) */
import { t } from "@/lib/i18n";
import { Crop, ImageUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import CropDialog from "@/components/media/CropDialog";
import { Button } from "@/components/ui/button";
import { croppable } from "@/lib/crop";
import { maxUploadBytes, uploadTypes } from "@/lib/uploads";
import { cn } from "@/lib/utils";

/** Yüklenecek görselin biçim/boyut kontrolü; uygunsa null, değilse kullanıcıya gösterilecek mesaj. */
export function imageProblem(file: File) {
  if (!uploadTypes.includes(file.type)) return t.media.wrongType;
  if (file.size > maxUploadBytes) return t.media.tooLarge((file.size / 1024 / 1024).toFixed(1), maxUploadBytes / 1024 / 1024);
  return null;
}

/** Dosya adından okunur bir başlık önerir ("ekip-toplanti_2024.jpg" → "ekip toplanti 2024"). */
export const titleFromFile = (file: File) => file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();

/**
 * Sürükle-bırak veya tıklayarak görsel seçme alanı. `name` verilirse seçilen dosya form gönderiminde o adla yer alır
 * (sürükle-bırakla gelen dosya da gizli girdiye aktarılır). JPEG/PNG/WebP seçilince "Kırp / yaklaştır" ile düzenlenebilir;
 * her düzenleme ilk seçilen orijinal dosyadan başlar, böylece tekrar kırpınca kalite düşmez.
 */
export default function ImageDropzone({ file, onFile, name, required, className }: { file: File | null; onFile: (file: File) => void; name?: string; required?: boolean; className?: string }) {
  const [dragging, setDragging] = useState(false);
  const [problem, setProblem] = useState("");
  const [original, setOriginal] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function commit(next: File) {
    if (input.current && input.current.files?.[0] !== next) { const transfer = new DataTransfer(); transfer.items.add(next); input.current.files = transfer.files; }
    onFile(next);
  }

  function choose(next: File | undefined) {
    if (!next) return;
    const issue = imageProblem(next);
    setProblem(issue ?? "");
    if (issue) return;
    setOriginal(next);
    commit(next);
  }

  function drop(event: DragEvent) { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]); }

  return <div className={cn("space-y-1.5", className)}>
    <label onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}
      className={cn("relative flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed p-4 text-center transition-colors", dragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/40")}>
      <input ref={input} type="file" name={name} accept={uploadTypes.join(",")} required={required} className="sr-only" onChange={(event) => choose(event.target.files?.[0])}/>
      {preview ? <img src={preview} alt="" className="max-h-40 rounded-md object-contain"/> : <>
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><ImageUp className="size-5"/></div>
        <p className="text-sm font-medium">{t.media.dropHint}</p>
        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP veya SVG · en fazla {maxUploadBytes / 1024 / 1024} MB</p>
      </>}
      {file && <p className="text-xs text-muted-foreground">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
    </label>
    {problem && <p role="alert" className="text-sm text-destructive">{problem}</p>}
    {file && original && croppable(original) && <>
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setEditing(true)}><Crop/>{file === original ? t.media.cropZoom : t.media.editAgain}</Button>
      <CropDialog file={original} open={editing} onOpenChange={setEditing} onConfirm={(cropped) => { commit(cropped); setEditing(false); }}/>
    </>}
  </div>;
}
