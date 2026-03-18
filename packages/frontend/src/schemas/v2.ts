import { z } from "zod";

import {
  DispositionSchema,
  HiddenHeadersSchema,
  WidthSettingSchema,
} from "./common";
import { HighlightRuleSchema, RedactionRuleSchema } from "./rules";

export const V2SettingsSchema = z.object({
  headersToHide: HiddenHeadersSchema,
  disposition: DispositionSchema,
  width: WidthSettingSchema,
  highlights: z.array(HighlightRuleSchema),
  redactions: z.array(RedactionRuleSchema),
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
