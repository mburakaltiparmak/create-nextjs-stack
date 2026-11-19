import { siteName } from "@/lib/labels";
import { cn } from "@/lib/utils";

// Logo yerine site adı yazılır (NEXT_PUBLIC_SITE_NAME). Kendi logonuzu kullanmak için public/brand/ altına
// koyup burada next/image ile gösterin. Kenar menü ve giriş/hata sayfaları koyu zemindedir (globals.css --sidebar).

/** Yazılı logo; yüksekliği className ile verilir. */
export function BrandLogo({ className }: { className?: string; priority?: boolean }) {
  return <span className={cn("flex h-9 items-center gap-2 font-semibold tracking-tight text-white select-none", className)}>
    <BrandMark className="h-[0.9em]"/>
    <span className="truncate text-lg">{siteName}</span>
  </span>;
}

/** Daraltılmış menü gibi dar alanlar için sembol: site adının baş harfi. */
export function BrandMark({ className }: { className?: string }) {
  return <span aria-hidden className={cn("flex aspect-square h-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-white", className)}>{siteName.charAt(0).toLocaleUpperCase()}</span>;
}
