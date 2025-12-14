<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";
import Textarea from "primevue/textarea";
import { computed, onMounted, ref } from "vue";

import { ScreenshotOverlay } from "./ScreenshotOverlay";

import HighlightRulesList from "@/components/HighlightRulesList/Container.vue";
import RedactionRulesList from "@/components/RedactionRulesList/Container.vue";
import { useSDK } from "@/plugins/sdk";
import { getDefaultSettings, saveDefaultSettings } from "@/stores/settings";
import type {
  Disposition,
  HighlightRule,
  RedactionRule,
  ScreenshotSettings,
} from "@/types";

const sdk = useSDK();

const settings = ref<ScreenshotSettings>(getDefaultSettings());
const isSaving = ref(false);

const dispositionOptions = [
  { label: "Side by Side", value: "horizontal" },
  { label: "Stacked", value: "vertical" },
];

const headersText = computed({
  get: () => settings.value.headersToHide.join("\n"),
  set: (value: string) => {
    const headers = value
      .split("\n")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);
    settings.value = { ...settings.value, headersToHide: headers };
  },
});

const disposition = computed({
  get: () => settings.value.disposition,
  set: (value: Disposition) => {
    settings.value = { ...settings.value, disposition: value };
  },
});

function handleHighlightsChange(highlights: HighlightRule[]): void {
  settings.value = { ...settings.value, highlights };
}

function handleRedactionsChange(redactions: RedactionRule[]): void {
  settings.value = { ...settings.value, redactions };
}

function handleAddHighlight(): void {
  const newRule: HighlightRule = {
    id: crypto.randomUUID(),
    regex: "",
    target: "request",
    color: "#ffff00",
    mode: "highlight",
  };
  settings.value = {
    ...settings.value,
    highlights: [...settings.value.highlights, newRule],
  };
}

function handleAddRedaction(): void {
  const newRule: RedactionRule = {
    id: crypto.randomUUID(),
    regex: "",
    target: "request",
    mode: "blur",
  };
  settings.value = {
    ...settings.value,
    redactions: [...settings.value.redactions, newRule],
  };
}

async function handleSave(): Promise<void> {
  isSaving.value = true;
  try {
    await saveDefaultSettings(settings.value);
    sdk.window.showToast("Settings saved successfully", { variant: "success" });
  } catch {
    sdk.window.showToast("Failed to save settings", { variant: "error" });
  } finally {
    isSaving.value = false;
  }
}

function handleReset(): void {
  settings.value = getDefaultSettings();
}

onMounted(() => {
  settings.value = getDefaultSettings();
});
</script>

<template>
  <div class="h-full overflow-auto p-6">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-surface-50">
          Screenshot Mode Settings
        </h1>
        <p class="mt-1 text-surface-400">
          Configure default settings for the screenshot mode overlay.
        </p>
      </div>

      <Card
        :pt="{
          body: { class: 'p-0' },
          content: { class: 'p-6' },
        }"
      >
        <template #content>
          <div class="flex flex-col gap-8">
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
                Headers that will be hidden from both request and response
                (e.g., Cookie, Authorization)
              </p>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-surface-200">
                Default Layout
              </label>
              <SelectButton
                v-model="disposition"
                :options="dispositionOptions"
                option-label="label"
                option-value="value"
              />
            </div>

            <div>
              <div class="mb-3 flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-surface-200">
                    Default Highlights
                  </label>
                  <p class="text-xs text-surface-400">
                    Regex patterns to highlight in requests/responses
                  </p>
                </div>
                <Button
                  label="Add Highlight"
                  icon="fas fa-plus"
                  size="small"
                  severity="secondary"
                  @click="handleAddHighlight"
                />
              </div>
              <HighlightRulesList
                :rules="settings.highlights"
                @update="handleHighlightsChange"
              />
            </div>

            <div>
              <div class="mb-3 flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-surface-200">
                    Default Redactions
                  </label>
                  <p class="text-xs text-surface-400">
                    Regex patterns to redact from requests/responses
                  </p>
                </div>
                <Button
                  label="Add Redaction"
                  icon="fas fa-plus"
                  size="small"
                  severity="secondary"
                  @click="handleAddRedaction"
                />
              </div>
              <RedactionRulesList
                :rules="settings.redactions"
                @update="handleRedactionsChange"
              />
            </div>

            <div
              class="flex justify-end gap-3 border-t border-surface-600 pt-6"
            >
              <Button label="Reset" severity="secondary" @click="handleReset" />
              <Button
                label="Save Settings"
                :loading="isSaving"
                @click="handleSave"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>

  <ScreenshotOverlay />
</template>
