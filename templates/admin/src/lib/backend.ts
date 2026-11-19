/**
 * Panelin veri kaynağı. CLI `--cms contentful` seçilince bu dosya Contentful modülünün sürümüyle değişir.
 *
 *   images   "cloudinary": görsel formda Cloudinary'ye yüklenir, adresi kayda yazılır (medya sayfası yok)
 *            "assets":     görseller CMS'in medya kütüphanesinde, formda kütüphaneden seçilir (/assets)
 *   drafts   Yayındaki kaydın düzenlemesi ayrı bir taslak olarak tutuluyor mu ("Değişiklik var" durumu).
 */
export type Backend = { name: "supabase" | "contentful"; label: string; images: "cloudinary" | "assets"; drafts: boolean };

export const backend: Backend = {
  name: "supabase",
  label: "Supabase",
  images: "cloudinary",
  drafts: false,
};
