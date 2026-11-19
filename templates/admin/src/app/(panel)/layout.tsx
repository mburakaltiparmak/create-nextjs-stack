import { t } from "@/lib/i18n";
import { cookies } from "next/headers";
import FlashToast from "@/components/FlashToast";
import { NavigationBusy } from "@/components/shell/navigation";
import AppHeader from "@/components/shell/AppHeader";
import AppSidebar from "@/components/shell/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requirePrincipal } from "@/lib/authorization";
import { roleLabels } from "@/lib/labels";
import { SiteProvider } from "@/hooks/use-current-site";
import { countNewLeads } from "@/lib/leads";
import { currentSiteKey } from "@/lib/site";
import { leadsSite } from "@/lib/sites";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const principal = await requirePrincipal();
  const [cookieStore, savedSite, newLeads] = await Promise.all([
    cookies(),
    currentSiteKey(principal),
    principal.siteKeys.includes(leadsSite.key) ? countNewLeads().catch(() => null) : null,
  ]);
  const isAdmin = principal.roles.includes("administrator");
  const user = { email: principal.email, role: principal.roles.map((role) => roleLabels[role]).join(", ") || t.roles.none };

  return <SiteProvider savedSite={savedSite ?? ""} siteKeys={principal.siteKeys}>
      <SidebarProvider defaultOpen={cookieStore.get("sidebar_state")?.value !== "false"}>
        <AppSidebar user={user} isAdmin={isAdmin} newLeads={newLeads}/>
        <SidebarInset>
          <FlashToast/>
          <AppHeader isAdmin={isAdmin}/>
          <NavigationBusy className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pb-16 md:p-8">{children}</NavigationBusy>
        </SidebarInset>
      </SidebarProvider>
  </SiteProvider>;
}
