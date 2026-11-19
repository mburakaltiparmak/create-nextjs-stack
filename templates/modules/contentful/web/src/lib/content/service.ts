import "server-only";
import { draftMode } from "next/headers";
import { queryEntries, withCache } from "@/lib/contentful/client";
import { flattenEntries } from "@/lib/contentful/mappers";
import { CACHE_SECONDS, CONTENT_TAGS, type Page, type Post } from "./types";

/**
 * İçerik servisi — Contentful sürümü (Delivery API; draft mode açıkken Preview API). Sonuçlar içerik tipi
 * etiketiyle önbelleğe alınır; Contentful webhook'u (/api/revalidate/contentful) yayında etiketi tazeler.
 * Contentful yapılandırılmamışsa listeler boş döner.
 */

type Row = Record<string, unknown>;
const text = (value: unknown) => (typeof value === "string" && value ? value : null);

const toPost = (row: Row): Post => ({
  id: String(row.id), title: String(row.title ?? ""), slug: String(row.slug ?? ""), excerpt: text(row.excerpt), body: text(row.body),
  coverImage: text(row.cover_image), publishedOn: text(row.published_on) ?? text(row.created_at)?.slice(0, 10) ?? null,
});
const toPage = (row: Row): Page => ({ id: String(row.id), title: String(row.title ?? ""), slug: String(row.slug ?? ""), body: text(row.body), order: typeof row.order === "number" ? row.order : null });

export function isContentfulConfigured() {
  return [process.env.CONTENTFUL_SPACE_ID, process.env.CONTENTFUL_DELIVERY_TOKEN].every((value) => value && !value.startsWith("your"));
}

async function isPreview() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

async function entries(contentType: string, query: Record<string, unknown>, key: string[]): Promise<Row[]> {
  if (!isContentfulConfigured()) return [];
  const preview = await isPreview();
  try {
    return await withCache(
      async () => flattenEntries(await queryEntries({ content_type: contentType, include: 1, limit: 1000, ...query }, preview)) as Row[],
      ["contentful", ...key],
      { tags: [contentType], revalidate: CACHE_SECONDS },
      preview,
    );
  } catch (error) {
    console.error(`[content] ${contentType}:`, error);
    return [];
  }
}

export async function getPosts() {
  return (await entries(CONTENT_TAGS.posts, { order: ["-fields.published_on", "-sys.createdAt"] }, ["posts", "all"])).map(toPost);
}

export async function getPages() {
  return (await entries(CONTENT_TAGS.pages, { order: ["fields.order", "fields.title"] }, ["pages", "all"])).map(toPage);
}

export async function getPost(slug: string) {
  return (await entries(CONTENT_TAGS.posts, { "fields.slug": slug, limit: 1 }, ["posts", slug])).map(toPost)[0] ?? null;
}

export async function getPage(slug: string) {
  return (await entries(CONTENT_TAGS.pages, { "fields.slug": slug, limit: 1 }, ["pages", slug])).map(toPage)[0] ?? null;
}
