import { t } from "./i18n";
import { allSites } from "./sites";
export { siteLabels } from "./sites";
import type { Role } from "./authorization";

/** Panelin adı (kenar menü, sekme başlığı). NEXT_PUBLIC_SITE_NAME ile değiştirilir. */
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "My Site";

export const roleLabels = t.roles as Record<Role, string>;
export const roleDescriptions = t.roleDescriptions as Record<Role, string>;

/** İçerik tipi etiketleri (tip ID'leri siteler arasında benzersizdir). */
export const contentTypeLabels: Record<string, string> = Object.fromEntries(allSites.flatMap((site) => site.model.types.map((type) => [type.id, type.label])));

/** Yönlendirme sonrası liste sayfalarında gösterilen tek seferlik bildirimler. */
export const notices: Record<string, string> = {
  ...t.notices,
};

/** Başarısız işlemlerden sonra gösterilen tek seferlik uyarılar (?notice=). */
export const errorNotices: Record<string, string> = {};
