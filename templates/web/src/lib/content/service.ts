import "server-only";
import { draftMode } from "next/headers";
import { unstable_cache } from "next/cache";
import { isServiceConfigured, isSupabaseConfigured, supabasePublic, supabaseService } from "@/lib/supabase/client";
import { CACHE_SECONDS, CONTENT_TAGS, type Page, type Post } from "./types";

/**
 * İçerik servisi — Supabase sürümü (Contentful modülü bu dosyayı aynı dışa aktarımlarla değiştirir).
 *
 * Yayındaki içerik anon anahtarla okunur ve `unstable_cache` ile etiketlenir (posts / pages); admin yayından
 * sonra /api/revalidate'i çağırıp etiketi tazeler. Draft mode açıkken (admin "Önizle") önbellek atlanır ve
 * taslaklar service role ile okunur. Supabase yapılandırılmamışsa listeler boş döner.
 */

type Row = Record<string, unknown>;
const text = (value: unknown) => (typeof value === "string" && value ? value : null);

const toPost = (row: Row): Post => ({
  id: String(row.id), title: String(row.title ?? ""), slug: String(row.slug ?? ""), excerpt: text(row.excerpt), body: text(row.body),
  coverImage: text(row.cover_image), publishedOn: text(row.published_on) ?? text(row.published_at)?.slice(0, 10) ?? null,
});
const toPage = (row: Row): Page => ({ id: String(row.id), title: String(row.title ?? ""), slug: String(row.slug ?? ""), body: text(row.body), order: typeof row.order === "number" ? row.order : null });

async function isPreview() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

async function rows(table: string, preview: boolean, order: { column: string; ascending: boolean }[], slug?: string): Promise<Row[]> {
  if (!isSupabaseConfigured()) return [];
  const client = preview && isServiceConfigured() ? supabaseService() : supabasePublic();
  let query = client.from(table).select("*");
  if (!preview) query = query.eq("status", "published");
  if (slug) query = query.eq("slug", slug);
  for (const { column, ascending } of order) query = query.order(column, { ascending, nullsFirst: false });
  const { data, error } = await query.limit(slug ? 1 : 500);
  if (error) {
    console.error(`[content] ${table}:`, error.message);
    return [];
  }
  return (data ?? []) as Row[];
}

function cached<T>(fn: (preview: boolean) => Promise<T>, key: string[], tag: string) {
  const live = unstable_cache(() => fn(false), key, { tags: [tag], revalidate: CACHE_SECONDS });
  return async () => ((await isPreview()) ? fn(true) : live());
}

const POST_ORDER = [{ column: "published_on", ascending: false }, { column: "published_at", ascending: false }];

export const getPosts = cached(async (preview) => (await rows("posts", preview, POST_ORDER)).map(toPost), ["posts", "all"], CONTENT_TAGS.posts);
export const getPages = cached(async (preview) => (await rows("pages", preview, [{ column: "order", ascending: true }, { column: "title", ascending: true }])).map(toPage), ["pages", "all"], CONTENT_TAGS.pages);

export async function getPost(slug: string) {
  const preview = await isPreview();
  const load = async (draft: boolean) => (await rows("posts", draft, [], slug)).map(toPost)[0] ?? null;
  return preview ? load(true) : unstable_cache(() => load(false), ["posts", slug], { tags: [CONTENT_TAGS.posts], revalidate: CACHE_SECONDS })();
}

export async function getPage(slug: string) {
  const preview = await isPreview();
  const load = async (draft: boolean) => (await rows("pages", draft, [], slug)).map(toPage)[0] ?? null;
  return preview ? load(true) : unstable_cache(() => load(false), ["pages", slug], { tags: [CONTENT_TAGS.pages], revalidate: CACHE_SECONDS })();
}
