import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

/** Draft mode'u kapatır ve ana sayfaya (veya ?slug= ile verilen yola) döner. */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug') || '/';
  const safeSlug = slug.startsWith('/') && !slug.startsWith('//') ? slug : '/';

  const draft = await draftMode();
  draft.disable();

  return NextResponse.redirect(new URL(safeSlug, request.nextUrl.origin));
}
