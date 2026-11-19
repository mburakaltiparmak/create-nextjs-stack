import { FileText, Newspaper } from "lucide-react";
import { markdownHelp, type SiteModel } from "../content-model";
import { t } from "../i18n";

/**
 * Sitenin içerik modeli. Formlar, doğrulama, listeler ve depolama alan eşlemesi buradan üretilir.
 * Alan ID'leri veri kaynağındaki sütun/alan adlarıyla birebir aynıdır (supabase/schema.sql veya
 * contentful/migrations/). Yeni bir içerik tipi için: önce şemaya/migration'a ekleyin, sonra buraya.
 *
 * Çok dilli içerik: alana `localized: true` verin ve `locales`'e dilleri ekleyin. Her dil ayrı bir sütun/alandır
 * (`fieldKey`: title → title_de); yalnız ana dil zorunludur, boş çeviriler sitede ana dile düşer.
 */
export const siteModel: SiteModel = {
  locales: ["en"],
  primaryLocale: "en",
  localeLabels: { en: "English" },
  fieldKey: (id, locale) => (locale === "en" ? id : `${id}_${locale}`),
  // web/src/app altındaki sabit rotalar; sayfa adresleri (/<slug>) bunlarla çakışamaz.
  reservedSlugs: ["blog", "contact", "api", "admin", "sitemap", "robots"],
  types: [
    {
      id: "posts",
      label: t.model.post,
      plural: t.model.posts,
      icon: Newspaper,
      hint: t.model.postsHint,
      titleField: "title",
      fields: [
        { id: "title", label: t.model.title, kind: "text", required: true, max: 160 },
        { id: "slug", label: t.model.slug, kind: "slug", required: true, help: t.model.postSlugHelp },
        { id: "excerpt", label: t.model.excerpt, kind: "textarea", max: 600, rows: 3, help: t.model.excerptHelp },
        { id: "body", label: t.model.body, kind: "markdown", max: 50_000, rows: 16, help: markdownHelp },
        { id: "cover_image", label: t.model.cover, kind: "image" },
        { id: "published_on", label: t.model.publishedOn, kind: "date", help: t.model.publishedOnHelp },
      ],
      path: ({ slug }) => (slug ? `/blog/${slug}` : "/blog"),
    },
    {
      id: "pages",
      label: t.model.page,
      plural: t.model.pages,
      icon: FileText,
      hint: t.model.pagesHint,
      titleField: "title",
      fields: [
        { id: "title", label: t.model.title, kind: "text", required: true, max: 160 },
        { id: "slug", label: t.model.slug, kind: "slug", required: true, help: t.model.pageSlugHelp },
        { id: "body", label: t.model.body, kind: "markdown", max: 50_000, rows: 16, help: markdownHelp },
        { id: "order", label: t.model.order, kind: "number", help: t.model.orderHelp },
      ],
      path: ({ slug }) => (slug ? `/${slug}` : "/"),
    },
  ],
};
