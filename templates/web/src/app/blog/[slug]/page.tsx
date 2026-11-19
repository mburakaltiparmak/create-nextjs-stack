import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { formatDate } from "@/components/PostCard";
import { getPost } from "@/lib/content/service";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt ?? undefined, openGraph: post.coverImage ? { images: [post.coverImage] } : undefined } : {};
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return <main className="mx-auto max-w-3xl px-6 py-16">
    {formatDate(post.publishedOn) && <p className="text-sm text-slate-500">{formatDate(post.publishedOn)}</p>}
    <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{post.title}</h1>
    {post.excerpt && <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>}
    {post.coverImage && (
      // eslint-disable-next-line @next/next/no-img-element -- görsel adresi veri kaynağından gelir
      <img src={post.coverImage} alt="" className="mt-10 aspect-[16/9] w-full rounded-xl object-cover"/>
    )}
    <div className="mt-10"><Markdown>{post.body}</Markdown></div>
  </main>;
}
