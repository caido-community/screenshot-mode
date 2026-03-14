import { z } from "zod";

import { Disposition, RuleTarget, WidthMode } from "@/types";

export const RuleTargetSchema = z.enum([
  RuleTarget.Request,
  RuleTarget.Response,
]);

export const HiddenHeadersSchema = z.object({
  both: z.array(z.string()),
  request: z.array(z.string()),
  response: z.array(z.string()),
});

export const ShownHeadersSchema = z.object({
  both: z.array(z.string()),
  request: z.array(z.string()),
  response: z.array(z.string()),
});

export const WidthSettingSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal(WidthMode.Full) }),
  z.object({ mode: z.literal(WidthMode.Pixel), value: z.number() }),
  z.object({ mode: z.literal(WidthMode.A4) }),
  z.object({ mode: z.literal(WidthMode.Letter) }),
]);

export const DispositionSchema = z.enum([
  Disposition.Horizontal,
  Disposition.Vertical,
]);
