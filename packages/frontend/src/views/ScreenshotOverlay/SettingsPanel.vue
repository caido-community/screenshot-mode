<script setup lang="ts">
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import Textarea from "primevue/textarea";
import { computed } from "vue";

import { HighlightRulesList } from "@/components/HighlightRulesList";
import { RedactionRulesList } from "@/components/RedactionRulesList";
import type {
  Disposition,
  HighlightRule,
  RedactionRule,
  ScreenshotSettings,
} from "@/types";

const { settings } = defineProps<{
  settings: ScreenshotSettings;
}>();

const emit = defineEmits<{
  update: [settings: ScreenshotSettings];
}>();

const dispositionOptions = [
  { label: "Side by Side", value: "horizontal" },
  { label: "Stacked", value: "vertical" },
];

const headersText = computed({
  get: () => settings.headersToHide.join("\n"),
  set: (value: string) => {
    const headers = value
      .split("\n")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);
    emit("update", { ...settings, headersToHide: headers });
  },
});

const disposition = computed({
  get: () => settings.disposition,
  set: (value: Disposition) => {
    emit("update", { ...settings, disposition: value });
  },
});

function handleHighlightsChange(highlights: HighlightRule[]): void {
  emit("update", { ...settings, highlights });
}

function handleRedactionsChange(redactions: RedactionRule[]): void {
  emit("update", { ...settings, redactions });
}

function handleAddHighlight(): void {
  const newRule: HighlightRule = {
    id: crypto.randomUUID(),
    regex: "",
    target: "request",
    color: "#ffff00",
    mode: "highlight",
  };
  emit("update", {
    ...settings,
    highlights: [...settings.highlights, newRule],
  });
}

function handleAddRedaction(): void {
  const newRule: RedactionRule = {
    id: crypto.randomUUID(),
    regex: "",
    target: "request",
    mode: "blur",
  };
  emit("update", {
    ...settings,
    redactions: [...settings.redactions, newRule],
  });
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <label class="mb-2 block text-sm font-medium text-surface-200">
        Headers to Hide
      </label>
      <Textarea
        v-model="headersText"
        rows="4"
        placeholder="Enter headers to hide, one per line"
        class="w-full font-mono text-sm"
      />
      <p class="mt-1 text-xs text-surface-400">
        One header name per line (e.g., Cookie, Authorization)
      </p>
    </div>

    <div>
      <label class="mb-2 block text-sm font-medium text-surface-200">
        Layout
      </label>
      <SelectButton
        v-model="disposition"
        :options="dispositionOptions"
        option-label="label"
        option-value="value"
        class="w-full"
      />
    </div>

    <div>
      <div class="mb-2 flex items-center justify-between">
        <label class="text-sm font-medium text-surface-200">Highlights</label>
        <Button
          icon="fas fa-plus"
          size="small"
          severity="secondary"
          @click="handleAddHighlight"
        />
      </div>
      <HighlightRulesList
        :rules="settings.highlights"
        in-overlay
        @update="handleHighlightsChange"
      />
    </div>

    <div>
      <div class="mb-2 flex items-center justify-between">
        <label class="text-sm font-medium text-surface-200">Redactions</label>
        <Button
          icon="fas fa-plus"
          size="small"
          severity="secondary"
          @click="handleAddRedaction"
        />
      </div>
      <RedactionRulesList
        :rules="settings.redactions"
        in-overlay
        @update="handleRedactionsChange"
      />
    </div>
  </div>
</template>
