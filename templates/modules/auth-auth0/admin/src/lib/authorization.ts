import { t } from "@/lib/i18n";
import "server-only";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { env } from "@/lib/auth0-env";
import { UserError } from "@/lib/errors";
import { getUser, userRoles as getUserRoles } from "@/lib/management";
import { can, roles, type Action, type Principal, type Role } from "@/lib/permissions";
import { isSiteKey, siteKeys, type SiteKey } from "@/lib/sites";
export { can, roles, type Principal, type Role } from "@/lib/permissions";

export async function getPrincipal(): Promise<Principal | null> {
  const session = await auth0.getSession();
  if (!session) return null;
  const user = session.user as Record<string, unknown>;
  const id = String(user.sub || "");
  const rawRoles = user[env.rolesClaim] ?? user.roles ?? [];
  const rawSites = user[env.siteKeysClaim] ?? user.siteKeys ?? [];
  let userRoles = Array.isArray(rawRoles) ? rawRoles.filter((value): value is Role => typeof value === "string" && roles.includes(value as Role)) : [];
  let assigned = Array.isArray(rawSites) ? rawSites.filter(isSiteKey) : [];

  // Yetki yoksa kapalı kalınır; ancak özel claim'leri oturum profiline koymayan
  // kimlik sağlayıcılar için roller ve siteler sunucuda Auth0'dan yeniden okunur.
  if (!userRoles.length && id) {
    const liveRoles = await getUserRoles(id);
    userRoles = liveRoles
      .map((item) => item.name.toLowerCase())
      .filter((value): value is Role => roles.includes(value as Role));
  }
  if (!assigned.length && id && userRoles.length && !userRoles.includes("administrator")) {
    assigned = ((await getUser(id)).app_metadata?.siteKeys ?? []).filter(isSiteKey);
  }
  const allowed: SiteKey[] = userRoles.includes("administrator") ? [...siteKeys] : assigned;
  return { id, email: String(user.email || ""), roles: userRoles, siteKeys: allowed };
}

export async function requirePrincipal(action: Action = "read", siteKey?: SiteKey) {
  const principal = await getPrincipal();
  if (!principal) redirect(`/auth/login?returnTo=${encodeURIComponent("/")}`);
  if (!can(principal, action, siteKey)) throw new UserError(t.errors.forbidden);
  return principal;
}
