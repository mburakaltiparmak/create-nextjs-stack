import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "@/app/globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "My Site";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || `${siteName} — built with create-nextjs-stack.`,
  alternates: { canonical: siteUrl },
  openGraph: { type: "website", siteName },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en">
    <body className={`${inter.variable} min-h-svh bg-white font-sans text-slate-900 antialiased`}>
      <SiteHeader/>
      {children}
      <SiteFooter/>
    </body>
  </html>;
}
