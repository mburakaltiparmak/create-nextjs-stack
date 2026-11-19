import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { invitationCooldownMs, invitationCooldownRemaining } = await import("./invitations");

describe("invitation cooldown", () => {
  const user = (sentAt?: string) => ({ user_id: "auth0|1", email: "a@example.com", app_metadata: { invitationSentAt: sentAt } });
  it("allows the first invitation and blocks a resend inside the cooldown", () => {
    const now = Date.parse("2026-10-31T12:00:00Z");
    expect(invitationCooldownRemaining(user(), now)).toBe(0);
    expect(invitationCooldownRemaining(user("2026-10-31T11:59:40Z"), now)).toBe(invitationCooldownMs - 20_000);
    expect(invitationCooldownRemaining(user("2026-10-31T11:58:00Z"), now)).toBe(0);
  });
});
