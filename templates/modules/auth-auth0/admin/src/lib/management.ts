import { t } from "@/lib/i18n";
import "server-only";
import { env } from "@/lib/auth0-env";
import type { SiteKey } from "@/lib/sites";
import { validateAdministratorChange, type Role } from "@/lib/permissions";
import { ServiceError, UserError } from "@/lib/errors";

export type User = { user_id: string; email: string; blocked?: boolean; multifactor?: string[]; name?: string; logins_count?: number; last_login?: string; created_at?: string; app_metadata?: { siteKeys?: SiteKey[]; invitationSentAt?: string } };
export const invitationTtlDays = 7;
let cachedToken: { value: string; expiresAt: number } | null = null;

async function token() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;
  if (!env.auth0Domain || !env.managementClientId || !env.managementClientSecret) throw new UserError(t.users.managementMissing);
  const response = await fetch(`https://${env.auth0Domain}/oauth/token`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ grant_type: "client_credentials", client_id: env.managementClientId, client_secret: env.managementClientSecret, audience: `https://${env.auth0Domain}/api/v2/` }) });
  if (!response.ok) throw new ServiceError("Auth0", response.status, "token");
  const data = await response.json() as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function api<T>(path: string, init: RequestInit = {}) {
  if (!env.auth0Domain) throw new UserError(t.users.domainMissing);
  const response = await fetch(`https://${env.auth0Domain}/api/v2${path}`, { ...init, cache: "no-store", headers: { Authorization: `Bearer ${await token()}`, "content-type": "application/json", ...(init.headers || {}) } });
  if (!response.ok) throw new ServiceError("Auth0", response.status, await response.text());
  return response.status === 204 ? null as T : await response.json() as T;
}

function roleId(role: Role) { const id = process.env[`AUTH0_ROLE_${role.toUpperCase()}_ID`]; if (!id) throw new UserError(t.users.roleIdMissing(role)); return id; }
export async function listUsers() { return api<User[]>("/users?per_page=100&include_totals=false"); }
export async function getUser(userId: string) { return api<User>(`/users/${encodeURIComponent(userId)}`); }
export async function userRoles(userId: string) { return api<Array<{ id: string; name: string }>>(`/users/${encodeURIComponent(userId)}/roles`); }
export async function listAdministrators() { return api<{ users?: User[] } | User[]>(`/roles/${roleId("administrator")}/users?per_page=100`); }

export async function findUserByEmail(email: string) { return (await api<User[]>(`/users-by-email?email=${encodeURIComponent(email.toLowerCase())}`))[0] ?? null; }

/** Hiç giriş yapmamış kullanıcı, şifresini henüz belirlememiş (daveti bekleyen) sayılır. */
export function invitationPending(user: User) { return !user.logins_count; }

export async function createInvitedUser(email: string, role: Role, siteKeys: SiteKey[]) {
  if (await findUserByEmail(email)) throw new UserError(t.users.exists);
  const password = `${crypto.randomUUID()}aA1!`;
  const user = await api<User>("/users", { method: "POST", body: JSON.stringify({ connection: env.connection, email, password, email_verified: false, app_metadata: { siteKeys } }) });
  await api(`/users/${encodeURIComponent(user.user_id)}/roles`, { method: "POST", body: JSON.stringify({ roles: [roleId(role)] }) });
  return user;
}

/** Son davet/şifre bağlantısı zamanını kaydeder; Auth0 app_metadata'yı üst düzeyde birleştirir, siteKeys korunur. */
export async function markInvitationSent(userId: string, at = new Date()) {
  await api(`/users/${encodeURIComponent(userId)}`, { method: "PATCH", body: JSON.stringify({ app_metadata: { invitationSentAt: at.toISOString() } }) });
}

/** İki adımlı doğrulama (isteğe bağlı): kullanıcının kayıtlı doğrulayıcı uygulamaları (OTP). */
export type Authenticator = { id: string; type: string; confirmed?: boolean; created_at?: string; name?: string };

export async function listAuthenticators(userId: string) {
  const methods = await api<Authenticator[]>(`/users/${encodeURIComponent(userId)}/authentication-methods`);
  return methods.filter((method) => method.type === "totp" && method.confirmed !== false);
}

/** Auth0'nun kurulum sayfası (QR kod) için tek kullanımlık bağlantı; e-posta gönderilmez. */
export async function createMfaEnrollmentTicket(userId: string) {
  const { ticket_url } = await api<{ ticket_id: string; ticket_url: string }>("/guardian/enrollments/ticket", { method: "POST", body: JSON.stringify({ user_id: userId, send_mail: false, factor: "otp", allow_multiple_enrollments: false }) });
  return ticket_url;
}

export async function removeAuthenticators(userId: string) {
  const methods = await listAuthenticators(userId);
  await Promise.all(methods.map((method) => api(`/users/${encodeURIComponent(userId)}/authentication-methods/${encodeURIComponent(method.id)}`, { method: "DELETE" })));
  return methods.length;
}

/** Şifre belirleme bağlantısı üretir; her çağrı yeni ve bağımsız bir bağlantıdır. */
export async function createPasswordTicket(userId: string) {
  const ttlSeconds = invitationTtlDays * 86_400;
  const { ticket } = await api<{ ticket: string }>("/tickets/password-change", { method: "POST", body: JSON.stringify({ user_id: userId, ttl_sec: ttlSeconds, mark_email_as_verified: true }) });
  return { ticket, expiresAt: new Date(Date.now() + ttlSeconds * 1000) };
}

export async function updateUserAccess(actorId: string, userId: string, role: Role, siteKeys: SiteKey[], blocked: boolean) {
  const existingRoles = await userRoles(userId);
  const wasAdmin = existingRoles.some((item) => item.name.toLowerCase() === "administrator");
  let activeOtherAdministrators = Number.POSITIVE_INFINITY;
  if (wasAdmin && (role !== "administrator" || blocked)) {
    const response = await listAdministrators();
    const admins = Array.isArray(response) ? response : response.users || [];
    activeOtherAdministrators = admins.filter((user) => user.user_id !== userId && !user.blocked).length;
  }
  validateAdministratorChange({ actorId, userId, wasAdmin, nextRole: role, blocked, activeOtherAdministrators });
  await api(`/users/${encodeURIComponent(userId)}`, { method: "PATCH", body: JSON.stringify({ blocked, app_metadata: { siteKeys } }) });
  if (existingRoles.length) await api(`/users/${encodeURIComponent(userId)}/roles`, { method: "DELETE", body: JSON.stringify({ roles: existingRoles.map((item) => item.id) }) });
  await api(`/users/${encodeURIComponent(userId)}/roles`, { method: "POST", body: JSON.stringify({ roles: [roleId(role)] }) });
  await api(`/users/${encodeURIComponent(userId)}/sessions`, { method: "DELETE" });
}
