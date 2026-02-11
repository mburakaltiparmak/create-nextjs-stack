import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  console.log("Middleware running");
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Defined" : "Undefined");
  console.log("Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Defined" : "Undefined");
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
