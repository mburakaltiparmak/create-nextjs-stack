import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { verifyPreviewToken } from "@/lib/preview-token";

/**
 * Admin panelinin "Önizle" düğmesi: imzalı, 5 dakikalık jetonu doğrular, draft mode'u açar ve sayfaya yönlendirir.
 * PREVIEW_SECRET admin'deki PREVIEW_SECRET ile aynı olmalı. Kapatmak için: /api/preview/disable
 */
export async function GET(request: Request) {
  const secret = process.env.PREVIEW_SECRET?.trim();
  if (!secret) return NextResponse.json({ error: "Preview is not configured (PREVIEW_SECRET)" }, { status: 503 });
  const url = new URL(request.url);
  const payload = verifyPreviewToken(url.searchParams.get("token") || "", secret);
  if (!payload) return NextResponse.json({ error: "Invalid or expired preview token" }, { status: 401 });
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(payload.path, url.origin));
}
