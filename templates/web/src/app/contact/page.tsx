import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <main className="mx-auto max-w-2xl px-6 py-16">
    <h1 className="text-4xl font-bold tracking-tight text-slate-900">Contact</h1>
    <p className="mt-4 text-slate-600">Send us a message — we usually reply within one business day.</p>
    <ContactForm/>
  </main>;
}
