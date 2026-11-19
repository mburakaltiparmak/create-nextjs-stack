import { describe, expect, it } from "vitest";
import { leadIdPattern, leadUpdateSchema, retentionCutoff, retentionSchema } from "./lead-model";

describe("lead model", () => {
  it("accepts Supabase and Contentful lead IDs only", () => {
    expect(leadIdPattern.test("3f1c2b8e-1d2a-4c5b-9e8f-0a1b2c3d4e5f")).toBe(true);
    expect(leadIdPattern.test("lead-3f1c2b8e-1d2a-4c5b-9e8f-0a1b2c3d4e5f")).toBe(true);
    expect(leadIdPattern.test("brand-1")).toBe(false);
  });

  it("validates status updates and bounds internal notes", () => {
    expect(leadUpdateSchema.safeParse({ status: "closed", internalNote: "Yanıtlandı" }).success).toBe(true);
    expect(leadUpdateSchema.safeParse({ status: "deleted" }).success).toBe(false);
    expect(leadUpdateSchema.safeParse({ status: "new", internalNote: "x".repeat(2_001) }).success).toBe(false);
  });
});

describe("lead retention", () => {
  it("accepts an empty value as unlimited and bounds the day count", () => {
    expect(retentionSchema.parse("")).toBeNull();
    expect(retentionSchema.parse("365")).toBe(365);
    expect(retentionSchema.safeParse("0").success).toBe(false);
    expect(retentionSchema.safeParse("3651").success).toBe(false);
    expect(retentionSchema.safeParse("12.5").success).toBe(false);
  });

  it("computes the cutoff relative to now", () => {
    expect(retentionCutoff(30, new Date("2026-10-31T00:00:00.000Z")).toISOString()).toBe("2026-10-01T00:00:00.000Z");
  });
});
