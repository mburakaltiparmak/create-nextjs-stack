import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Outfit,
  Raleway,
  Roboto,
  Jersey_10,
} from "next/font/google";
import "@/app/globals.css";
import StoreProvider from "@/lib/providers/StoreProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

const jersey10 = Jersey_10({
  variable: "--font-jersey-10",
  subsets: ["latin"],
  weight: "400",
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
  metadataBase: new URL("https://create-nextjs-stack.vercel.app"),
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
    canonical: "https://create-nextjs-stack.vercel.app",
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} ${roboto.variable} ${raleway.variable} ${jersey10.variable} antialiased`}
      >
        <StoreProvider>
          {children}
          <GoogleAnalytics gaId="G-XYZ1234567" />
        </StoreProvider>
      </body>
    </html>
  );
}
