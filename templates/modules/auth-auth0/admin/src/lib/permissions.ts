import { t } from "@/lib/i18n";
import { UserError } from "./errors";
import type { SiteKey } from "./sites";

export const roles = ["editor", "publisher", "administrator"] as const;
export type Role = (typeof roles)[number];
export type Principal = { id: string; email: string; roles: Role[]; siteKeys: SiteKey[] };
export type Action = "read" | "edit" | "publish" | "delete" | "users" | "audit";

/**
 * Editör taslak yazar, yayıncı ayrıca yayınlar; silme, kullanıcı yönetimi ve denetim yalnız yöneticidedir.
 * Site verilirse kullanıcının o siteye atanmış olması da gerekir (yöneticiler tüm sitelere erişir).
 */
export function can(principal: Principal, action: Action, siteKey?: SiteKey) {
  if (principal.roles.includes("administrator")) return true;
  if (siteKey && !principal.siteKeys.includes(siteKey)) return false;
  if (action === "read" || action === "edit") return principal.roles.some((role) => role === "editor" || role === "publisher");
  if (action === "publish") return principal.roles.includes("publisher");
  return false;
}

export function validateAdministratorChange(input: { actorId: string; userId: string; wasAdmin: boolean; nextRole: Role; blocked: boolean; activeOtherAdministrators: number }) {
  if (input.actorId === input.userId && input.blocked) throw new UserError(t.users.cannotBlockSelf);
  if (input.actorId === input.userId && input.wasAdmin && input.nextRole !== "administrator") throw new UserError(t.users.cannotDemoteSelf);
  if (input.wasAdmin && (input.nextRole !== "administrator" || input.blocked) && input.activeOtherAdministrators === 0) throw new UserError(t.users.lastAdmin);
}
