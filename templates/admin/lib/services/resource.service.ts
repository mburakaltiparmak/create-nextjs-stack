import { BaseService } from './base.service';
import { getServerClient } from "@/lib/supabase/server";

export class ResourceService extends BaseService {
  constructor(table: string) {
    super(table);
  }

  // Fetch options for relation fields (e.g. categories for products)
  async getRelationOptions(table: string, displayField: string) {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from(table)
      .select(`id, ${displayField}`)
      .order(displayField);

    if (error) throw error;
    return data;
  }
}

export const resourceService = new ResourceService(''); // Placeholder, instantiated per use really, strictly for static methods if needed or we change design.

// Improved design: We don't export a single instance but rather helper functions or the class itself.
// But for FormLayout client-side fetching, we need a server action or API route.
// Let's create a server action for this instead.
