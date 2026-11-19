import { describe, expect, it } from "vitest";
import { croppable, croppedName, rotatedSize } from "./crop";

describe("image cropping helpers", () => {
  it("swaps width and height on quarter turns", () => {
    expect(rotatedSize(1600, 900, 0)).toEqual({ width: 1600, height: 900 });
    expect(rotatedSize(1600, 900, 90)).toEqual({ width: 900, height: 1600 });
    expect(rotatedSize(1600, 900, 270)).toEqual({ width: 900, height: 1600 });
    expect(rotatedSize(1600, 900, 180)).toEqual({ width: 1600, height: 900 });
  });

  it("names the result after the original and the output format, without stacking suffixes", () => {
    expect(croppedName("ofis.jpeg", "image/jpeg")).toBe("ofis-kirpilmis.jpg");
    expect(croppedName("logo.png", "image/png")).toBe("logo-kirpilmis.png");
    expect(croppedName("ofis-kirpilmis.jpg", "image/jpeg")).toBe("ofis-kirpilmis.jpg");
  });

  it("leaves vector images alone", () => {
    expect(croppable(new File([""], "a.svg", { type: "image/svg+xml" }))).toBe(false);
    expect(croppable(new File([""], "a.webp", { type: "image/webp" }))).toBe(true);
  });
});
