import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getPage } from "@/lib/content/service";

/** Admin'deki "Sayfalar" (Hakkımızda, Gizlilik …): /<slug>. Sabit rotalar (blog, contact) önce eşleşir. */
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  return page ? { title: page.title } : {};
}

export default async function ContentPage({ params }: Props) {
  const page = await getPage((await params).slug);
  if (!page) notFound();
  return <main className="mx-auto max-w-3xl px-6 py-16">
    <h1 className="mb-10 text-4xl font-bold tracking-tight text-slate-900">{page.title}</h1>
    <Markdown>{page.body}</Markdown>
  </main>;
}
