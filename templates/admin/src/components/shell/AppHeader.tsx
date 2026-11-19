"use client";

import { AppLink as Link } from "@/components/shell/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { breadcrumbFor } from "@/components/shell/nav";
import CommandMenu from "@/components/shell/CommandMenu";
import { TopProgress } from "@/components/shell/navigation";
import { useCurrentSite } from "@/hooks/use-current-site";
import { isSiteKey, sites } from "@/lib/sites";

export default function AppHeader({ isAdmin }: { isAdmin: boolean }) {
  const { site } = useCurrentSite();
  const crumbs = breadcrumbFor(usePathname(), isSiteKey(site) ? sites[site] : null, useSearchParams().get("type"));
  return <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:rounded-t-xl">
    <SidebarTrigger className="-ml-1"/>
    <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4"/>
    <Breadcrumb><BreadcrumbList>{crumbs.map((crumb, index) => <Fragment key={crumb.label}>
      {index > 0 && <BreadcrumbSeparator/>}
      <BreadcrumbItem>{crumb.href ? <BreadcrumbLink asChild><Link href={crumb.href}>{crumb.label}</Link></BreadcrumbLink> : <BreadcrumbPage>{crumb.label}</BreadcrumbPage>}</BreadcrumbItem>
    </Fragment>)}</BreadcrumbList></Breadcrumb>
    <div className="ml-auto flex items-center gap-2"><CommandMenu isAdmin={isAdmin}/></div>
    <TopProgress/>
  </header>;
}
