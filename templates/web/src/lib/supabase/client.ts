import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase istemcileri (yalnız sunucuda).
 *   public   anon anahtar — RLS gereği yalnız `published` içerikleri görür
 *   service  service role — önizleme (taslaklar) ve iletişim formu talepleri; asla tarayıcıya gitmez
 */
let publicClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const configured = (value?: string) => Boolean(value && !value.includes("your"));

export function isSupabaseConfigured() {
  return configured(url()) && configured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function supabasePublic() {
  publicClient ??= createClient(url()!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  return publicClient;
}

export function isServiceConfigured() {
  return configured(url()) && configured(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseService() {
  serviceClient ??= createClient(url()!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  return serviceClient;
}
