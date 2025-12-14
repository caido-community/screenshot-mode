<script setup lang="ts">
import HighlightRuleInput from "./HighlightRuleInput.vue";

import type { HighlightRule } from "@/types";

const { rules, inOverlay = false } = defineProps<{
  rules: HighlightRule[];
  inOverlay?: boolean;
}>();

const emit = defineEmits<{
  update: [rules: HighlightRule[]];
}>();

function handleRuleUpdate(index: number, rule: HighlightRule): void {
  const updated = [...rules];
  updated[index] = rule;
  emit("update", updated);
}

function handleRuleDelete(index: number): void {
  const updated = rules.filter((_, i) => i !== index);
  emit("update", updated);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div v-if="rules.length === 0" class="text-sm text-surface-400">
      No highlights configured
    </div>
    <HighlightRuleInput
      v-for="(rule, index) in rules"
      :key="rule.id"
      :rule="rule"
      :in-overlay="inOverlay"
      @update="handleRuleUpdate(index, $event)"
      @delete="handleRuleDelete(index)"
    />
  </div>
</template>
