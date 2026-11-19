import "server-only";

/** Auth0 ve davet e-postası ayarları (src/lib/env.ts veri kaynağına aittir; bu dosya giriş modülüne). */
export const env = {
  // Management API her zaman tenant'ın kendi adresinden çağrılır (dev-….auth0.com). Giriş için custom domain
  // kullanılınca AUTH0_DOMAIN onu, AUTH0_MANAGEMENT_DOMAIN tenant adresini gösterir.
  auth0Domain: (process.env.AUTH0_MANAGEMENT_DOMAIN || process.env.AUTH0_DOMAIN)?.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  managementClientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  managementClientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
  rolesClaim: process.env.AUTH0_ROLES_CLAIM || "https://example.com/roles",
  siteKeysClaim: process.env.AUTH0_SITE_KEYS_CLAIM || "https://example.com/siteKeys",
  connection: process.env.AUTH0_DATABASE_CONNECTION || "Username-Password-Authentication",
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM_EMAIL,
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3001",
};
