<script setup lang="ts">
import Button from "primevue/button";
import ColorPicker from "primevue/colorpicker";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import { computed } from "vue";

import {
  RedactionMode,
  type RedactionRule,
  RuleTarget,
  type RuleTarget as RuleTargetType,
} from "@/types";

const { rule, inOverlay = false } = defineProps<{
  rule: RedactionRule;
  inOverlay?: boolean;
}>();

const emit = defineEmits<{
  update: [rule: RedactionRule];
  delete: [];
}>();

const appendTo = computed(() => (inOverlay ? "self" : undefined));

const targetOptions = [
  { label: "Request", value: RuleTarget.Request },
  { label: "Response", value: RuleTarget.Response },
];

const modeOptions = [
  { label: "Blur", value: RedactionMode.Blur },
  { label: "Opaque", value: RedactionMode.Opaque },
  { label: "Replace", value: RedactionMode.Replace },
];

function buildRule(
  mode: RedactionMode,
  overrides: Partial<{ regex: string; target: RuleTargetType; color: string }>,
): RedactionRule {
  const base = {
    id: rule.id,
    regex: overrides.regex ?? rule.regex,
    target: overrides.target ?? rule.target,
  };

  if (mode === RedactionMode.Opaque) {
    const currentColor =
      rule.mode === RedactionMode.Opaque ? rule.color : "#000000";
    return {
      ...base,
      mode: RedactionMode.Opaque,
      color: overrides.color ?? currentColor,
    };
  }

  return { ...base, mode };
}

function handleRegexChange(value: string | undefined): void {
  emit("update", buildRule(rule.mode, { regex: value ?? "" }));
}

function handleTargetChange(value: RuleTargetType): void {
  emit("update", buildRule(rule.mode, { target: value }));
}

function handleModeChange(value: RedactionMode): void {
  emit("update", buildRule(value, {}));
}

function handleColorChange(value: string | undefined): void {
  if (value !== undefined && rule.mode === RedactionMode.Opaque) {
    emit("update", buildRule(RedactionMode.Opaque, { color: `#${value}` }));
  }
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
        :append-to="appendTo"
        @update:model-value="handleTargetChange"
      />
      <Select
        :model-value="rule.mode"
        :options="modeOptions"
        option-label="label"
        option-value="value"
        placeholder="Mode"
        class="w-28"
        :append-to="appendTo"
        @update:model-value="handleModeChange"
      />
      <ColorPicker
        v-if="rule.mode === RedactionMode.Opaque"
        :model-value="rule.color.replace('#', '')"
        format="hex"
        :append-to="appendTo"
        @update:model-value="handleColorChange"
      />
    </div>
  </div>
</template>
