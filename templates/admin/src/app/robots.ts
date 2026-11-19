import type { MetadataRoute } from "next";

/** Yönetim paneli: tüm tarayıcılar engellenir (ayrıca X-Robots-Tag ve noindex meta etiketi gönderilir). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
