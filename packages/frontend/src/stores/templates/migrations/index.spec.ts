import { describe, expect, it } from "vitest";

import { migrateStorage } from "@/stores/templates/migrations";
import {
  DEFAULT_SETTINGS,
  Disposition,
  HighlightMode,
  MatchMode,
  RedactionMode,
  RuleTarget,
  WidthMode,
} from "@/types";

describe("migrateStorage", () => {
  describe("v3 format (current)", () => {
    it("returns data as-is when valid", () => {
      const stored = {
        version: 3,
        templates: [
          {
            id: "t1",
            name: "Default",
            settings: {
              headersToHide: { both: ["Accept"], request: [], response: [] },
              disposition: Disposition.Horizontal,
              width: { mode: WidthMode.Full },
              highlights: [
                {
                  id: "h1",
                  regex: "test",
                  target: RuleTarget.Request,
                  color: "#ff0000",
                  mode: HighlightMode.Highlight,
                  matchMode: MatchMode.String,
                },
              ],
              redactions: [],
            },
          },
        ],
        defaultTemplateId: "t1",
      };

      const { data, migrated } = migrateStorage(stored);

      expect(migrated).toBe(false);
      expect(data).toEqual(stored);
    });
  });

  describe("v2 format (adds matchMode)", () => {
    it("adds matchMode: regex to all rules", () => {
      const stored = {
        version: 2,
        templates: [
          {
            id: "t1",
            name: "Default",
            settings: {
              headersToHide: { both: ["Accept"], request: [], response: [] },
              disposition: Disposition.Horizontal,
              width: { mode: WidthMode.Full },
              highlights: [
                {
                  id: "h1",
                  regex: "test",
                  target: RuleTarget.Request,
                  color: "#ff0000",
                  mode: HighlightMode.Highlight,
                },
              ],
              redactions: [
                {
                  id: "r1",
                  regex: "secret",
                  target: RuleTarget.Response,
                  mode: RedactionMode.Blur,
                  useCaptureGroups: false,
                  selectedGroups: [],
                },
              ],
            },
          },
        ],
        defaultTemplateId: "t1",
      };

      const { data, migrated } = migrateStorage(stored);

      expect(migrated).toBe(true);
      expect(data.version).toBe(3);
      expect(data.templates[0]!.settings.highlights[0]!.matchMode).toBe(
        MatchMode.Regex,
      );
      expect(data.templates[0]!.settings.redactions[0]!.matchMode).toBe(
        MatchMode.Regex,
      );
    });

    it("handles v2 data without rules", () => {
      const stored = {
        version: 2,
        templates: [
          {
            id: "t1",
            name: "Default",
            settings: {
              headersToHide: { both: [], request: [], response: [] },
              disposition: Disposition.Horizontal,
              width: { mode: WidthMode.Full },
              highlights: [],
              redactions: [],
            },
          },
        ],
        defaultTemplateId: "t1",
      };

      const { data, migrated } = migrateStorage(stored);

      expect(migrated).toBe(true);
      expect(data.version).toBe(3);
    });
  });

  describe("v1 format (flat headers)", () => {
    it("migrates flat headers to split format and adds matchMode", () => {
      const stored = {
        version: 1,
        templates: [
          {
            id: "t1",
            name: "Default",
            settings: {
              headersToHide: ["Accept", "Host"],
              disposition: Disposition.Horizontal,
              width: { mode: WidthMode.Full },
              highlights: [],
              redactions: [],
            },
          },
        ],
        defaultTemplateId: "t1",
      };

      const { data, migrated } = migrateStorage(stored);

      expect(migrated).toBe(true);
      expect(data.version).toBe(3);
      expect(data.templates[0]!.settings.headersToHide).toEqual({
        both: ["Accept", "Host"],
        request: [],
        response: [],
      });
    });

    it("preserves already-split headers in v1 data", () => {
      const stored = {
        version: 1,
        templates: [
          {
            id: "t1",
            name: "Default",
            settings: {
              headersToHide: {
                both: ["Accept"],
                request: ["Host"],
                response: [],
              },
              disposition: Disposition.Horizontal,
              width: { mode: WidthMode.Full },
              highlights: [],
              redactions: [],
            },
          },
        ],
        defaultTemplateId: "t1",
      };

      const { data, migrated } = migrateStorage(stored);

      expect(migrated).toBe(true);
      expect(data.version).toBe(3);
      expect(data.templates[0]!.settings.headersToHide).toEqual({
        both: ["Accept"],
        request: ["Host"],
        response: [],
      });
    });
  });

  describe("v0 format (raw settings)", () => {
    it("wraps raw settings in a template and migrates headers", () => {
      const stored = {
        headersToHide: ["Host"],
        disposition: Disposition.Vertical,
        width: { mode: WidthMode.A4 },
        highlights: [],
        redactions: [],
      };

      const { data, migrated } = migrateStorage(stored);

      expect(migrated).toBe(true);
      expect(data.version).toBe(3);
      expect(data.templates).toHaveLength(1);
      expect(data.templates[0]!.name).toBe("Default");
      expect(data.templates[0]!.settings.headersToHide).toEqual({
        both: ["Host"],
        request: [],
        response: [],
      });
      expect(data.defaultTemplateId).toBe(data.templates[0]!.id);
    });
  });

  describe("unknown format", () => {
    it("falls back to defaults for null", () => {
      const { data, migrated } = migrateStorage(null);

      expect(migrated).toBe(true);
      expect(data.version).toBe(3);
      expect(data.templates).toHaveLength(1);
      expect(data.templates[0]!.settings).toEqual(DEFAULT_SETTINGS);
    });

    it("falls back to defaults for undefined", () => {
      const { data, migrated } = migrateStorage(undefined);

      expect(migrated).toBe(true);
      expect(data.version).toBe(3);
      expect(data.templates[0]!.settings).toEqual(DEFAULT_SETTINGS);
    });

    it("falls back to defaults for invalid object", () => {
      const { data, migrated } = migrateStorage({ foo: "bar" });

      expect(migrated).toBe(true);
      expect(data.version).toBe(3);
      expect(data.templates[0]!.settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe("template IDs", () => {
    it("generates unique template IDs on migration", () => {
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
