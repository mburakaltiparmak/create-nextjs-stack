"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "@/components/shell/navigation";
import { rememberSite } from "@/lib/site-preference";

// Detay sayfaları tek bir siteye ait kayıt gösterir; site değişince ilgili listeye dönülür.
const detailPattern = /^\/(content|leads)\/(?!new$)[^/]+$/;

type SiteContextValue = { site: string; siteKeys: readonly string[]; switchSite: (next: string) => void; switching: boolean };
const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ savedSite, siteKeys, children }: { savedSite: string; siteKeys: readonly string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { navigate, pending: switching } = useNavigate();
  const [remembered, setRemembered] = useState(savedSite);
  const fromUrl = searchParams.get("site");
  const linked = fromUrl && siteKeys.includes(fromUrl) ? fromUrl : null;
  // Bağlantıyla başka siteye gelinirse tercih de güncellenir; menü bağlantıları aynı sitede kalır.
  if (linked && linked !== remembered) setRemembered(linked);
  const site = linked ?? remembered;
  useEffect(() => { if (remembered) rememberSite(remembered); }, [remembered]);

  function switchSite(next: string) {
    rememberSite(next);
    setRemembered(next);
    const base = detailPattern.test(pathname) ? `/${pathname.split("/")[1]}` : pathname;
    navigate(`${base}?site=${next}`);
  }

  return <SiteContext value={{ site, siteKeys, switchSite, switching }}>{children}</SiteContext>;
}

export function useCurrentSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useCurrentSite must be used inside SiteProvider.");
  return value;
}
