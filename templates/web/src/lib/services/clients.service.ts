import { getServerClient } from "@/lib/supabase/server";

export class ClientService {
  private static table = "clients";

  static async getAll() {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .order("name");

    if (error) {
      console.error(`Error fetching ${this.table}:`, error);
      return [];
    }

    return data;
  }
}
