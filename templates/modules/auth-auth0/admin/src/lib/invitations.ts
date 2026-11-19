import { t } from "@/lib/i18n";
import "server-only";
import { siteName } from "@/lib/labels";
import { Resend } from "resend";
import { env } from "@/lib/auth0-env";
import { UserError } from "@/lib/errors";
import { createPasswordTicket, markInvitationSent, type User } from "@/lib/management";
import { waitText } from "@/lib/rate-limit";

/** Aynı kullanıcıya iki bağlantı arasında beklenecek süre; Auth0'da tutulduğu için tüm sunucu örneklerinde geçerlidir. */
export const invitationCooldownMs = 60_000;

export function invitationCooldownRemaining(user: User, now = Date.now()) {
  const sentAt = Date.parse(user.app_metadata?.invitationSentAt ?? "");
  return Number.isNaN(sentAt) ? 0 : Math.max(0, sentAt + invitationCooldownMs - now);
}

const dateFormat = new Intl.DateTimeFormat(t.meta.locale, { dateStyle: "long", timeStyle: "short" });

/**
 * Yeni şifre belirleme bağlantısı üretip e-postayla gönderir. E-posta gönderilemezse hata fırlatmaz;
 * bağlantı yöneticiye gösterilir ki kullanıcıya başka bir kanaldan iletebilsin.
 */
export async function issueInvitation(user: User, kind: "invite" | "reset") {
  const wait = invitationCooldownRemaining(user);
  if (wait > 0) throw new UserError(t.users.cooldown(waitText(wait)));
  const { ticket, expiresAt } = await createPasswordTicket(user.user_id);
  // Zaman damgası yazılamazsa bağlantı yine teslim edilir; yalnız bekleme süresi bu sefer uygulanmaz.
  await markInvitationSent(user.user_id).catch((error) => process.stderr.write(`${JSON.stringify({ action: "invitation.mark", userId: user.user_id, error: error instanceof Error ? error.message : String(error) })}
`));
  const until = dateFormat.format(expiresAt);
  if (!env.resendApiKey || !env.resendFrom) return { sent: false as const, ticket, until, reason: t.users.resendMissing };
  const subject = kind === "invite" ? t.users.inviteSubject(siteName) : t.users.resetSubject(siteName);
  const text = [
    kind === "invite" ? t.users.inviteBody(siteName) : t.users.resetBody(siteName),
    t.users.setPassword(until),
    ticket,
    t.users.emailFooter,
  ].join("\n\n");
  try {
    const result = await new Resend(env.resendApiKey).emails.send({ from: env.resendFrom, to: user.email, subject, text });
    if (result.error) throw new Error(result.error.message);
    return { sent: true as const, ticket, until };
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ action: "invitation.email", userId: user.user_id, error: error instanceof Error ? error.message : String(error), at: new Date().toISOString() })}\n`);
    return { sent: false as const, ticket, until, reason: t.users.inviteEmailFailed };
  }
}
