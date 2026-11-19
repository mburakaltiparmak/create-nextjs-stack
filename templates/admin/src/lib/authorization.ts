import { t } from "@/lib/i18n";
import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserError } from "@/lib/errors";
import { siteKeys, type SiteKey } from "@/lib/sites";

/**
 * mindofis admin'indeki yetki katmanının tek yöneticili karşılığı. İmzalar (getPrincipal, requirePrincipal, can)
 * aynı tutulur; böylece sayfalar ve action'lar değişmeden çalışır. Giriş next-auth credentials ile yapılır
 * (src/auth.ts); oturum açmış yönetici tüm sitelerde tüm işlemleri yapabilir.
 */
export const roles = ["administrator"] as const;
export type Role = (typeof roles)[number];
export type Action = "read" | "edit" | "publish" | "delete" | "audit";
export type Principal = { id: string; email: string; roles: Role[]; siteKeys: SiteKey[] };

export function can(principal: Principal, _action: Action, siteKey?: SiteKey) {
  return !siteKey || principal.siteKeys.includes(siteKey);
}

export async function getPrincipal(): Promise<Principal | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return { id: session.user.id || "admin", email: session.user.email, roles: ["administrator"], siteKeys: [...siteKeys] };
}

export async function requirePrincipal(action: Action = "read", siteKey?: SiteKey) {
  const principal = await getPrincipal();
  if (!principal) redirect("/login");
  if (!can(principal, action, siteKey)) throw new UserError(t.errors.forbidden);
  return principal;
}
