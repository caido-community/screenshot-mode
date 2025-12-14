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
  };
  model.value = [...model.value, newRule];
}

function handleUpdate(rules: RedactionRule[]): void {
  model.value = rules;
}
</script>

<template>
  <div>
    <div class="mb-3 flex items-center justify-between">
      <div>
        <label class="block text-sm font-medium text-surface-200">
          Default Redactions
        </label>
        <p class="text-xs text-surface-400">Regex patterns to redact</p>
      </div>
      <Button
        icon="fas fa-plus"
        size="small"
        severity="secondary"
        @click="handleAdd"
      />
    </div>
    <RedactionRulesList :rules="model" @update="handleUpdate" />
  </div>
</template>
