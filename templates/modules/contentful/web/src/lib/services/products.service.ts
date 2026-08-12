import { queryEntries, withCache } from "@/lib/contentful/client";
import {
  CACHE_TAGS,
  CACHE_TIMES,
  CONTENT_TYPES,
  DEFAULT_INCLUDE_DEPTH,
  MAX_ENTRIES_PER_REQUEST,
} from "@/lib/contentful/constants";
import { flattenEntries, flattenEntry, normalizeReference } from "@/lib/contentful/mappers";
import { isPreviewEnabled } from "@/lib/contentful/preview";

export class ProductService {
  private static contentType = CONTENT_TYPES.PRODUCTS;

  static async getAll(preview?: boolean) {
    const isPreview = preview ?? (await isPreviewEnabled());

    const fetcher = async () => {
      const items = await queryEntries(
        {
          content_type: this.contentType,
          "fields.published": true,
          include: DEFAULT_INCLUDE_DEPTH,
          order: ["-sys.createdAt"],
          limit: MAX_ENTRIES_PER_REQUEST,
        },
        isPreview,
      );

      return flattenEntries(items).map((row) =>
        normalizeReference(row, "category_id", "categories"),
      );
    };

    try {
      return await withCache(
        fetcher,
        ["contentful", this.contentType, "all"],
        { tags: [CACHE_TAGS.PRODUCTS], revalidate: CACHE_TIMES.PRODUCTS },
        isPreview,
      );
    } catch (error) {
      console.error(`Error fetching ${this.contentType}:`, error);
      return [];
    }
  }

  static async getBySlug(slug: string, preview?: boolean) {
    const isPreview = preview ?? (await isPreviewEnabled());

    const fetcher = async () => {
      const items = await queryEntries(
        {
          content_type: this.contentType,
          "fields.slug": slug,
          "fields.published": true,
          include: DEFAULT_INCLUDE_DEPTH,
          limit: 1,
        },
        isPreview,
      );

      if (!items.length) return null;

      return normalizeReference(flattenEntry(items[0]), "category_id", "categories");
    };

    try {
      return await withCache(
        fetcher,
        ["contentful", this.contentType, "slug", slug],
        { tags: [CACHE_TAGS.PRODUCTS], revalidate: CACHE_TIMES.PRODUCTS },
        isPreview,
      );
    } catch (error) {
      console.error(`Error fetching ${this.contentType} ${slug}:`, error);
      return null;
    }
  }
}
