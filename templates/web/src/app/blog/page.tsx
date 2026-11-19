import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/lib/content/service";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await getPosts();
  return <main className="mx-auto max-w-5xl px-6 py-16">
    <h1 className="mb-12 text-4xl font-bold tracking-tight text-slate-900">Blog</h1>
    {posts.length ? <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post}/>)}</div>
      : <p className="text-slate-500">No posts yet.</p>}
  </main>;
}
