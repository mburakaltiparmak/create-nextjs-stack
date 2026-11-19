import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { enforceRateLimit, waitText } = await import("./rate-limit");
const { t } = await import("./i18n");
const { UserError } = await import("./errors");

describe("enforceRateLimit", () => {
  it("rejects after the per-user limit with a readable wait time", () => {
    for (let index = 0; index < 3; index += 1) enforceRateLimit("lead.purge", "actor-1");
    expect(() => enforceRateLimit("lead.purge", "actor-1")).toThrow(UserError);
    expect(() => enforceRateLimit("lead.purge", "actor-2")).not.toThrow();
  });
  it("formats waits", () => {
    expect(waitText(4_200)).toBe(t.common.seconds(5));
    expect(waitText(125_000)).toBe(t.common.minutes(3));
  });
});
