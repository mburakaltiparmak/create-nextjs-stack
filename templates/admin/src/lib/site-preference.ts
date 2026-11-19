/** Seçili site tarayıcıda çerezde tutulur; sayfalar ?site= yoksa bu tercihi kullanır. */
export const siteCookieName = "admin_site";

export function rememberSite(siteKey: string) {
  document.cookie = `${siteCookieName}=${siteKey}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
