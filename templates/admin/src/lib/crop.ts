import { t } from "@/lib/i18n";
/** Tarayıcıda görsel kırpma/döndürme (canvas). Sunucuya yalnız sonuç dosyası gider. */

export type PixelArea = { x: number; y: number; width: number; height: number };

/** SVG vektördür; canvas'a basılırsa kalite kaybeder, bu yüzden kırpılmaz. */
export const croppable = (file: File) => ["image/jpeg", "image/png", "image/webp"].includes(file.type);

/** Döndürülmüş görselin kapladığı kutu (react-easy-crop'un kırpma alanı bu kutuya göredir). */
export function rotatedSize(width: number, height: number, rotation: number) {
  const radians = (rotation * Math.PI) / 180;
  return {
    width: Math.round(Math.abs(Math.cos(radians) * width) + Math.abs(Math.sin(radians) * height)),
    height: Math.round(Math.abs(Math.sin(radians) * width) + Math.abs(Math.cos(radians) * height)),
  };
}

/** Kırpılmış dosyanın adı: "ofis.jpg" → "ofis-kirpilmis.jpg" (uzantı çıktı biçimine göre). */
export function croppedName(name: string, type: string) {
  const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  return `${name.replace(/\.[^.]+$/, "").replace(/-kirpilmis$/, "")}-kirpilmis.${extension}`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(t.crop.readFailed));
    image.src = src;
  });
}

export async function cropImageFile(file: File, area: PixelArea, rotation = 0): Promise<File> {
  const source = URL.createObjectURL(file);
  try {
    const image = await loadImage(source);
    const box = rotatedSize(image.naturalWidth, image.naturalHeight, rotation);
    // Önce görseli döndürülmüş haliyle tam bir tuvale çiz, sonra kırpma alanını yeni tuvale kopyala.
    const stage = document.createElement("canvas");
    stage.width = box.width;
    stage.height = box.height;
    const stageContext = stage.getContext("2d");
    if (!stageContext) throw new Error(t.crop.unsupported);
    stageContext.translate(box.width / 2, box.height / 2);
    stageContext.rotate((rotation * Math.PI) / 180);
    stageContext.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.round(area.width));
    output.height = Math.max(1, Math.round(area.height));
    const context = output.getContext("2d");
    if (!context) throw new Error(t.crop.unsupported);
    context.drawImage(stage, Math.round(area.x), Math.round(area.y), output.width, output.height, 0, 0, output.width, output.height);

    const type = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => output.toBlob(resolve, type, 0.9));
    if (!blob) throw new Error(t.crop.failed);
    return new File([blob], croppedName(file.name, type), { type, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(source);
  }
}
