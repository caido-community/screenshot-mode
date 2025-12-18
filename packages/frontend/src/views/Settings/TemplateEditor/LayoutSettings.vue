<script setup lang="ts">
import SelectButton from "primevue/selectbutton";

import { Disposition, type Disposition as DispositionType } from "@/types";

const model = defineModel<DispositionType>({ required: true });

const dispositionOptions = [
  { label: "Side by Side", value: Disposition.Horizontal },
  { label: "Stacked", value: Disposition.Vertical },
];
</script>

<template>
  <div class="rounded-lg border border-surface-600 p-4">
    <div class="mb-3 flex items-center gap-2">
      <div
        class="flex h-5 w-5 items-center justify-center rounded bg-surface-600"
      >
        <i class="fas fa-columns text-xs text-surface-300" />
      </div>
      <label class="text-sm font-medium text-surface-200">Default Layout</label>
    </div>
    <SelectButton
      v-model="model"
      :options="dispositionOptions"
      option-label="label"
      option-value="value"
    />
  </div>
</template>
