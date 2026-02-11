import { SupabaseClient } from "@supabase/supabase-js";
import { getServerClient } from "@/lib/supabase/server";

export class BaseService<T = any> {
  protected table: string;

  constructor(table: string) {
    this.table = table;
  }

  protected async getClient(): Promise<SupabaseClient> {
    return getServerClient();
  }

  async getAll() {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching ${this.table}:`, error);
      throw error;
    }

    return data as T[];
  }

  async getById(id: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching ${this.table} ${id}:`, error);
      throw error;
    }

    return data as T;
  }

  async create(payload: Partial<T>) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.table)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.table}:`, error);
      throw error;
    }

    return data as T;
  }

  async update(id: string, payload: Partial<T>) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.table)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.table} ${id}:`, error);
      throw error;
    }

    return data as T;
  }

  async delete(id: string) {
    const supabase = await this.getClient();
    const { error } = await supabase.from(this.table).delete().eq("id", id);

    if (error) {
      console.error(`Error deleting ${this.table} ${id}:`, error);
      throw error;
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getOptions(displayField: string): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.table)
      .select(`id, ${displayField}`)
      .order(displayField);

    if (error) {
      console.error(`Error fetching options for ${this.table}:`, error);
      return [];
    }

    return data || [];
  }
}
