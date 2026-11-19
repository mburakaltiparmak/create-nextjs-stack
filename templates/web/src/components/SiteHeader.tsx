import Link from "next/link";
import { getPages } from "@/lib/content/service";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "My Site";

/** Üst menü: blog, iletişim ve admin'deki sayfalar (menü sırasına göre). */
export default async function SiteHeader() {
  const pages = await getPages();
  return <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
    <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4 text-sm">
      <Link href="/" className="mr-auto text-base font-semibold text-slate-900">{siteName}</Link>
      <Link href="/blog" className="text-slate-600 hover:text-slate-900">Blog</Link>
      {pages.slice(0, 4).map((page) => <Link key={page.id} href={`/${page.slug}`} className="text-slate-600 hover:text-slate-900">{page.title}</Link>)}
      <Link href="/contact" className="rounded-full bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-700">Contact</Link>
    </nav>
  </header>;
}
