"use client";

import { t } from "@/lib/i18n";
import { LoaderCircle, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cropImageFile } from "@/lib/crop";
import { maxUploadBytes } from "@/lib/uploads";
import { cn } from "@/lib/utils";

const ratios = [
  { label: t.crop.free, value: undefined },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
] as const;

type CropDialogProps = {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Promise dönerse kaydedilene kadar pencere "Kaydediliyor…" durumunda kalır. */
  onConfirm: (file: File) => void | Promise<void>;
  onSkip?: () => void;
  confirmLabel?: string;
  /** İkinci kaydetme seçeneği (ör. kütüphanede "Kopya olarak kaydet"). */
  secondary?: { label: string; onConfirm: (file: File) => void | Promise<void> };
};

/**
 * Yüklemeden önce görseli düzenler: yaklaştırma, kırpma (oran seçimiyle) ve 90° döndürme.
 * `onSkip` verilirse "Düzenlemeden kullan" düğmesi görünür (ör. seçer seçmez yüklenen alanlarda).
 */
export default function CropDialog(props: CropDialogProps) {
  const [working, setWorking] = useState(false);
  const { file, open, onOpenChange } = props;
  return <Dialog open={open} onOpenChange={(next) => { if (!working) onOpenChange(next); }}>
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{t.crop.title}</DialogTitle>
        <DialogDescription>{t.crop.description}</DialogDescription>
      </DialogHeader>
      {/* Her yeni dosyada düzenleyici yeniden kurulur; yakınlaştırma, oran ve döndürme sıfırdan başlar. */}
      {file && <CropEditor key={`${file.name}:${file.size}:${file.lastModified}`} {...props} file={file} working={working} setWorking={setWorking}/>}
    </DialogContent>
  </Dialog>;
}

function CropEditor({ file, onOpenChange, onConfirm, onSkip, confirmLabel = t.crop.apply, secondary, working, setWorking }: CropDialogProps & { file: File; working: boolean; setWorking: (value: boolean) => void }) {
  const source = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(source), [source]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [natural, setNatural] = useState<number>(4 / 3);
  const [area, setArea] = useState<Area | null>(null);

  async function apply(handler: (file: File) => void | Promise<void> = onConfirm) {
    if (!area) return;
    setWorking(true);
    try {
      const result = await cropImageFile(file, area, rotation);
      if (result.size > maxUploadBytes) throw new Error(t.crop.tooLarge((result.size / 1024 / 1024).toFixed(1), maxUploadBytes / 1024 / 1024));
      await handler(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.crop.editFailed);
    } finally {
      setWorking(false);
    }
  }

  const turn = (degrees: number) => setRotation((value) => (value + degrees + 360) % 360);
  // Serbest modda kırpma alanı görselin kendi oranıyla başlar (döndürülünce en/boy yer değiştirir).
  const activeAspect = aspect ?? (rotation % 180 === 0 ? natural : 1 / natural);

  return <>
    <div className="relative h-[min(55vh,24rem)] overflow-hidden rounded-lg bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px]">
      <Cropper image={source} crop={crop} zoom={zoom} rotation={rotation} aspect={activeAspect} minZoom={1} maxZoom={5} zoomSpeed={0.2} restrictPosition
        onCropChange={setCrop} onZoomChange={setZoom} onRotationChange={setRotation} onCropComplete={(_, pixels) => setArea(pixels)}
        onMediaLoaded={(media) => setNatural(media.naturalWidth / media.naturalHeight)}/>
    </div>
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t.crop.zoomOut} disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, +(value - 0.25).toFixed(2)))}><ZoomOut/></Button>
        <input type="range" min={1} max={5} step={0.01} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label={t.crop.zoom} className="h-1.5 flex-1 cursor-pointer accent-primary"/>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t.crop.zoomIn} disabled={zoom >= 5} onClick={() => setZoom((value) => Math.min(5, +(value + 0.25).toFixed(2)))}><ZoomIn/></Button>
        <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">%{Math.round(zoom * 100)}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-muted-foreground">{t.crop.ratio}</span>
        {ratios.map((ratio) => <Button key={ratio.label} type="button" size="sm" variant={aspect === ratio.value ? "secondary" : "ghost"} aria-pressed={aspect === ratio.value}
          className={cn(aspect === ratio.value && "ring-1 ring-border")} onClick={() => setAspect(ratio.value)}>{ratio.label}</Button>)}
        <span className="ml-auto flex gap-1">
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t.crop.rotateLeft} onClick={() => turn(-90)}><RotateCcw/></Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t.crop.rotateRight} onClick={() => turn(90)}><RotateCw/></Button>
        </span>
      </div>
    </div>
    <DialogFooter className="gap-2">
      {onSkip && <Button type="button" variant="ghost" className="sm:mr-auto" disabled={working} onClick={onSkip}>{t.crop.skip}</Button>}
      <Button type="button" variant="outline" disabled={working} onClick={() => onOpenChange(false)}>{t.common.cancel}</Button>
      {secondary && <Button type="button" variant="outline" disabled={!area || working} onClick={() => apply(secondary.onConfirm)}>{secondary.label}</Button>}
      <Button type="button" disabled={!area || working} onClick={() => apply()}>{working ? <><LoaderCircle className="animate-spin"/>{t.form.saving}</> : confirmLabel}</Button>
    </DialogFooter>
  </>;
}
