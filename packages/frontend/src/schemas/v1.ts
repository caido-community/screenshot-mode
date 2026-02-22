import { z } from "zod";

import {
  DispositionSchema,
  HiddenHeadersSchema,
  WidthSettingSchema,
} from "./common";
import { HighlightRuleSchema, RedactionRuleSchema } from "./rules";

const V1HiddenHeadersSchema = z.union([
  z.array(z.string()),
  HiddenHeadersSchema,
]);

const V1SettingsSchema = z.object({
  headersToHide: V1HiddenHeadersSchema,
  disposition: DispositionSchema,
  width: WidthSettingSchema,
  highlights: z.array(HighlightRuleSchema),
  redactions: z.array(RedactionRuleSchema),
});

const V1TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  settings: V1SettingsSchema,
});

export const V1StoredDataSchema = z.object({
  version: z.literal(1),
  templates: z.array(V1TemplateSchema),
  defaultTemplateId: z.string(),
});

export type V1StoredData = z.infer<typeof V1StoredDataSchema>;
