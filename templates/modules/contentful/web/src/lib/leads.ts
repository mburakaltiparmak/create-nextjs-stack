import "server-only";
import { randomUUID } from "node:crypto";
import type { ContactInput } from "@/lib/validation/contact";

/**
 * İletişim formu talepleri — Contentful sürümü: her gönderim yayınlanmayan bir `lead` kaydı olur (admin → Talepler).
 * Delivery API talepleri hiç döndürmez. CONTENTFUL_LEAD_MANAGEMENT_TOKEN tercihen yalnız `lead` kayıtlarını
 * oluşturup düzenleyebilen bir rolün token'ıdır (sitedeki tek yönetim jetonu); yoksa CONTENTFUL_MANAGEMENT_TOKEN.
 */
export type NotificationStatus = "pending" | "sent" | "failed" | "skipped";
export type LeadRecord = { sys: { id: string; version: number }; fields: Record<string, Record<string, unknown>> };

const LOCALE = process.env.CONTENTFUL_LOCALE?.trim() || "en-US";
const local = (value: unknown) => ({ [LOCALE]: value });
const spaceId = () => process.env.CONTENTFUL_SPACE_ID?.trim();
const token = () => (process.env.CONTENTFUL_LEAD_MANAGEMENT_TOKEN || process.env.CONTENTFUL_MANAGEMENT_TOKEN)?.trim();

export function isLeadStoreConfigured() {
  const space = spaceId();
  const key = token();
  return Boolean(space && !space.startsWith("your") && key && !key.startsWith("your"));
}

async function management(path: string, init: RequestInit = {}) {
  const environment = process.env.CONTENTFUL_ENVIRONMENT?.trim() || "master";
  return fetch(`https://api.contentful.com/spaces/${spaceId()}/environments/${environment}${path}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${token()}`, "content-type": "application/vnd.contentful.management.v1+json", ...(init.headers || {}) },
  });
}

async function parse(response: Response) {
  if (!response.ok) throw new Error(`Contentful ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return (await response.json()) as LeadRecord;
}

/** Taslak `lead` kaydını oluşturur (ID: lead-<uuid>; admin bu biçimi bekler). */
export async function saveLeadRecord(data: ContactInput) {
  const id = randomUUID();
  const optional = (key: string, value?: string) => (value ? { [key]: local(value) } : {});
  const fields = {
    submission_id: local(id), name: local(data.name), ...optional("company", data.company), email: local(data.email), ...optional("phone", data.phone),
    ...optional("subject", data.subject), message: local(data.message), locale: local(data.locale), consent: local(data.privacy === true),
    submitted_at: local(new Date().toISOString()), status: local("new"), notification_status: local("pending"),
  };
  return parse(await management(`/entries/lead-${id}`, { method: "PUT", headers: { "x-contentful-content-type": "lead" }, body: JSON.stringify({ fields }) }));
}

export async function setNotificationStatus(record: LeadRecord, status: NotificationStatus) {
  const fields = { ...record.fields, notification_status: local(status) };
  await parse(await management(`/entries/${record.sys.id}`, { method: "PUT", headers: { "x-contentful-version": String(record.sys.version) }, body: JSON.stringify({ fields }) }));
}
