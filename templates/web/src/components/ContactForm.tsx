"use client";

import { useState } from "react";
import { contactSchema } from "@/lib/validation/contact";

type Status = { kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string };

const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

/** İletişim formu: tarayıcıda zod ile doğrular, /api/contact'a gönderir (talep admin → Talepler'e düşer). */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = { ...Object.fromEntries(form), privacy: form.get("privacy") === "on", locale: document.documentElement.lang || "en" };
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) }).catch(() => null);
    if (response?.ok) {
      setStatus({ kind: "sent" });
      event.currentTarget?.reset();
    } else {
      const body = await response?.json().catch(() => null);
      setStatus({ kind: "error", message: body?.error || "Your message could not be sent. Please try again later." });
    }
  }

  if (status.kind === "sent") return <p role="status" className="mt-10 rounded-lg bg-green-50 p-4 text-green-800">Thank you — your message has been sent.</p>;

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => <label className="block text-sm font-medium text-slate-700">
    {label}<input name={name} className={input} aria-invalid={Boolean(errors[name]) || undefined} {...props}/>
    {errors[name] && <span className="mt-1 block text-xs text-red-600">{errors[name]}</span>}
  </label>;

  return <form onSubmit={submit} noValidate className="mt-10 grid gap-5">
    <div className="grid gap-5 sm:grid-cols-2">{field("name", "Name", { autoComplete: "name", required: true })}{field("email", "Email", { type: "email", autoComplete: "email", required: true })}</div>
    <div className="grid gap-5 sm:grid-cols-2">{field("company", "Company (optional)", { autoComplete: "organization" })}{field("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}</div>
    {field("subject", "Subject (optional)")}
    <label className="block text-sm font-medium text-slate-700">Message
      <textarea name="message" rows={6} className={input} aria-invalid={Boolean(errors.message) || undefined}/>
      {errors.message && <span className="mt-1 block text-xs text-red-600">{errors.message}</span>}
    </label>
    {/* Honeypot: ekran okuyuculardan ve kullanıcılardan gizli. */}
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden/>
    <label className="flex items-start gap-2 text-sm text-slate-600">
      <input type="checkbox" name="privacy" className="mt-1"/>
      <span>I agree that my details are stored to answer my enquiry.{errors.privacy && <span className="block text-xs text-red-600">{errors.privacy}</span>}</span>
    </label>
    {status.kind === "error" && <p role="alert" className="text-sm text-red-600">{status.message}</p>}
    <button type="submit" disabled={status.kind === "sending"} className="justify-self-start rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">{status.kind === "sending" ? "Sending…" : "Send message"}</button>
  </form>;
}
