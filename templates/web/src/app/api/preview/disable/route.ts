import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/** Draft mode'u kapatır ve ana sayfaya döner. */
export async function GET(request: Request) {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL("/", request.url));
}
