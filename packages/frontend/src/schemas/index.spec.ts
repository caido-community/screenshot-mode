import { describe, expect, it } from "vitest";

import {
  HighlightRuleSchema,
  RedactionRuleSchema,
  ScreenshotSettingsSchema,
  StoredDataSchema,
  TemplateSchema,
  WidthSettingSchema,
} from "@/schemas";
import {
  Disposition,
  HighlightMode,
  RedactionMode,
  RuleTarget,
  WidthMode,
} from "@/types";

describe("WidthSettingSchema", () => {
  it("accepts a full width setting", () => {
    const result = WidthSettingSchema.safeParse({ mode: "full" });
    expect(result.success).toBe(true);
  });

  it("accepts a pixel width setting with value", () => {
    const result = WidthSettingSchema.safeParse({
      mode: "pixel",
      value: 800,
    });
    expect(result.success).toBe(true);
  });

  it("rejects pixel mode without value", () => {
    const result = WidthSettingSchema.safeParse({ mode: "pixel" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown mode", () => {
    const result = WidthSettingSchema.safeParse({ mode: "unknown" });
    expect(result.success).toBe(false);
  });
});

describe("HighlightRuleSchema", () => {
  it("accepts a valid highlight rule", () => {
    const rule = {
      id: "1",
      regex: "test",
      target: RuleTarget.Request,
      color: "#ff0000",
      mode: HighlightMode.Highlight,
    };
    const result = HighlightRuleSchema.safeParse(rule);
    expect(result.success).toBe(true);
  });

  it("rejects a rule with missing fields", () => {
    const result = HighlightRuleSchema.safeParse({ id: "1" });
    expect(result.success).toBe(false);
  });

  it("rejects a rule with invalid target", () => {
    const result = HighlightRuleSchema.safeParse({
      id: "1",
      regex: "test",
      target: "invalid",
      color: "#ff0000",
      mode: HighlightMode.Highlight,
    });
    expect(result.success).toBe(false);
  });
});

describe("RedactionRuleSchema", () => {
  it("accepts a blur redaction", () => {
    const rule = {
      id: "1",
      regex: "secret",
      target: RuleTarget.Response,
      mode: RedactionMode.Blur,
      useCaptureGroups: false,
      selectedGroups: [],
    };
    const result = RedactionRuleSchema.safeParse(rule);
    expect(result.success).toBe(true);
  });

  it("accepts an opaque redaction with color", () => {
    const rule = {
      id: "1",
      regex: "secret",
      target: RuleTarget.Response,
      mode: RedactionMode.Opaque,
      color: "#000000",
      useCaptureGroups: false,
      selectedGroups: [],
    };
    const result = RedactionRuleSchema.safeParse(rule);
    expect(result.success).toBe(true);
  });

  it("rejects opaque redaction without color", () => {
    const result = RedactionRuleSchema.safeParse({
      id: "1",
      regex: "secret",
      target: RuleTarget.Response,
      mode: RedactionMode.Opaque,
      useCaptureGroups: false,
      selectedGroups: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a replace redaction with replacement text", () => {
    const rule = {
      id: "1",
      regex: "secret",
      target: RuleTarget.Request,
      mode: RedactionMode.Replace,
      replacementText: "[REDACTED]",
      useCaptureGroups: true,
      selectedGroups: [1],
    };
    const result = RedactionRuleSchema.safeParse(rule);
    expect(result.success).toBe(true);
  });

  it("rejects replace redaction without replacement text", () => {
    const result = RedactionRuleSchema.safeParse({
      id: "1",
      regex: "secret",
      target: RuleTarget.Request,
      mode: RedactionMode.Replace,
      useCaptureGroups: false,
      selectedGroups: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("ScreenshotSettingsSchema", () => {
  it("accepts valid settings", () => {
    const settings = {
      headersToHide: { both: ["Accept"], request: [], response: [] },
      disposition: Disposition.Horizontal,
      width: { mode: WidthMode.Full },
      highlights: [],
      redactions: [],
    };
    const result = ScreenshotSettingsSchema.safeParse(settings);
    expect(result.success).toBe(true);
  });

  it("rejects settings with missing fields", () => {
    const result = ScreenshotSettingsSchema.safeParse({
      disposition: "horizontal",
    });
    expect(result.success).toBe(false);
  });
});

describe("TemplateSchema", () => {
  it("accepts a valid template", () => {
    const template = {
      id: "abc",
      name: "My Template",
      settings: {
        headersToHide: { both: [], request: [], response: [] },
        disposition: Disposition.Vertical,
        width: { mode: WidthMode.A4 },
        highlights: [],
        redactions: [],
      },
    };
    const result = TemplateSchema.safeParse(template);
    expect(result.success).toBe(true);
  });
});

describe("StoredDataSchema", () => {
  it("accepts valid stored data", () => {
    const data = {
      version: 1,
      templates: [
        {
          id: "abc",
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
      defaultTemplateId: "abc",
    };
    const result = StoredDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects data without version", () => {
    const result = StoredDataSchema.safeParse({
      templates: [],
      defaultTemplateId: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects completely invalid data", () => {
    expect(StoredDataSchema.safeParse(null).success).toBe(false);
    expect(StoredDataSchema.safeParse(undefined).success).toBe(false);
    expect(StoredDataSchema.safeParse("string").success).toBe(false);
    expect(StoredDataSchema.safeParse(42).success).toBe(false);
  });
});
