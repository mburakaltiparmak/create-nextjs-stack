import { t } from "@/lib/i18n";
import "server-only";
import { unstable_rethrow } from "next/navigation";
import { z, ZodError } from "zod";
import type { ActionState } from "./action-state";
import { fieldLabels as contentFieldLabels } from "./content-validation";
import { ServiceError, UserError, serviceMessage } from "./errors";

z.config(t.meta.zod());

const fieldLabels: Record<string, string> = {
  ...contentFieldLabels,
  ...t.fields,
};

export function toActionState(error: unknown): ActionState {
  const at = Date.now();
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = String(issue.path[0] ?? "form");
      // Özel (custom) mesajlar alan adını zaten içerir; yolu olmayan tek değer doğrulamalarında etiket yoktur.
      const label = issue.code === "custom" || key === "form" ? "" : `${fieldLabels[key] ?? key}: `;
      fieldErrors[key] ??= `${label}${issue.message}`;
    }
    return { ok: false, message: t.errors.checkFields, fieldErrors, at };
  }
  if (error instanceof UserError) return { ok: false, message: error.message, at };
  // Beklenmeyen hatalar istemciye ayrıntı sızdırmaz; referans koduyla sunucu loguna eşlenir.
  const reference = crypto.randomUUID().slice(0, 8);
  process.stderr.write(`${JSON.stringify({ reference, error: error instanceof Error ? { name: error.name, message: error.message } : String(error), at: new Date(at).toISOString() })}\n`);
  const message = error instanceof ServiceError ? serviceMessage(error) : t.errors.unexpected;
  return { ok: false, message: t.errors.withReference(message, reference), at };
}

/** Server action gövdesini çalıştırır; redirect/notFound geçer, diğer hatalar form durumuna çevrilir. */
export async function runAction(operation: () => Promise<string | Omit<NonNullable<ActionState>, "at" | "ok"> | void>): Promise<ActionState> {
  try {
    const result = await operation();
    if (typeof result === "string") return { ok: true, message: result, at: Date.now() };
    return { ok: true, message: t.common.saved, ...result, at: Date.now() };
  } catch (error) {
    unstable_rethrow(error);
    return toActionState(error);
  }
}
