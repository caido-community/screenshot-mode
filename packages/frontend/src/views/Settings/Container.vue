<script setup lang="ts">
import Card from "primevue/card";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import { computed, ref, watch } from "vue";

import HeadersSettings from "./HeadersSettings.vue";
import HighlightsSettings from "./HighlightsSettings.vue";
import LayoutSettings from "./LayoutSettings.vue";
import RedactionsSettings from "./RedactionsSettings.vue";
import ResetButton from "./ResetButton.vue";
import WidthSettings from "./WidthSettings.vue";

import { useSDK } from "@/plugins/sdk";
import { getDefaultSettings, saveDefaultSettings } from "@/stores/settings";
import {
  DEFAULT_SETTINGS,
  type Disposition,
  type HighlightRule,
  type RedactionRule,
  type ScreenshotSettings,
  type WidthSetting,
} from "@/types";

const sdk = useSDK();
const confirm = useConfirm();

const settings = ref<ScreenshotSettings>(getDefaultSettings());

const headersToHide = computed({
  get: () => settings.value.headersToHide,
  set: (value: string[]) => {
    settings.value = { ...settings.value, headersToHide: value };
  },
});

const disposition = computed({
  get: () => settings.value.disposition,
  set: (value: Disposition) => {
    settings.value = { ...settings.value, disposition: value };
  },
});

const width = computed({
  get: () => settings.value.width,
  set: (value: WidthSetting) => {
    settings.value = { ...settings.value, width: value };
  },
});

const highlights = computed({
  get: () => settings.value.highlights,
  set: (value: HighlightRule[]) => {
    settings.value = { ...settings.value, highlights: value };
  },
});

const redactions = computed({
  get: () => settings.value.redactions,
  set: (value: RedactionRule[]) => {
    settings.value = { ...settings.value, redactions: value };
  },
});

async function performReset(): Promise<void> {
  settings.value = { ...DEFAULT_SETTINGS };
  await saveDefaultSettings(settings.value);
  sdk.window.showToast("Settings reset to defaults", { variant: "success" });
}

function handleReset(): void {
  confirm.require({
    message: "Are you sure you want to reset all settings to their defaults?",
    header: "Reset Settings",
    icon: "fas fa-exclamation-triangle",
    rejectLabel: "Cancel",
    acceptLabel: "Reset",
    accept: () => {
      performReset();
    },
  });
}

watch(
  settings,
  async (newSettings) => {
    await saveDefaultSettings(newSettings);
  },
  { deep: true },
);
</script>

<template>
  <Card
    class="h-full"
    :pt="{
      body: { class: 'h-full p-0' },
      content: { class: 'h-full p-4' },
    }"
  >
    <template #content>
      <div class="flex h-full flex-col">
        <div class="grid flex-1 gap-6 lg:grid-cols-2">
          <div class="flex flex-col gap-4">
            <HeadersSettings v-model="headersToHide" />
            <LayoutSettings v-model="disposition" />
            <WidthSettings v-model="width" />
          </div>

          <div class="flex flex-col gap-4">
            <HighlightsSettings v-model="highlights" />
            <RedactionsSettings v-model="redactions" />
          </div>
        </div>

        <div class="mt-4 border-t border-surface-600 pt-4">
          <ResetButton @reset="handleReset" />
        </div>
      </div>
    </template>
  </Card>

  <ConfirmDialog />
</template>
