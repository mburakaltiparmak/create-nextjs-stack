import { auth0 } from "@/lib/auth0";

export async function proxy(request: Request) {
  return auth0.middleware(request);
}

export const config = {
  // /api/cron Auth0 oturumu yerine CRON_SECRET ile korunur.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/cron/).*)"],
};
