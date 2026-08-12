import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { timingSafeEqual } from 'crypto';

/**
 * Contentful webhook alıcısı.
 *
 * Contentful → Settings → Webhooks → Add Webhook
 *   URL      : https://<site>/api/revalidate/contentful
 *   Triggers : Entry publish / unpublish / delete
 *   Headers  : x-contentful-webhook-secret = <CONTENTFUL_WEBHOOK_SECRET>
 *   Payload  : Default (customize payload KAPALI)
 *
 * Genel amaçlı `/api/revalidate` rotası (secret + tag/path gövdesi) olduğu gibi
 * duruyor; bu rota sadece Contentful'ın kendi payload'ını konuşur.
 */

function secretsMatch(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  // timingSafeEqual eşit uzunluk ister; farklı uzunluk zaten eşleşmez.
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

/** Contentful alanları locale ile anahtarlanır: { slug: { "en-US": "foo" } } */
function firstLocaleValue(field: unknown): string | null {
  if (!field || typeof field !== 'object') return null;
  const values = Object.values(field as Record<string, unknown>);
  const first = values[0];
  return typeof first === 'string' ? first : null;
}

export async function POST(request: NextRequest) {
  const provided =
    request.headers.get('x-contentful-webhook-secret') ??
    request.nextUrl.searchParams.get('secret');

  if (!secretsMatch(provided, process.env.CONTENTFUL_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid or missing secret' }, { status: 401 });
  }

  try {
    const payload = await request.json();

    const contentType: string | undefined = payload?.sys?.contentType?.sys?.id;
    const topic = request.headers.get('x-contentful-topic') ?? 'unknown';

    if (!contentType) {
      return NextResponse.json(
        { error: 'Payload has no sys.contentType.sys.id' },
        { status: 400 },
      );
    }

    const revalidated: string[] = [];

    // Content type ID'leri cache tag'leriyle birebir aynı (products, projects, ...).
    revalidateTag(contentType, 'everything');
    revalidated.push(`tag:${contentType}`);

    // Detay sayfası varsa onu da tazele.
    const slug = firstLocaleValue(payload?.fields?.slug);
    if (slug) {
      revalidatePath(`/${contentType}/${slug}`);
      revalidated.push(`path:/${contentType}/${slug}`);
    }

    // Listeleme ve ana sayfa da bu içeriği gösteriyor olabilir.
    revalidatePath(`/${contentType}`);
    revalidatePath('/');
    revalidated.push(`path:/${contentType}`, 'path:/');

    return NextResponse.json({
      revalidated: true,
      topic,
      contentType,
      items: revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Contentful Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Error revalidating', message: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Contentful revalidation webhook is running',
    usage: 'POST from a Contentful webhook with header x-contentful-webhook-secret',
  });
}
