import { describe, expect, it } from "vitest";

import {
  HighlightRuleSchema,
  RedactionRuleSchema,
  V0SettingsSchema,
  V1StoredDataSchema,
  V2StoredDataSchema,
  V2TemplateSchema,
  WidthSettingSchema,
} from "@/schemas";
import {
  Disposition,
  HighlightMode,
  MatchMode,
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
      matchMode: MatchMode.Regex,
    };
    const result = HighlightRuleSchema.safeParse(rule);
    expect(result.success).toBe(true);
  });

  it("accepts a string match mode", () => {
    const rule = {
      id: "1",
      regex: ".asdf=^asdf$;?",
      target: RuleTarget.Request,
      color: "#ff0000",
      mode: HighlightMode.Highlight,
      matchMode: MatchMode.String,
    };
    const result = HighlightRuleSchema.safeParse(rule);
    expect(result.success).toBe(true);
  });

  it("accepts a rule without matchMode (defaults to regex)", () => {
    const result = HighlightRuleSchema.safeParse({
      id: "1",
      regex: "test",
      target: RuleTarget.Request,
      color: "#ff0000",
      mode: HighlightMode.Highlight,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.matchMode).toBe(MatchMode.Regex);
    }
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
      matchMode: MatchMode.Regex,
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
      matchMode: MatchMode.Regex,
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
      matchMode: MatchMode.Regex,
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
      matchMode: MatchMode.String,
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
      matchMode: MatchMode.Regex,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a redaction without matchMode (defaults to regex)", () => {
    const result = RedactionRuleSchema.safeParse({
      id: "1",
      regex: "secret",
      target: RuleTarget.Response,
      mode: RedactionMode.Blur,
      useCaptureGroups: false,
      selectedGroups: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.matchMode).toBe(MatchMode.Regex);
    }
  });
});

describe("V0SettingsSchema", () => {
  it("accepts raw settings with flat headers", () => {
    const settings = {
      headersToHide: ["Accept", "Host"],
      disposition: Disposition.Horizontal,
      width: { mode: WidthMode.Full },
      highlights: [],
      redactions: [],
    };
    const result = V0SettingsSchema.safeParse(settings);
    expect(result.success).toBe(true);
  });

  it("rejects settings with split headers (belongs to v2)", () => {
    const result = V0SettingsSchema.safeParse({
      headersToHide: { both: [], request: [], response: [] },
      disposition: Disposition.Horizontal,
      width: { mode: WidthMode.Full },
      highlights: [],
      redactions: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("V1StoredDataSchema", () => {
  it("accepts version 1 data with flat headers", () => {
    const data = {
      version: 1,
      templates: [
        {
          id: "t1",
          name: "Default",
          settings: {
            headersToHide: ["Accept"],
            disposition: Disposition.Horizontal,
            width: { mode: WidthMode.Full },
            highlights: [],
            redactions: [],
          },
        },
      ],
      defaultTemplateId: "t1",
    };
    const result = V1StoredDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts version 1 data with split headers", () => {
    const data = {
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
    const result = V1StoredDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects version 2 data", () => {
    const result = V1StoredDataSchema.safeParse({
      version: 2,
      templates: [],
      defaultTemplateId: "t1",
    });
    expect(result.success).toBe(false);
  });
});

describe("V2StoredDataSchema", () => {
  it("accepts version 2 data with rules", () => {
    const data = {
      version: 2,
      templates: [
        {
          id: "abc",
          name: "Default",
          settings: {
            headersToHide: { both: [], request: [], response: [] },
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
      defaultTemplateId: "abc",
    };
    const result = V2StoredDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts version 2 data without headersToShow (defaults to empty)", () => {
    const data = {
      version: 2,
      templates: [
        {
          id: "abc",
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
      defaultTemplateId: "abc",
    };
    const result = V2StoredDataSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.templates[0]!.settings.headersToShow).toEqual({
        both: [],
        request: [],
        response: [],
      });
    }
  });

  it("accepts version 2 data without matchMode in rules (defaults to regex)", () => {
    const data = {
      version: 2,
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
    const result = V2StoredDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects version 1 data", () => {
    const result = V2StoredDataSchema.safeParse({
      version: 1,
      templates: [],
      defaultTemplateId: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects data without version", () => {
    const result = V2StoredDataSchema.safeParse({
      templates: [],
      defaultTemplateId: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects completely invalid data", () => {
    expect(V2StoredDataSchema.safeParse(null).success).toBe(false);
    expect(V2StoredDataSchema.safeParse(undefined).success).toBe(false);
    expect(V2StoredDataSchema.safeParse("string").success).toBe(false);
    expect(V2StoredDataSchema.safeParse(42).success).toBe(false);
  });
});

describe("V2TemplateSchema", () => {
  it("accepts a valid template with matchMode", () => {
    const template = {
      id: "abc",
      name: "My Template",
      settings: {
        headersToHide: { both: [], request: [], response: [] },
        disposition: Disposition.Vertical,
        width: { mode: WidthMode.A4 },
        highlights: [
          {
            id: "h1",
            regex: "password",
            target: RuleTarget.Request,
            color: "#ffff00",
            mode: HighlightMode.Highlight,
            matchMode: MatchMode.String,
          },
        ],
        redactions: [],
      },
    };
    const result = V2TemplateSchema.safeParse(template);
    expect(result.success).toBe(true);
  });

  it("accepts a valid template without matchMode (defaults to regex)", () => {
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
    const result = V2TemplateSchema.safeParse(template);
    expect(result.success).toBe(true);
  });
});
