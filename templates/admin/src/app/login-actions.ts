"use server";

import { t } from "@/lib/i18n";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { UserError } from "@/lib/errors";

export type LoginState = { error?: string } | null;

/** Credentials girişi. Başarılı olursa next-auth /dashboard'a yönlendirir (redirect hatası yukarı fırlatılır). */
export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  try {
    enforceRateLimit("auth.login", email || "unknown");
    await signIn("credentials", { email, password: String(formData.get("password") || ""), redirectTo: "/dashboard" });
    return null;
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    if (error instanceof AuthError) return { error: t.auth.invalidCredentials };
    throw error;
  }
}
