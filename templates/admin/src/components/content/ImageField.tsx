"use client";

import CloudinaryImage from "@/components/content/CloudinaryImage";
import type { ImageOption } from "@/lib/media";

/**
 * İçerik formundaki görsel alanı — Supabase sürümü: Cloudinary'ye yükle veya adres yapıştır.
 * Contentful modülü bu dosyayı medya kütüphanesinden seçen sürümle (AssetPicker) değiştirir.
 */
export default function ImageField({ name, siteKey, siteUrl, defaultValue }: { name: string; siteKey: string; siteUrl: string; defaultValue: string; options: ImageOption[] }) {
  return <CloudinaryImage name={name} siteKey={siteKey} siteUrl={siteUrl} defaultValue={defaultValue}/>;
}
