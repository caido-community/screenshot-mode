<script setup lang="ts">
import Button from "primevue/button";

import { HighlightRulesList } from "@/components/HighlightRulesList";
import type { HighlightRule } from "@/types";

const model = defineModel<HighlightRule[]>({ required: true });

function handleAdd(): void {
  const newRule: HighlightRule = {
    id: crypto.randomUUID(),
    regex: "",
    target: "request",
    color: "#ffff00",
    mode: "highlight",
  };
  model.value = [...model.value, newRule];
}

function handleUpdate(rules: HighlightRule[]): void {
  model.value = rules;
}
</script>

<template>
  <div>
    <div class="mb-3 flex items-center justify-between">
      <div>
        <label class="block text-sm font-medium text-surface-200">
          Default Highlights
        </label>
        <p class="text-xs text-surface-400">Regex patterns to highlight</p>
      </div>
      <Button
        icon="fas fa-plus"
        size="small"
        severity="secondary"
        @click="handleAdd"
      />
    </div>
    <HighlightRulesList :rules="model" @update="handleUpdate" />
  </div>
</template>
