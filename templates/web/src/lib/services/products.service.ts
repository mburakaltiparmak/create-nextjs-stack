import { getAdminClient } from "@/lib/supabase/server";

export class ProductService {
  private static table = "products";

  static async getAll() {
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*, categories(title, slug)")
      .eq("published", true)
      .order("created_at", { ascending: false });

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
      .select("*, categories(title, slug)")
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
