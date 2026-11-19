import { t } from "@/lib/i18n";
import { Users } from "lucide-react";
import type { NavItem } from "@/components/shell/nav";

/** Auth0: kullanıcı yönetimi yalnız yöneticilere görünür. */
export const authNavItems: NavItem[] = [{ href: "/users", label: t.users.title, icon: Users, adminOnly: true }];
