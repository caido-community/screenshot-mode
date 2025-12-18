<script setup lang="ts">
import Button from "primevue/button";

import { RedactionRulesList } from "@/components/RedactionRulesList";
import { RedactionMode, type RedactionRule, RuleTarget } from "@/types";

const model = defineModel<RedactionRule[]>({ required: true });

function handleAdd(): void {
  const newRule: RedactionRule = {
    id: crypto.randomUUID(),
    regex: "",
    target: RuleTarget.Request,
    mode: RedactionMode.Blur,
    useCaptureGroups: false,
    selectedGroups: [],
  };
  model.value = [...model.value, newRule];
}

function handleUpdate(rules: RedactionRule[]): void {
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
          <i class="fas fa-mask text-xs text-surface-300" />
        </div>
        <label class="text-sm font-medium text-surface-200"
          >Default Redactions</label
        >
      </div>
      <Button
        icon="fas fa-plus"
        size="small"
        severity="secondary"
        @click="handleAdd"
      />
    </div>
    <p class="mb-3 text-xs text-surface-400">Regex patterns to redact</p>
    <RedactionRulesList :rules="model" @update="handleUpdate" />
  </div>
</template>
