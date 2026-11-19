import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyPreviewToken } from "@/lib/preview-token";

const secret = "test-secret";
function token(payload: object, key = secret) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${createHmac("sha256", key).update(encoded).digest("base64url")}`;
}
const exp = Math.floor(Date.now() / 1000) + 300;

describe("preview token", () => {
  it("accepts a valid token from the admin", () => {
    expect(verifyPreviewToken(token({ siteKey: "main", path: "/blog/hello", exp }), secret)?.path).toBe("/blog/hello");
  });
  it("rejects wrong signatures, other sites, expired tokens and open redirects", () => {
    expect(verifyPreviewToken(token({ siteKey: "main", path: "/", exp }, "other"), secret)).toBeNull();
    expect(verifyPreviewToken(token({ siteKey: "other", path: "/", exp }), secret)).toBeNull();
    expect(verifyPreviewToken(token({ siteKey: "main", path: "/", exp: 1 }), secret)).toBeNull();
    expect(verifyPreviewToken(token({ siteKey: "main", path: "//evil.example", exp }), secret)).toBeNull();
    expect(verifyPreviewToken("garbage", secret)).toBeNull();
  });
});
