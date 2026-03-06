import { z } from "zod";

import {
  DispositionSchema,
  HiddenHeadersSchema,
  RuleTargetSchema,
  WidthSettingSchema,
} from "./common";

import { HighlightMode, RedactionMode } from "@/types";

const V2HighlightModeSchema = z.enum([
  HighlightMode.Highlight,
  HighlightMode.Rectangle,
]);

const V2HighlightRuleSchema = z.object({
  id: z.string(),
  regex: z.string(),
  target: RuleTargetSchema,
  color: z.string(),
  mode: V2HighlightModeSchema,
});

const V2RedactionRuleBaseSchema = z.object({
  id: z.string(),
  regex: z.string(),
  target: RuleTargetSchema,
  useCaptureGroups: z.boolean(),
  selectedGroups: z.array(z.number()),
});

const V2RedactionModeSpecificSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal(RedactionMode.Blur) }),
  z.object({ mode: z.literal(RedactionMode.Opaque), color: z.string() }),
  z.object({
    mode: z.literal(RedactionMode.Replace),
    replacementText: z.string(),
  }),
]);

const V2RedactionRuleSchema = z.intersection(
  V2RedactionRuleBaseSchema,
  V2RedactionModeSpecificSchema,
);

const V2SettingsSchema = z.object({
  headersToHide: HiddenHeadersSchema,
  disposition: DispositionSchema,
  width: WidthSettingSchema,
  highlights: z.array(V2HighlightRuleSchema),
  redactions: z.array(V2RedactionRuleSchema),
});

export const V2TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  settings: V2SettingsSchema,
});

export const V2StoredDataSchema = z.object({
  version: z.literal(2),
  templates: z.array(V2TemplateSchema),
  defaultTemplateId: z.string(),
});

export type V2StoredData = z.infer<typeof V2StoredDataSchema>;
