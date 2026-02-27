import { BaseService } from './base.service';
import { getServerClient } from "@/lib/supabase/server";

export class ResourceService extends BaseService {
  constructor(table: string = '') {
    super(table);
  }

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

export const resourceService = new ResourceService();
