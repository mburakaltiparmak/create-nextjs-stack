import { t } from "@/lib/i18n";
/** Kullanıcıya olduğu gibi gösterilebilecek, beklenen hata (doğrulama, yetki, çakışma). */
export class UserError extends Error {
  constructor(message: string) { super(message); this.name = "UserError"; }
}

/** Dış servis (Auth0, Contentful, Resend, Cloudinary veya bir projenin paneli) hatası; ayrıntı yalnız sunucu loguna yazılır. */
export class ServiceError extends Error {
  constructor(readonly service: "Auth0" | "Contentful" | "Resend" | "Cloudinary" | (string & {}), readonly status: number, readonly detail = "") {
    super(`${service} ${status}: ${detail.slice(0, 300)}`);
    this.name = "ServiceError";
  }
}

export function serviceMessage(error: ServiceError) {
  if (error.status === 409 || error.status === 412 || error.status === 422) return t.errors.changedMeanwhile;
  if (error.status === 404) return t.errors.notFound;
  if (error.status === 429) return t.errors.busy(error.service);
  if (error.status === 401 || error.status === 403) return t.errors.rejected(error.service);
  return t.errors.unavailable(error.service);
}
