import { queryEntries, withCache } from "@/lib/contentful/client";
import {
  CACHE_TAGS,
  CACHE_TIMES,
  CONTENT_TYPES,
  MAX_ENTRIES_PER_REQUEST,
} from "@/lib/contentful/constants";
import { flattenEntries, flattenEntry } from "@/lib/contentful/mappers";
import { isPreviewEnabled } from "@/lib/contentful/preview";

export class CategoryService {
  private static contentType = CONTENT_TYPES.CATEGORIES;

  static async getAll(preview?: boolean) {
    const isPreview = preview ?? (await isPreviewEnabled());

    const fetcher = async () => {
      const items = await queryEntries(
        {
          content_type: this.contentType,
          "fields.published": true,
          order: ["fields.title"],
          limit: MAX_ENTRIES_PER_REQUEST,
        },
        isPreview,
      );

      return flattenEntries(items);
    };

    try {
      return await withCache(
        fetcher,
        ["contentful", this.contentType, "all"],
        { tags: [CACHE_TAGS.CATEGORIES], revalidate: CACHE_TIMES.CATEGORIES },
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
          limit: 1,
        },
        isPreview,
      );

      return items.length ? flattenEntry(items[0]) : null;
    };

    try {
      return await withCache(
        fetcher,
        ["contentful", this.contentType, "slug", slug],
        { tags: [CACHE_TAGS.CATEGORIES], revalidate: CACHE_TIMES.CATEGORIES },
        isPreview,
      );
    } catch (error) {
      console.error(`Error fetching ${this.contentType} ${slug}:`, error);
      return null;
    }
  }
}
