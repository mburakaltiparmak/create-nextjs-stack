import { getServerClient } from "@/lib/supabase/server";

export class ProjectService {
  private static table = "projects";

  static async getAll() {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*, clients(name, logo_url)")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching ${this.table}:`, error);
      return [];
    }

    return data;
  }

  static async getBySlug(slug: string) {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*, clients(name, logo_url)")
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
