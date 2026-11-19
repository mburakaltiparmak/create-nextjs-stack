"use server";

import { t } from "@/lib/i18n";
import { redirect } from "next/navigation";
import { UserError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { adminEmails, supabaseAuth } from "@/lib/supabase-auth";

export type LoginState = { error?: string } | null;

/** Supabase Auth e-posta/şifre girişi; yalnız ADMIN_EMAILS listesindeki kullanıcılar panele girer. */
export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  try {
    enforceRateLimit("auth.login", email || "unknown");
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    throw error;
  }
  const supabase = await supabaseAuth();
  const { error } = await supabase.auth.signInWithPassword({ email, password: String(formData.get("password") || "") });
  if (error) return { error: t.auth.invalidCredentials };
  if (!adminEmails().includes(email)) {
    await supabase.auth.signOut();
    return { error: t.auth.noAccess };
  }
  redirect("/dashboard");
}

export async function logout() {
  await (await supabaseAuth()).auth.signOut();
  redirect("/login");
}
