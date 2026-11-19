import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    agentUpgrade: "security",
    // Varsayılan 1 MB server action sınırı görsel yüklemeyi (en fazla 4 MB, lib/uploads.ts) engellerdi; multipart ek yükü için pay bırakılır.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
  // Contentful Assets (medya kütüphanesi ve içerik görselleri).
  images: { remotePatterns: [{ protocol: "https", hostname: "images.ctfassets.net" }] },
  // Yönetim paneli hiçbir ortamda arama motorlarına açılmaz.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] }];
  },
};

export default nextConfig;
