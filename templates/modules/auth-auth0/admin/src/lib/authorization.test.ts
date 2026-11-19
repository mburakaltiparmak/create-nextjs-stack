import { describe, expect, it } from "vitest";
import { can, validateAdministratorChange, type Principal } from "./permissions";

const editor: Principal = { id: "1", email: "e@example.com", roles: ["editor"], siteKeys: ["main"] };
const unassigned: Principal = { ...editor, siteKeys: [] };
const publisher: Principal = { ...editor, roles: ["publisher"] };
const administrator: Principal = { ...editor, roles: ["administrator"], siteKeys: [] };
const nobody: Principal = { ...editor, roles: [] };

describe("authorization", () => {
  it("lets editors edit their assigned sites only, and not publish", () => {
    expect(can(editor, "edit", "main")).toBe(true);
    expect(can(unassigned, "edit", "main")).toBe(false);
    expect(can(editor, "publish", "main")).toBe(false);
  });
  it("allows publishers to publish on their sites", () => {
    expect(can(publisher, "publish", "main")).toBe(true);
    expect(can({ ...publisher, siteKeys: [] }, "publish", "main")).toBe(false);
  });
  it("reserves delete and user management for administrators, on every site", () => {
    expect(can(publisher, "delete", "main")).toBe(false);
    expect(can(publisher, "users")).toBe(false);
    expect(can(administrator, "users")).toBe(true);
    expect(can(administrator, "delete", "main")).toBe(true);
  });
  it("fails closed for users without a role", () => { expect(can(nobody, "read", "main")).toBe(false); expect(can(nobody, "edit")).toBe(false); });
  it("prevents removing the last administrator and self-lockout", () => {
    expect(() => validateAdministratorChange({ actorId: "1", userId: "1", wasAdmin: true, nextRole: "publisher", blocked: false, activeOtherAdministrators: 2 })).toThrow();
    expect(() => validateAdministratorChange({ actorId: "1", userId: "1", wasAdmin: true, nextRole: "administrator", blocked: true, activeOtherAdministrators: 2 })).toThrow();
    expect(() => validateAdministratorChange({ actorId: "2", userId: "1", wasAdmin: true, nextRole: "publisher", blocked: false, activeOtherAdministrators: 0 })).toThrow();
    expect(() => validateAdministratorChange({ actorId: "2", userId: "1", wasAdmin: true, nextRole: "publisher", blocked: false, activeOtherAdministrators: 1 })).not.toThrow();
  });
});
