<script setup lang="ts">
import SelectButton from "primevue/selectbutton";

import type { Disposition } from "@/types";

const model = defineModel<Disposition>({ required: true });

const dispositionOptions = [
  { label: "Side by Side", value: "horizontal" },
  { label: "Stacked", value: "vertical" },
];
</script>

<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-surface-200">
      Default Layout
    </label>
    <SelectButton
      v-model="model"
      :options="dispositionOptions"
      option-label="label"
      option-value="value"
    />
  </div>
</template>
