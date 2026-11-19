import "server-only";
import { cookies } from "next/headers";
import type { Principal } from "@/lib/authorization";
import { siteCookieName } from "@/lib/site-preference";
import { getSite, isSiteKey, type SiteKey } from "@/lib/sites";

/** İstenen site erişilebilirse onu, değilse kayıtlı tercihi, o da yoksa ilk atanmış siteyi döndürür. */
export async function currentSiteKey(principal: Principal, requested?: string): Promise<SiteKey | undefined> {
  const allowed = (value?: string): value is SiteKey => Boolean(value && isSiteKey(value) && principal.siteKeys.includes(value));
  if (allowed(requested)) return requested;
  const saved = (await cookies()).get(siteCookieName)?.value;
  return allowed(saved) ? saved : principal.siteKeys[0];
}

export async function currentSite(principal: Principal, requested?: string) {
  const key = await currentSiteKey(principal, requested);
  return key ? getSite(key) : undefined;
}
