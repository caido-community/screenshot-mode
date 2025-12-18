<script setup lang="ts">
import Button from "primevue/button";

import { HighlightRulesList } from "@/components/HighlightRulesList";
import { HighlightMode, type HighlightRule, RuleTarget } from "@/types";

const model = defineModel<HighlightRule[]>({ required: true });

function handleAdd(): void {
  const newRule: HighlightRule = {
    id: crypto.randomUUID(),
    regex: "",
    target: RuleTarget.Request,
    color: "#ffff00",
    mode: HighlightMode.Highlight,
  };
  model.value = [...model.value, newRule];
}

function handleUpdate(rules: HighlightRule[]): void {
  model.value = rules;
}
</script>

<template>
  <div class="rounded-lg border border-surface-600 p-4">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="flex h-5 w-5 items-center justify-center rounded bg-surface-600"
        >
          <i class="fas fa-highlighter text-xs text-surface-300" />
        </div>
        <label class="text-sm font-medium text-surface-200"
          >Default Highlights</label
        >
      </div>
      <Button
        icon="fas fa-plus"
        size="small"
        severity="secondary"
        @click="handleAdd"
      />
    </div>
    <p class="mb-3 text-xs text-surface-400">Regex patterns to highlight</p>
    <HighlightRulesList :rules="model" @update="handleUpdate" />
  </div>
</template>
