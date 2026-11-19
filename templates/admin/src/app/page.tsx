import { redirect } from "next/navigation";
import { loginPath } from "@/lib/auth-routes";
import { getPrincipal } from "@/lib/authorization";

export default async function Home() {
  const principal = await getPrincipal();
  redirect(principal ? "/dashboard" : loginPath);
}
