<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";

import type { RedactionMode, RedactionRule, RuleTarget } from "@/types";

const { rule } = defineProps<{
  rule: RedactionRule;
}>();

const emit = defineEmits<{
  update: [rule: RedactionRule];
  delete: [];
}>();

const targetOptions = [
  { label: "Request", value: "request" },
  { label: "Response", value: "response" },
];

const modeOptions = [
  { label: "Blur", value: "blur" },
  { label: "Black", value: "black" },
  { label: "Replace", value: "replace" },
];

function handleRegexChange(value: string | undefined): void {
  emit("update", { ...rule, regex: value ?? "" });
}

function handleTargetChange(value: RuleTarget): void {
  emit("update", { ...rule, target: value });
}

function handleModeChange(value: RedactionMode): void {
  emit("update", { ...rule, mode: value });
}
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded border border-surface-600 bg-surface-700 p-2"
  >
    <div class="flex items-center gap-2">
      <InputText
        :model-value="rule.regex"
        placeholder="Regex pattern"
        class="flex-1 font-mono text-sm"
        @update:model-value="handleRegexChange"
      />
      <Button
        icon="fas fa-trash"
        severity="danger"
        size="small"
        text
        @click="emit('delete')"
      />
    </div>
    <div class="flex items-center gap-2">
      <Select
        :model-value="rule.target"
        :options="targetOptions"
        option-label="label"
        option-value="value"
        placeholder="Target"
        class="w-28"
        @update:model-value="handleTargetChange"
      />
      <Select
        :model-value="rule.mode"
        :options="modeOptions"
        option-label="label"
        option-value="value"
        placeholder="Mode"
        class="w-28"
        @update:model-value="handleModeChange"
      />
    </div>
  </div>
</template>
