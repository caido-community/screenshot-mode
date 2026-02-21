import { z } from "zod";

import {
  DispositionSchema,
  HiddenHeadersSchema,
  WidthSettingSchema,
} from "./common";
import { HighlightRuleSchema, RedactionRuleSchema } from "./rules";

export const ScreenshotSettingsSchema = z.object({
  headersToHide: HiddenHeadersSchema,
  disposition: DispositionSchema,
  width: WidthSettingSchema,
  highlights: z.array(HighlightRuleSchema),
  redactions: z.array(RedactionRuleSchema),
});

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  settings: ScreenshotSettingsSchema,
});

export const StoredDataSchema = z.object({
  version: z.number(),
  templates: z.array(TemplateSchema),
  defaultTemplateId: z.string(),
});
