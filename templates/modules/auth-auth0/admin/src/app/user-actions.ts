"use server";

import { t } from "@/lib/i18n";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction } from "@/lib/action";
import type { ActionState } from "@/lib/action-state";
import { audited } from "@/lib/audit";
import { requirePrincipal, roles, type Role } from "@/lib/authorization";
import { UserError } from "@/lib/errors";
import { issueInvitation } from "@/lib/invitations";
import { createInvitedUser, getUser, invitationPending, updateUserAccess } from "@/lib/management";
import { enforceRateLimit } from "@/lib/rate-limit";
import { siteKeys } from "@/lib/sites";

/** Kullanıcı yönetimi (Auth0): davet, daveti yeniden gönderme, rol/site erişimi. Yalnız yöneticiler. */

/** Yöneticiler tüm sitelere erişir; diğer rollerde en az bir site seçilmelidir. */
function assignedSites(role: Role, formData: FormData) {
  if (role === "administrator") return [...siteKeys];
  const assigned = siteKeys.filter((key) => formData.getAll("siteKeys").includes(key));
  if (!assigned.length) throw new UserError(t.users.pickSite);
  return assigned;
}

function invitationResult(result: Awaited<ReturnType<typeof issueInvitation>>, success: string) {
  if (result.sent) return t.users.linkValid(success, result.until);
  return { message: t.users.shareLink(result.reason, result.until), link: result.ticket };
}

export async function inviteUser(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const principal = await requirePrincipal("users");
    enforceRateLimit("user.invite", principal.id);
    const email = z.email().parse(String(formData.get("email") || "").trim());
    const role = z.enum(roles).parse(formData.get("role")) as Role;
    const assigned = assignedSites(role, formData);
    const result = await audited(principal, { action: "user.invite", resourceType: "user", resourceId: email }, async () => {
      const user = await createInvitedUser(email, role, assigned);
      return issueInvitation(user, "invite");
    });
    revalidatePath("/users");
    return invitationResult(result, t.users.invited(email));
  });
}

export async function resendInvitation(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const principal = await requirePrincipal("users");
    enforceRateLimit("user.invite.resend", principal.id);
    const user = await getUser(String(formData.get("userId")));
    if (user.blocked) throw new UserError(t.users.blockedNoLink);
    const kind = invitationPending(user) ? "invite" : "reset";
    const result = await audited(principal, { action: kind === "invite" ? "user.invite.resend" : "user.password.reset", resourceType: "user", resourceId: user.user_id }, () => issueInvitation(user, kind));
    return invitationResult(result, kind === "invite" ? t.users.inviteResent : t.users.resetSent);
  });
}

export async function changeUserAccess(_state: ActionState, formData: FormData) {
  return runAction(async () => {
    const principal = await requirePrincipal("users");
    const userId = String(formData.get("userId"));
    const role = z.enum(roles).parse(formData.get("role")) as Role;
    const assigned = assignedSites(role, formData);
    const blocked = formData.get("blocked") === "on";
    await audited(principal, { action: "user.access.update", resourceType: "user", resourceId: userId }, () => updateUserAccess(principal.id, userId, role, assigned, blocked));
    revalidatePath("/users");
    return t.users.accessUpdated;
  });
}
