import { describe, expect, it } from "vitest";

import { toVariants } from "./variants";

import { Alteration } from "@/types";

describe("toVariants", () => {
  it("returns a single variant when there are no edits", () => {
    const current = { id: "1", alteration: Alteration.None };

    expect(toVariants(current, [])).toEqual([current]);
  });

  it("orders variants from original to manual edit", () => {
    const current = { id: "3", alteration: Alteration.Manual };
    const edits = [
      { id: "2", alteration: Alteration.Tamper },
      { id: "1", alteration: Alteration.None },
    ];

    expect(toVariants(current, edits)).toEqual([
      { id: "1", alteration: Alteration.None },
      { id: "2", alteration: Alteration.Tamper },
      { id: "3", alteration: Alteration.Manual },
    ]);
  });

  it("drops edits that repeat the current variant", () => {
    const current = { id: "1", alteration: Alteration.None };
    const edits = [
      { id: "1", alteration: Alteration.None },
      { id: "2", alteration: Alteration.Manual },
    ];

    expect(toVariants(current, edits)).toEqual([
      { id: "1", alteration: Alteration.None },
      { id: "2", alteration: Alteration.Manual },
    ]);
  });

  it("keeps only the fields needed to select a variant", () => {
    const current = {
      id: "1",
      alteration: Alteration.None,
      raw: "GET / HTTP/1.1",
    };

    expect(toVariants(current, [])).toEqual([
      { id: "1", alteration: Alteration.None },
    ]);
  });
});
