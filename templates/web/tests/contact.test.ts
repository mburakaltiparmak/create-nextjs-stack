import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validation/contact";

const valid = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello, I would like a quote.", privacy: true };

describe("contact form schema", () => {
  it("accepts a complete submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it("requires name, a valid email, a real message and consent", () => {
    expect(contactSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, privacy: false }).success).toBe(false);
  });
});
