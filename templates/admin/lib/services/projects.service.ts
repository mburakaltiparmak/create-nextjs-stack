import { BaseService } from "./base.service";

export class ProjectService extends BaseService {
  constructor() {
    super("projects");
  }

  async getAll() {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*, clients(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching ${this.table}:`, error);
      throw error;
    }

    return data;
  }
}
