import { getAdminClient } from "@/lib/supabase/server";

export class CategoryService {
  private static table = "categories";

  static async getAll() {
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .eq("published", true)
      .order("title");

    if (error) {
      console.error(`Error fetching ${this.table}:`, error);
      return [];
    }

    return data;
  }

  static async getBySlug(slug: string) {
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error) {
      console.error(`Error fetching ${this.table} ${slug}:`, error);
      return null;
    }

    return data;
  }
}
