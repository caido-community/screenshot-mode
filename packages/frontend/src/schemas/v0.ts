import { z } from "zod";

import { DispositionSchema, WidthSettingSchema } from "./common";
import { HighlightRuleSchema, RedactionRuleSchema } from "./rules";

export const V0SettingsSchema = z.object({
  headersToHide: z.array(z.string()),
  disposition: DispositionSchema,
  width: WidthSettingSchema,
  highlights: z.array(HighlightRuleSchema),
  redactions: z.array(RedactionRuleSchema),
});

export type V0Settings = z.infer<typeof V0SettingsSchema>;
