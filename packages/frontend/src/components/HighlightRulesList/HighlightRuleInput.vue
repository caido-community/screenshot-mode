<script setup lang="ts">
import Button from "primevue/button";
import ColorPicker from "primevue/colorpicker";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import { computed } from "vue";

import {
  HighlightMode,
  type HighlightRule,
  MatchMode,
  type MatchMode as MatchModeType,
  RuleTarget,
  type RuleTarget as RuleTargetType,
} from "@/types";
import { isPresent } from "@/utils/optional";

const { rule, inOverlay = false } = defineProps<{
  rule: HighlightRule;
  inOverlay?: boolean;
}>();

const emit = defineEmits<{
  update: [rule: HighlightRule];
  delete: [];
}>();

const appendTo = computed(() => (inOverlay ? "self" : undefined));

const targetOptions = [
  { label: "Request", value: RuleTarget.Request },
  { label: "Response", value: RuleTarget.Response },
];

const modeOptions = [
  { label: "Highlight", value: HighlightMode.Highlight },
  { label: "Rectangle", value: HighlightMode.Rectangle },
];

const matchModeOptions = [
  { label: "Regex", value: MatchMode.Regex },
  { label: "String", value: MatchMode.String },
];

function handleRegexChange(value: string | undefined): void {
  emit("update", { ...rule, regex: value ?? "" });
}

function handleTargetChange(value: RuleTargetType): void {
  emit("update", { ...rule, target: value });
}

function handleModeChange(value: HighlightMode): void {
  emit("update", { ...rule, mode: value });
}

function handleColorChange(value: string | undefined): void {
  if (isPresent(value)) {
    emit("update", { ...rule, color: `#${value}` });
  }
}

function handleMatchModeChange(value: MatchModeType): void {
  emit("update", { ...rule, matchMode: value });
}
</script>

<template>
  <div class="flex flex-col gap-2 rounded-lg border border-surface-600 p-3">
    <div class="flex items-center gap-2">
      <InputText
        :model-value="rule.regex"
        :placeholder="
          rule.matchMode === MatchMode.String
            ? 'Literal string'
            : 'Regex pattern'
        "
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
        class="w-30"
        :append-to="appendTo"
        @update:model-value="handleTargetChange"
      />
      <Select
        :model-value="rule.mode"
        :options="modeOptions"
        option-label="label"
        option-value="value"
        placeholder="Mode"
        class="min-w-14"
        :append-to="appendTo"
        @update:model-value="handleModeChange"
      />
      <ColorPicker
        :model-value="rule.color.replace('#', '')"
        format="hex"
        :append-to="appendTo"
        @update:model-value="handleColorChange"
      />
      <SelectButton
        :model-value="rule.matchMode"
        :options="matchModeOptions"
        option-label="label"
        option-value="value"
        @update:model-value="handleMatchModeChange"
      />
    </div>
  </div>
</template>
