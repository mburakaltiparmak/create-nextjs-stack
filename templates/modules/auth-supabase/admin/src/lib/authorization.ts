import { t } from "@/lib/i18n";
import "server-only";
import { redirect } from "next/navigation";
import { UserError } from "@/lib/errors";
import { siteKeys, type SiteKey } from "@/lib/sites";
import { adminEmails, supabaseAuth } from "@/lib/supabase-auth";

/**
 * Yetki katmanı — Supabase Auth sürümü. Supabase'de oturum açmış ve e-postası ADMIN_EMAILS listesinde olan
 * kullanıcı yöneticidir; tüm sitelerde tüm işlemleri yapabilir. Diğer giriş yöntemleriyle aynı imzalar.
 */
export const roles = ["administrator"] as const;
export type Role = (typeof roles)[number];
export type Action = "read" | "edit" | "publish" | "delete" | "audit";
export type Principal = { id: string; email: string; roles: Role[]; siteKeys: SiteKey[] };

export function can(principal: Principal, _action: Action, siteKey?: SiteKey) {
  return !siteKey || principal.siteKeys.includes(siteKey);
}

export async function getPrincipal(): Promise<Principal | null> {
  const { data } = await (await supabaseAuth()).auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!data.user || !email || !adminEmails().includes(email)) return null;
  return { id: data.user.id, email, roles: ["administrator"], siteKeys: [...siteKeys] };
}

export async function requirePrincipal(action: Action = "read", siteKey?: SiteKey) {
  const principal = await getPrincipal();
  if (!principal) redirect("/login");
  if (!can(principal, action, siteKey)) throw new UserError(t.errors.forbidden);
  return principal;
}
