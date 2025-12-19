<script setup lang="ts">
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import Textarea from "primevue/textarea";
import { computed } from "vue";

import { HighlightRulesList } from "@/components/HighlightRulesList";
import { RedactionRulesList } from "@/components/RedactionRulesList";
import { useTemplatesStore } from "@/stores/templates";
import {
  Disposition,
  type Disposition as DispositionType,
  HighlightMode,
  type HighlightRule,
  RedactionMode,
  type RedactionRule,
  RuleTarget,
  type ScreenshotSettings,
  type Template,
  WidthMode,
  type WidthSetting,
} from "@/types";

const { settings, selectedTemplateId } = defineProps<{
  settings: ScreenshotSettings;
  selectedTemplateId: string;
}>();

const emit = defineEmits<{
  update: [settings: ScreenshotSettings];
  templateChange: [templateId: string];
  resetToTemplate: [];
}>();

const templatesStore = useTemplatesStore();
const { templates } = storeToRefs(templatesStore);

const selectedTemplate = computed({
  get: () => selectedTemplateId,
  set: (value: string) => {
    emit("templateChange", value);
  },
});

function getTemplateLabel(template: Template): string {
  return template.name;
}

const dispositionOptions = [
  { label: "Side by Side", value: Disposition.Horizontal },
  { label: "Stacked", value: Disposition.Vertical },
];

const widthOptions = [
  { label: "Full Width", value: WidthMode.Full },
  { label: "Custom (px)", value: WidthMode.Pixel },
  { label: "A4 (595px)", value: WidthMode.A4 },
  { label: "Letter (612px)", value: WidthMode.Letter },
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
  set: (value: DispositionType) => {
    emit("update", { ...settings, disposition: value });
  },
});

const widthMode = computed({
  get: () => settings.width.mode,
  set: (value: WidthMode) => {
    let newWidth: WidthSetting;
    if (value === WidthMode.Pixel) {
      newWidth = { mode: WidthMode.Pixel, value: 800 };
    } else if (value === WidthMode.A4) {
      newWidth = { mode: WidthMode.A4 };
    } else if (value === WidthMode.Letter) {
      newWidth = { mode: WidthMode.Letter };
    } else {
      newWidth = { mode: WidthMode.Full };
    }
    emit("update", { ...settings, width: newWidth });
  },
});

const widthPixelValue = computed({
  get: () =>
    settings.width.mode === WidthMode.Pixel ? settings.width.value : 800,
  set: (value: number) => {
    if (settings.width.mode === WidthMode.Pixel) {
      emit("update", {
        ...settings,
        width: { mode: WidthMode.Pixel, value },
      });
    }
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
    target: RuleTarget.Request,
    color: "#ffff00",
    mode: HighlightMode.Highlight,
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
    target: RuleTarget.Request,
    mode: RedactionMode.Blur,
    useCaptureGroups: false,
    selectedGroups: [],
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
        Template
      </label>
      <div class="flex items-center gap-2">
        <Select
          v-model="selectedTemplate"
          :options="templates"
          :option-label="getTemplateLabel"
          option-value="id"
          class="flex-1"
          append-to="self"
        />
        <Button
          icon="fas fa-rotate-right"
          size="small"
          severity="secondary"
          title="Reset to template defaults"
          @click="emit('resetToTemplate')"
        />
      </div>
    </div>

    <div>
      <div class="mb-2">
        <label class="block text-sm font-medium text-surface-200">
          Headers to Hide
        </label>
        <p class="text-xs text-surface-400">One header per line</p>
      </div>
      <Textarea
        v-model="headersText"
        rows="4"
        placeholder="Enter headers to hide"
        class="w-full font-mono text-sm"
      />
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
      <label class="mb-2 block text-sm font-medium text-surface-200">
        Content Width
      </label>
      <div class="flex items-center gap-2">
        <Select
          v-model="widthMode"
          :options="widthOptions"
          option-label="label"
          option-value="value"
          class="w-40"
          append-to="self"
        />
        <InputNumber
          v-if="settings.width.mode === WidthMode.Pixel"
          v-model="widthPixelValue"
          :min="200"
          :max="2000"
          suffix="px"
          class="w-32"
        />
      </div>
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
