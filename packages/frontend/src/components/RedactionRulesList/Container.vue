<script setup lang="ts">
import RedactionRuleInput from "./RedactionRuleInput.vue";

import type { RedactionRule } from "@/types";

const { rules } = defineProps<{
  rules: RedactionRule[];
}>();

const emit = defineEmits<{
  update: [rules: RedactionRule[]];
}>();

function handleRuleUpdate(index: number, rule: RedactionRule): void {
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
      No redactions configured
    </div>
    <RedactionRuleInput
      v-for="(rule, index) in rules"
      :key="rule.id"
      :rule="rule"
      @update="handleRuleUpdate(index, $event)"
      @delete="handleRuleDelete(index)"
    />
  </div>
</template>
