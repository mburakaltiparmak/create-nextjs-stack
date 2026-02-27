import type { Metadata, Viewport } from "next";
import {
  Inter,
} from "next/font/google";
import "@/app/globals.css";
import StoreProvider from "@/lib/providers/StoreProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Next.js Enterprise Starter",
    template: "%s | Next.js Enterprise Starter",
  },
  description: "A production-ready Next.js starter template with Supabase, Tailwind CSS, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Next.js Starter",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32" },
      { url: "/favicon.png", sizes: "16x16" },
    ],
    apple: {
      url: "/favicon.png",
      sizes: "180x180",
    },
    shortcut: "/favicon.png",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
  openGraph: {
    locale: "en_US",
    type: "website",
    siteName: "Next.js Enterprise Starter",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Next.js Enterprise Starter",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <StoreProvider>
          {children}
          {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        </StoreProvider>
      </body>
    </html>
  );
}
