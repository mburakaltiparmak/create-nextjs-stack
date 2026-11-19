import Link from "next/link";
import type { Post } from "@/lib/content/types";

export function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
}

export default function PostCard({ post }: { post: Post }) {
  return <article className="group">
    <Link href={`/blog/${post.slug}`} className="block space-y-3">
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element -- görsel adresi veri kaynağından gelir (Cloudinary / Contentful)
        <img src={post.coverImage} alt="" className="aspect-[16/9] w-full rounded-xl object-cover"/>
      )}
      {formatDate(post.publishedOn) && <p className="text-xs text-slate-500">{formatDate(post.publishedOn)}</p>}
      <h3 className="text-lg font-semibold text-slate-900 group-hover:underline">{post.title}</h3>
      {post.excerpt && <p className="text-sm leading-relaxed text-slate-600">{post.excerpt}</p>}
    </Link>
  </article>;
}
