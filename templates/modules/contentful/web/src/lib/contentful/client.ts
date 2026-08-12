import { createClient, type ContentfulClientApi } from 'contentful';
import { unstable_cache } from 'next/cache';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master';
const DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_TOKEN;

let deliveryClient: ContentfulClientApi<undefined> | null = null;
let previewClient: ContentfulClientApi<undefined> | null = null;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[Contentful] Missing environment variable: ${name}. Check your .env file.`,
    );
  }
  return value;
}

/**
 * Delivery API — yayınlanmış içerik. Production okumalarının tamamı buradan geçer.
 */
export function getDeliveryClient(): ContentfulClientApi<undefined> {
  if (!deliveryClient) {
    deliveryClient = createClient({
      space: requireEnv('CONTENTFUL_SPACE_ID', SPACE_ID),
      accessToken: requireEnv('CONTENTFUL_DELIVERY_TOKEN', DELIVERY_TOKEN),
      environment: ENVIRONMENT,
    });
  }
  return deliveryClient;
}

/**
 * Preview API — taslak (unpublished) içerik. Sadece draft mode açıkken kullanılır.
 */
export function getPreviewClient(): ContentfulClientApi<undefined> {
  if (!previewClient) {
    previewClient = createClient({
      space: requireEnv('CONTENTFUL_SPACE_ID', SPACE_ID),
      accessToken: requireEnv('CONTENTFUL_PREVIEW_TOKEN', PREVIEW_TOKEN),
      environment: ENVIRONMENT,
      host: 'preview.contentful.com',
    });
  }
  return previewClient;
}

export function getContentfulClient(preview = false): ContentfulClientApi<undefined> {
  return preview ? getPreviewClient() : getDeliveryClient();
}

/**
 * Contentful'ın sorgu tipleri content type başına generic bir "skeleton" ister.
 * Bu template jenerik bir servis katmanı kullandığı için sorguları tek noktada
 * gevşek tipliyoruz — cast'in başka yere sızmaması için burada tutuluyor.
 */
export async function queryEntries(
  query: Record<string, unknown>,
  preview = false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const client = getContentfulClient(preview);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await client.getEntries(query as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return response.items as any[];
}

/**
 * Contentful SDK Next.js'in fetch cache'ini kullanmadığı için sonuçları
 * `unstable_cache` ile etiketliyoruz. Etiketler `/api/revalidate/contentful`
 * webhook'u tarafından `revalidateTag` ile geçersiz kılınır.
 *
 * Draft mode açıkken cache tamamen atlanır — taslak içerik önbelleğe girmemeli.
 */
export function withCache<T>(
  fetcher: () => Promise<T>,
  keyParts: string[],
  options: { tags: string[]; revalidate: number },
  preview = false,
): Promise<T> {
  if (preview) return fetcher();

  return unstable_cache(fetcher, keyParts, {
    tags: options.tags,
    revalidate: options.revalidate,
  })();
}
