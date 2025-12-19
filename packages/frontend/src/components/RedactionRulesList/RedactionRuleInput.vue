<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import ColorPicker from "primevue/colorpicker";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
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

const selectedGroups = computed(() => {
  if (rule.selectedGroups.length > 0) {
    return rule.selectedGroups;
  }
  return undefined;
});

const targetOptions = [
  { label: "Request", value: RuleTarget.Request },
  { label: "Response", value: RuleTarget.Response },
];

const modeOptions = [
  { label: "Blur", value: RedactionMode.Blur },
  { label: "Opaque", value: RedactionMode.Opaque },
  { label: "Replace", value: RedactionMode.Replace },
];

const captureGroupCount = computed(() => {
  if (rule.regex.length === 0) {
    return 0;
  }

  try {
    const regex = new RegExp(rule.regex);
    const testMatch = regex.exec("");
    return testMatch !== null
      ? testMatch.length - 1
      : countCaptureGroups(rule.regex);
  } catch {
    return countCaptureGroups(rule.regex);
  }
});

function countCaptureGroups(pattern: string): number {
  let count = 0;
  let inCharClass = false;
  let escaped = false;

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "[") {
      inCharClass = true;
      continue;
    }

    if (char === "]" && inCharClass) {
      inCharClass = false;
      continue;
    }

    if (inCharClass) {
      continue;
    }

    if (char === "(" && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      if (next !== "?") {
        count++;
      } else if (
        i + 2 < pattern.length &&
        pattern[i + 2] === "<" &&
        pattern[i + 3] !== "=" &&
        pattern[i + 3] !== "!"
      ) {
        count++;
      }
    }
  }

  return count;
}

const groupOptions = computed(() => {
  const options: Array<{ label: string; value: number }> = [];
  for (let i = 1; i <= captureGroupCount.value; i++) {
    options.push({ label: `Group ${i}`, value: i });
  }
  return options;
});

const hasCaptureGroups = computed(() => captureGroupCount.value > 0);

function buildRule(
  mode: RedactionMode,
  overrides: Partial<{
    regex: string;
    target: RuleTargetType;
    color: string;
    replacementText: string;
    useCaptureGroups: boolean;
    selectedGroups: number[];
  }>,
): RedactionRule {
  const base = {
    id: rule.id,
    regex: overrides.regex ?? rule.regex,
    target: overrides.target ?? rule.target,
    useCaptureGroups: overrides.useCaptureGroups ?? rule.useCaptureGroups,
    selectedGroups: overrides.selectedGroups ?? rule.selectedGroups,
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

  if (mode === RedactionMode.Replace) {
    const currentText =
      rule.mode === RedactionMode.Replace ? rule.replacementText : "[REDACTED]";
    return {
      ...base,
      mode: RedactionMode.Replace,
      replacementText: overrides.replacementText ?? currentText,
    };
  }

  return { ...base, mode };
}

function handleRegexChange(value: string | undefined): void {
  const newRegex = value ?? "";
  const oldGroupCount = captureGroupCount.value;
  const newGroupCount = countCaptureGroupsFromString(newRegex);

  if (newGroupCount === 0) {
    emit(
      "update",
      buildRule(rule.mode, {
        regex: newRegex,
        useCaptureGroups: false,
        selectedGroups: [],
      }),
    );
    return;
  }

  if (rule.useCaptureGroups === false && newGroupCount > 0) {
    const allGroups: number[] = [];
    for (let i = 1; i <= newGroupCount; i++) {
      allGroups.push(i);
    }
    emit(
      "update",
      buildRule(rule.mode, {
        regex: newRegex,
        useCaptureGroups: true,
        selectedGroups: allGroups,
      }),
    );
    return;
  }

  const validGroups = rule.selectedGroups.filter((g) => g <= newGroupCount);

  const newGroups: number[] = [];
  for (let i = oldGroupCount + 1; i <= newGroupCount; i++) {
    newGroups.push(i);
  }

  const selectedGroups = [...validGroups, ...newGroups];

  emit("update", buildRule(rule.mode, { regex: newRegex, selectedGroups }));
}

function countCaptureGroupsFromString(pattern: string): number {
  if (pattern.length === 0) {
    return 0;
  }
  return countCaptureGroups(pattern);
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

function handleGroupsChange(value: number[] | undefined): void {
  emit("update", buildRule(rule.mode, { selectedGroups: value ?? [] }));
}

function handleUseCaptureGroupsChange(value: boolean): void {
  if (value) {
    const allGroups = groupOptions.value.map((o) => o.value);
    emit(
      "update",
      buildRule(rule.mode, {
        useCaptureGroups: true,
        selectedGroups: allGroups,
      }),
    );
  } else {
    emit(
      "update",
      buildRule(rule.mode, { useCaptureGroups: false, selectedGroups: [] }),
    );
  }
}

function handleReplacementTextChange(value: string | undefined): void {
  if (rule.mode === RedactionMode.Replace) {
    emit(
      "update",
      buildRule(RedactionMode.Replace, {
        replacementText: value ?? "[REDACTED]",
      }),
    );
  }
}
</script>

<template>
  <div class="flex flex-col gap-2 rounded-lg border border-surface-600 p-3">
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
      <InputText
        v-if="rule.mode === RedactionMode.Replace"
        :model-value="rule.replacementText"
        placeholder="[REDACTED]"
        class="w-32 font-mono text-sm"
        @update:model-value="handleReplacementTextChange"
      />
    </div>
    <div class="flex items-center gap-2">
      <Checkbox
        :model-value="rule.useCaptureGroups"
        :disabled="!hasCaptureGroups"
        binary
        @update:model-value="handleUseCaptureGroupsChange"
      />
      <MultiSelect
        :model-value="rule.useCaptureGroups ? selectedGroups : undefined"
        :options="groupOptions"
        option-label="label"
        option-value="value"
        :placeholder="hasCaptureGroups ? 'Select groups' : 'No capture groups'"
        class="flex-1"
        :disabled="!rule.useCaptureGroups || !hasCaptureGroups"
        :append-to="appendTo"
        filter
        @update:model-value="handleGroupsChange"
      />
    </div>
  </div>
</template>
