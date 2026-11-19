import { t } from "./i18n";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("server-only", () => ({}));
const { runAction, toActionState } = await import("./action");
const { ServiceError, UserError } = await import("./errors");

describe("action errors", () => {
  it("shows user errors as-is", () => { expect(toActionState(new UserError("Bu işlem için yetkiniz yok."))).toMatchObject({ ok: false, message: "Bu işlem için yetkiniz yok." }); });
  it("maps zod issues to labelled field errors", () => {
    const result = z.object({ title: z.string().min(2) }).safeParse({ title: "a" });
    const state = toActionState(result.error);
    expect(state?.fieldErrors?.title).toMatch(new RegExp(`^${t.fields.title}: `));
  });
  it("hides service details behind a reference code", () => {
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    const state = toActionState(new ServiceError("Contentful", 500, "secret token in body"));
    expect(state?.message).not.toContain("secret");
    expect(state?.message).toMatch(/[a-f0-9]{8}\)$/);
    expect(toActionState(new ServiceError("Contentful", 409))?.message).toContain(t.errors.changedMeanwhile);
  });
  it("lets Next.js redirects through", async () => {
    const redirect = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;push;/content;303;" });
    await expect(runAction(async () => { throw redirect; })).rejects.toBe(redirect);
  });
  it("wraps success messages", async () => { expect(await runAction(async () => "Kaydedildi.")).toMatchObject({ ok: true, message: "Kaydedildi." }); });
});
