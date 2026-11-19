/**
 * Panelin veri kaynağı: Contentful. Görseller Contentful medya kütüphanesinde (/assets); yayındaki kaydın
 * düzenlemesi ayrı bir taslak olarak tutulur ("Değişiklik var").
 */
export type Backend = { name: "supabase" | "contentful"; label: string; images: "cloudinary" | "assets"; drafts: boolean };

export const backend: Backend = {
  name: "contentful",
  label: "Contentful",
  images: "assets",
  drafts: true,
};
