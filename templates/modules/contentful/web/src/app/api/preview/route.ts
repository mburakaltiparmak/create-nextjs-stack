import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

/**
 * Draft mode'u açar ve hedef sayfaya yönlendirir.
 *
 * Contentful → Settings → Content preview → Add content preview
 *   URL: https://<site>/api/preview?secret=<CONTENTFUL_PREVIEW_SECRET>&slug=/products/{entry.fields.slug}
 *
 * Draft mode açıkken servisler Preview API'ye düşer ve cache'i atlar.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '/';

  if (!process.env.CONTENTFUL_PREVIEW_SECRET) {
    return NextResponse.json(
      { error: 'CONTENTFUL_PREVIEW_SECRET is not configured' },
      { status: 500 },
    );
  }

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Açık yönlendirme (open redirect) engeli — sadece site içi yollar.
  if (!slug.startsWith('/') || slug.startsWith('//')) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(slug, request.nextUrl.origin));
}
