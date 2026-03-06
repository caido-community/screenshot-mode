import { z } from "zod";

import {
  DispositionSchema,
  HiddenHeadersSchema,
  WidthSettingSchema,
} from "./common";
import { HighlightRuleSchema, RedactionRuleSchema } from "./rules";

export const V3SettingsSchema = z.object({
  headersToHide: HiddenHeadersSchema,
  disposition: DispositionSchema,
  width: WidthSettingSchema,
  highlights: z.array(HighlightRuleSchema),
  redactions: z.array(RedactionRuleSchema),
});

export const V3TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  settings: V3SettingsSchema,
});

export const V3StoredDataSchema = z.object({
  version: z.literal(3),
  templates: z.array(V3TemplateSchema),
  defaultTemplateId: z.string(),
});
