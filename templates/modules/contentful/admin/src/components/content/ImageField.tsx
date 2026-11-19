"use client";

import AssetPicker from "@/components/content/AssetPicker";
import type { ImageOption } from "@/lib/media";

/** İçerik formundaki görsel alanı — Contentful sürümü: medya kütüphanesinden seç veya yükle. */
export default function ImageField({ name, siteKey, defaultValue, options }: { name: string; siteKey: string; siteUrl: string; defaultValue: string; options: ImageOption[] }) {
  return <AssetPicker name={name} siteKey={siteKey} defaultValue={defaultValue} assets={options}/>;
}
