import { t } from "@/lib/i18n";
import { ImageIcon, Inbox, LayoutDashboard, type LucideIcon } from "lucide-react";

import { authNavItems } from "@/components/auth/auth-nav";
import type { SiteDef } from "@/lib/sites";

/** `when`: yalnız bu koşulu sağlayan sitede gösterilir (ör. talepler yalnız `leads: true` olan sitede). */
/** `external`: yeni sekmede açılan dış bağlantı (`<href>/<site>`). */
export type NavItem = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean; external?: boolean; when?: (site: SiteDef) => boolean };

/**
 * Sabit menü öğeleri. "İçerik" grubunun başına sitenin içerik tipleri eklenir (`contentTypeItems`):
 * her tip ayrı bir menü öğesidir ve /content?type=<id> listesini açar.
 */
export const navGroups: { id: string; label: string; items: NavItem[] }[] = [
  { id: "general", label: t.nav.general, items: [{ href: "/dashboard", label: t.dashboard.title, icon: LayoutDashboard }, { href: "/leads", label: t.leads.title, icon: Inbox, when: (site) => site.leads }] },
  { id: "content", label: t.nav.content, items: [{ href: "/assets", label: t.nav.media, icon: ImageIcon, when: (site) => site.images === "assets" }] },
  { id: "admin", label: t.nav.admin, items: authNavItems },
];

export type TypeNavItem = { id: string; href: string; label: string; icon?: LucideIcon };

export function contentTypeItems(site: SiteDef | null): TypeNavItem[] {
  return (site?.model.types ?? []).map((type) => ({ id: type.id, href: `/content?type=${type.id}`, label: type.plural ?? type.label, icon: type.icon }));
}

/** Breadcrumb için yol parçaları: bölüm ve varsa detay. İçerik sayfalarında bölüm, adresteki `type` tipidir. */
export type Crumb = { label: string; href?: string };

export function breadcrumbFor(pathname: string, site: SiteDef | null, typeId?: string | null): Crumb[] {
  if (pathname === "/content" || pathname.startsWith("/content/")) {
    const type = site?.model.types.find((item) => item.id === typeId);
    const section = type ? { label: type.plural ?? type.label, href: `/content?type=${type.id}` } : { label: t.content.all, href: "/content" };
    if (pathname === "/content") return [{ label: section.label }];
    return [section, { label: pathname === "/content/new" ? (type ? t.content.newOf(type.label) : t.content.newContent) : t.common.edit }];
  }
  const items = navGroups.flatMap((group) => group.items);
  const section = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  if (!section) return [];
  if (pathname === section.href) return [{ label: section.label }];
  return [{ label: section.label, href: section.href }, { label: section.href === "/leads" ? t.leads.detail : t.common.edit }];
}
