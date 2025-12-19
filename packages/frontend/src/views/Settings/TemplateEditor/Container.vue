<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { computed, ref, watch } from "vue";

import HeadersSettings from "./HeadersSettings.vue";
import HighlightsSettings from "./HighlightsSettings.vue";
import LayoutSettings from "./LayoutSettings.vue";
import RedactionsSettings from "./RedactionsSettings.vue";
import WidthSettings from "./WidthSettings.vue";

import { useSDK } from "@/plugins/sdk";
import { useTemplatesStore } from "@/stores/templates";
import {
  DEFAULT_SETTINGS,
  type Disposition,
  type HighlightRule,
  type RedactionRule,
  type ScreenshotSettings,
  type Template,
  type WidthSetting,
} from "@/types";

const { template = undefined } = defineProps<{
  template?: Template;
}>();

const emit = defineEmits<{
  cancel: [];
  saved: [];
}>();

const sdk = useSDK();
const { createTemplate, updateTemplate } = useTemplatesStore();

const isEditing = computed(() => template !== undefined);

const name = ref(template?.name ?? "");
const settings = ref<ScreenshotSettings>(
  template?.settings ?? { ...DEFAULT_SETTINGS },
);

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

const canSave = computed(() => name.value.trim().length > 0);

watch(
  () => template,
  (newTemplate) => {
    name.value = newTemplate?.name ?? "";
    settings.value = newTemplate?.settings ?? { ...DEFAULT_SETTINGS };
  },
);

function handleCancel(): void {
  emit("cancel");
}

async function handleSave(): Promise<void> {
  const trimmedName = name.value.trim();
  if (trimmedName === "") {
    sdk.window.showToast("Template name is required", { variant: "error" });
    return;
  }

  if (isEditing.value && template !== undefined) {
    await updateTemplate(template.id, {
      name: trimmedName,
      settings: settings.value,
    });
    sdk.window.showToast("Template updated", { variant: "success" });
  } else {
    await createTemplate(trimmedName, settings.value);
    sdk.window.showToast("Template created", { variant: "success" });
  }

  emit("saved");
}
</script>

<template>
  <div class="flex h-full flex-col p-2">
    <div
      class="flex items-center justify-between border-b border-surface-600 pb-4"
    >
      <div class="flex items-center gap-4">
        <Button
          icon="fas fa-arrow-left"
          severity="secondary"
          text
          @click="handleCancel"
        />
        <h2 class="text-lg font-semibold text-surface-50">
          {{ isEditing ? "Edit Template" : "Create Template" }}
        </h2>
      </div>
      <Button
        label="Save"
        icon="fas fa-save"
        :disabled="!canSave"
        @click="handleSave"
      />
    </div>

    <div class="mt-4 flex-1 overflow-y-auto">
      <div class="mb-6">
        <label class="mb-2 block text-sm font-medium text-surface-200">
          Template Name
        </label>
        <InputText
          v-model="name"
          placeholder="Enter template name"
          class="w-full max-w-md"
        />
      </div>

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
    </div>
  </div>
</template>
