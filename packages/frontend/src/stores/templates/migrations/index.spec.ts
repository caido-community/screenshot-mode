import { describe, expect, it } from "vitest";

import { migrateStorage } from "@/stores/templates/migrations";
import {
  DEFAULT_SETTINGS,
  Disposition,
  type StoredData,
  WidthMode,
} from "@/types";

function createValidStoredData(): StoredData {
  return {
    version: 1,
    templates: [
      {
        id: "t1",
        name: "Default",
        settings: {
          headersToHide: { both: ["Accept"], request: [], response: [] },
          disposition: Disposition.Horizontal,
          width: { mode: WidthMode.Full },
          highlights: [],
          redactions: [],
        },
      },
    ],
    defaultTemplateId: "t1",
  };
}

describe("migrateStorage", () => {
  describe("v1 format (current)", () => {
    it("returns data as-is when valid", () => {
      const stored = createValidStoredData();
      const { data, migrated } = migrateStorage(stored);

      expect(migrated).toBe(false);
      expect(data).toEqual(stored);
    });

    it("preserves all template data", () => {
      const stored = createValidStoredData();
      const { data } = migrateStorage(stored);

      expect(data.templates).toHaveLength(1);
      expect(data.templates[0]!.name).toBe("Default");
      expect(data.defaultTemplateId).toBe("t1");
    });
  });

  describe("v0 format (legacy raw settings)", () => {
    it("wraps raw settings in a default template", () => {
      const legacySettings = {
        headersToHide: { both: ["Host"], request: [], response: [] },
        disposition: Disposition.Vertical,
        width: { mode: WidthMode.A4 },
        highlights: [],
        redactions: [],
      };

      const { data, migrated } = migrateStorage(legacySettings);

      expect(migrated).toBe(true);
      expect(data.version).toBe(1);
      expect(data.templates).toHaveLength(1);
      expect(data.templates[0]!.name).toBe("Default");
      expect(data.templates[0]!.settings).toEqual(legacySettings);
      expect(data.defaultTemplateId).toBe(data.templates[0]!.id);
    });
  });

  describe("unknown format", () => {
    it("falls back to defaults for null", () => {
      const { data, migrated } = migrateStorage(null);

      expect(migrated).toBe(true);
      expect(data.version).toBe(1);
      expect(data.templates).toHaveLength(1);
      expect(data.templates[0]!.settings).toEqual(DEFAULT_SETTINGS);
    });

    it("falls back to defaults for undefined", () => {
      const { data, migrated } = migrateStorage(undefined);

      expect(migrated).toBe(true);
      expect(data.templates[0]!.settings).toEqual(DEFAULT_SETTINGS);
    });

    it("falls back to defaults for invalid object", () => {
      const { data, migrated } = migrateStorage({ foo: "bar" });

      expect(migrated).toBe(true);
      expect(data.templates[0]!.settings).toEqual(DEFAULT_SETTINGS);
    });

    it("falls back to defaults for empty string", () => {
      const { data, migrated } = migrateStorage("");

      expect(migrated).toBe(true);
      expect(data.templates[0]!.settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe("template IDs", () => {
    it("generates a unique template ID on migration", () => {
      const { data: first } = migrateStorage(null);
      const { data: second } = migrateStorage(null);

      expect(first.templates[0]!.id).not.toBe(second.templates[0]!.id);
    });

    it("sets defaultTemplateId to the created template", () => {
      const { data } = migrateStorage(null);

      expect(data.defaultTemplateId).toBe(data.templates[0]!.id);
    });
  });
});
