import { queryEntries, withCache } from "@/lib/contentful/client";
import {
  CACHE_TAGS,
  CACHE_TIMES,
  CONTENT_TYPES,
  MAX_ENTRIES_PER_REQUEST,
} from "@/lib/contentful/constants";
import { flattenEntries } from "@/lib/contentful/mappers";
import { isPreviewEnabled } from "@/lib/contentful/preview";

export class ClientService {
  private static contentType = CONTENT_TYPES.CLIENTS;

  static async getAll(preview?: boolean) {
    const isPreview = preview ?? (await isPreviewEnabled());

    const fetcher = async () => {
      const items = await queryEntries(
        {
          content_type: this.contentType,
          order: ["fields.name"],
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
        { tags: [CACHE_TAGS.CLIENTS], revalidate: CACHE_TIMES.CLIENTS },
        isPreview,
      );
    } catch (error) {
      console.error(`Error fetching ${this.contentType}:`, error);
      return [];
    }
  }
}
