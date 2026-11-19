import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/lib/content/service";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "My Site";

export default async function Home() {
  const posts = (await getPosts()).slice(0, 3);
  return <main className="mx-auto max-w-5xl px-6">
    <section className="py-24">
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">{siteName}</h1>
      <p className="mt-6 max-w-2xl text-lg text-slate-600">Content on this site is managed in the admin panel. Edit this hero in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">src/app/page.tsx</code>.</p>
      <div className="mt-10 flex gap-3">
        <Link href="/blog" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700">Read the blog</Link>
        <Link href="/contact" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">Get in touch</Link>
      </div>
    </section>
    <section>
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Latest posts</h2>
        <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-slate-900">All posts →</Link>
      </div>
      {posts.length ? <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post}/>)}</div>
        : <p className="text-slate-500">No posts yet — publish one from the admin panel.</p>}
    </section>
  </main>;
}
