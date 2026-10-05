import { describe, expect, it } from "vitest";

import { hexToHsb, hsbToHex } from "./color";

describe("hsbToHex", () => {
  it("converts primary and secondary hues", () => {
    expect(hsbToHex({ h: 0, s: 100, b: 100 })).toBe("#ff0000");
    expect(hsbToHex({ h: 60, s: 100, b: 100 })).toBe("#ffff00");
    expect(hsbToHex({ h: 120, s: 100, b: 100 })).toBe("#00ff00");
    expect(hsbToHex({ h: 240, s: 100, b: 100 })).toBe("#0000ff");
    expect(hsbToHex({ h: 300, s: 100, b: 100 })).toBe("#ff00ff");
  });

  it("ignores hue when saturation or brightness is zero", () => {
    expect(hsbToHex({ h: 60, s: 0, b: 100 })).toBe("#ffffff");
    expect(hsbToHex({ h: 60, s: 100, b: 0 })).toBe("#000000");
  });
});

describe("hexToHsb", () => {
  it("converts colors with or without a leading hash", () => {
    expect(hexToHsb("#ffff00")).toEqual({ h: 60, s: 100, b: 100 });
    expect(hexToHsb("0000ff")).toEqual({ h: 240, s: 100, b: 100 });
  });

  it("returns hue 0 for achromatic colors", () => {
    expect(hexToHsb("#000000")).toEqual({ h: 0, s: 0, b: 0 });
    expect(hexToHsb("#ffffff")).toEqual({ h: 0, s: 0, b: 100 });
  });

  it("falls back to black for invalid input", () => {
    expect(hexToHsb("not-a-color")).toEqual({ h: 0, s: 0, b: 0 });
  });

  it("round trips through hsbToHex", () => {
    for (const hex of ["#ffff00", "#3a7bd5", "#808080", "#ff00ff", "#123456"]) {
      expect(hsbToHex(hexToHsb(hex))).toBe(hex);
    }
  });
});
