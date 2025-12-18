<script setup lang="ts">
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import { computed } from "vue";

import { WidthMode, type WidthSetting } from "@/types";

const model = defineModel<WidthSetting>({ required: true });

const widthOptions = [
  { label: "Full Width", value: WidthMode.Full },
  { label: "Custom (px)", value: WidthMode.Pixel },
  { label: "A4 (595px)", value: WidthMode.A4 },
  { label: "Letter (612px)", value: WidthMode.Letter },
];

const selectedMode = computed({
  get: () => model.value.mode,
  set: (value: WidthMode) => {
    if (value === WidthMode.Pixel) {
      model.value = { mode: WidthMode.Pixel, value: 800 };
    } else if (value === WidthMode.A4) {
      model.value = { mode: WidthMode.A4 };
    } else if (value === WidthMode.Letter) {
      model.value = { mode: WidthMode.Letter };
    } else {
      model.value = { mode: WidthMode.Full };
    }
  },
});

const pixelValue = computed({
  get: () => (model.value.mode === WidthMode.Pixel ? model.value.value : 800),
  set: (value: number) => {
    if (model.value.mode === WidthMode.Pixel) {
      model.value = { mode: WidthMode.Pixel, value };
    }
  },
});
</script>

<template>
  <div class="rounded-lg border border-surface-600 p-4">
    <div class="mb-3 flex items-center gap-2">
      <div
        class="flex h-5 w-5 items-center justify-center rounded bg-surface-600"
      >
        <i class="fas fa-arrows-alt-h text-xs text-surface-300" />
      </div>
      <label class="text-sm font-medium text-surface-200">Content Width</label>
    </div>
    <div class="flex items-center gap-2">
      <Select
        v-model="selectedMode"
        :options="widthOptions"
        option-label="label"
        option-value="value"
        class="w-40"
      />
      <InputNumber
        v-if="model.mode === WidthMode.Pixel"
        v-model="pixelValue"
        :min="200"
        :max="2000"
        suffix="px"
        class="w-32"
      />
    </div>
  </div>
</template>
