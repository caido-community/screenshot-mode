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
  <div>
    <label class="mb-2 block text-sm font-medium text-surface-200">
      Content Width
    </label>
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
