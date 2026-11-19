"use server";

import { t } from "@/lib/i18n";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runAction } from "@/lib/action";
import { audited } from "@/lib/audit";
import { requirePrincipal } from "@/lib/authorization";
import { UserError } from "@/lib/errors";
import { createMfaEnrollmentTicket, listAuthenticators, removeAuthenticators } from "@/lib/management";
import { enforceRateLimit } from "@/lib/rate-limit";

/** İki adımlı doğrulama isteğe bağlıdır; her kullanıcı yalnız kendi hesabı için açar veya kapatır. */

export async function startMfaEnrollment() {
  let destination: string | null = null;
  const result = await runAction(async () => {
    const principal = await requirePrincipal();
    enforceRateLimit("account.mfa", principal.id);
    if ((await listAuthenticators(principal.id)).length) throw new UserError(t.account.alreadyOn);
    destination = await audited(principal, { action: "account.mfa.enroll", resourceType: "user", resourceId: principal.id }, () => createMfaEnrollmentTicket(principal.id));
  });
  if (destination) redirect(destination);
  return result;
}

export async function disableMfa() {
  return runAction(async () => {
    const principal = await requirePrincipal();
    enforceRateLimit("account.mfa", principal.id);
    const removed = await audited(principal, { action: "account.mfa.remove", resourceType: "user", resourceId: principal.id }, () => removeAuthenticators(principal.id));
    revalidatePath("/account");
    return removed ? t.account.turnedOff : t.account.alreadyOff;
  });
}
