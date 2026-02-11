import { getServerClient } from "@/lib/supabase/server";

export class UserService {
  private static table = "users";

  static async getAll() {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching ${this.table}:`, error);
      return [];
    }

    return data;
  }
}
