import { t } from "@/lib/i18n";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import { siteName } from "@/lib/labels";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-mono" });

export const metadata: Metadata = { title: { default: t.shell.title(siteName), template: `%s · ${t.shell.title(siteName)}` }, robots: { index: false, follow: false } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // next-themes, hidrasyondan önce <html> sınıfını değiştirir.
  return <html lang={t.meta.code} className={cn("font-sans antialiased", geist.variable, geistMono.variable)} suppressHydrationWarning>
    <body><Providers>{children}</Providers></body>
  </html>;
}
