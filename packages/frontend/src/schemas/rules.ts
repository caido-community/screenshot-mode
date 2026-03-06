import { z } from "zod";

import { RuleTargetSchema } from "./common";

import { HighlightMode, MatchMode, RedactionMode } from "@/types";

const HighlightModeSchema = z.enum([
  HighlightMode.Highlight,
  HighlightMode.Rectangle,
]);

const MatchModeSchema = z.enum([MatchMode.Regex, MatchMode.String]);

export const HighlightRuleSchema = z.object({
  id: z.string(),
  regex: z.string(),
  target: RuleTargetSchema,
  color: z.string(),
  mode: HighlightModeSchema,
  matchMode: MatchModeSchema,
});

const RedactionRuleBaseSchema = z.object({
  id: z.string(),
  regex: z.string(),
  target: RuleTargetSchema,
  useCaptureGroups: z.boolean(),
  selectedGroups: z.array(z.number()),
  matchMode: MatchModeSchema,
});

const RedactionModeSpecificSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal(RedactionMode.Blur) }),
  z.object({ mode: z.literal(RedactionMode.Opaque), color: z.string() }),
  z.object({
    mode: z.literal(RedactionMode.Replace),
    replacementText: z.string(),
  }),
]);

export const RedactionRuleSchema = z.intersection(
  RedactionRuleBaseSchema,
  RedactionModeSpecificSchema,
);
