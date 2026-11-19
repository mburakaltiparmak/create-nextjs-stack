import "server-only";
import type { Principal } from "@/lib/authorization";

type AuditTarget = { action: string; resourceType: string; resourceId: string; metadata?: Record<string, string | number | boolean> };

/** İşlemi bekliyor / başarılı / başarısız olarak yapılandırılmış log satırlarına yazar (Vercel log akışı). */
export async function audited<T>(principal: Principal, target: AuditTarget, operation: () => Promise<T>) {
  const event = { actorId: principal.id, action: target.action, resourceType: target.resourceType, resourceId: target.resourceId, metadata: target.metadata || {} };
  process.stdout.write(`${JSON.stringify({ ...event, result: "pending", at: new Date().toISOString() })}\n`);
  try {
    const result = await operation();
    process.stdout.write(`${JSON.stringify({ ...event, result: "success", at: new Date().toISOString() })}\n`);
    return result;
  } catch (cause) {
    process.stderr.write(`${JSON.stringify({ ...event, result: "failure", error: cause instanceof Error ? cause.name : "unknown", at: new Date().toISOString() })}\n`);
    throw cause;
  }
}
