import { t } from "@/lib/i18n";
import "server-only";
import { UserError } from "./errors";
import { slidingWindow } from "./timing";

/**
 * Kullanıcı başına işlem sınırları. Sayaçlar sunucu örneğinin belleğindedir: Vercel'de her örnek ayrı sayar,
 * yeniden başlatmada sıfırlanır. Kötüye kullanıma karşı en iyi çaba korumasıdır.
 */
const policies = {
  "auth.login": { limit: 10, windowMs: 10 * 60_000 },
  // Auth0 giriş modülü: davetler ve MFA işlemleri.
  "user.invite": { limit: 10, windowMs: 10 * 60_000 },
  "user.invite.resend": { limit: 10, windowMs: 10 * 60_000 },
  "account.mfa": { limit: 10, windowMs: 10 * 60_000 },
  "asset.upload": { limit: 30, windowMs: 10 * 60_000 },
  "lead.purge": { limit: 3, windowMs: 10 * 60_000 },
  "content.publication": { limit: 60, windowMs: 60_000 },
  "content.slugCheck": { limit: 120, windowMs: 60_000 },
} as const;

export type RateLimitedAction = keyof typeof policies;

const limiters = new Map(Object.entries(policies).map(([action, policy]) => [action, slidingWindow(policy.limit, policy.windowMs)]));

export function waitText(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return seconds < 60 ? t.common.seconds(seconds) : t.common.minutes(Math.ceil(seconds / 60));
}

export function enforceRateLimit(action: RateLimitedAction, actorId: string) {
  const wait = limiters.get(action)!.take(actorId);
  if (wait > 0) throw new UserError(t.errors.rateLimited(waitText(wait)));
}
