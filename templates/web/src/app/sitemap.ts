import type { MetadataRoute } from "next";
import { getPages, getPosts } from "@/lib/content/service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const [posts, pages] = await Promise.all([getPosts(), getPages()]);
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.5 },
    ...pages.map((page) => ({ url: `${base}/${page.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.publishedOn ?? undefined, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
