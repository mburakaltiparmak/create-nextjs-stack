import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getLeadRetention, purgeExpiredLeads } from "@/lib/leads";

export const maxDuration = 300;

function authorized(header: string | null) {
  if (!env.cronSecret || env.cronSecret.length < 32 || !header) return false;
  const expected = Buffer.from(`Bearer ${env.cronSecret}`);
  const received = Buffer.from(header);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function log(event: Record<string, unknown>) {
  process.stdout.write(`${JSON.stringify({ actorId: "system:cron", action: "lead.retention.purge", resourceType: "lead", ...event, at: new Date().toISOString() })}\n`);
}

/** Vercel Cron günlük olarak çağırır; saklama süresi tanımlıysa süresi dolan talepleri siler. */
export async function GET(request: Request) {
  if (!authorized(request.headers.get("authorization"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { days } = await getLeadRetention();
    if (!days) return NextResponse.json({ skipped: true });
    const { deleted, cutoff } = await purgeExpiredLeads(days);
    log({ resourceId: "all", result: "success", metadata: { days, deleted, cutoff } });
    return NextResponse.json({ deleted });
  } catch (cause) {
    log({ resourceId: "all", result: "failure", error: cause instanceof Error ? cause.message.slice(0, 300) : "unknown" });
    return NextResponse.json({ error: true }, { status: 500 });
  }
}
