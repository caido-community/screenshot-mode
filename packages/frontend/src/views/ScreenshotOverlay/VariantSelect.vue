<script setup lang="ts">
import Select from "primevue/select";

import { Alteration, type Variant } from "@/types";

const ALTERATION_LABELS: Record<Alteration, string> = {
  [Alteration.None]: "Original",
  [Alteration.Tamper]: "Automated Edit",
  [Alteration.Manual]: "Manual Edit",
};

const { label, variants, selectedId } = defineProps<{
  label: string;
  variants: Variant[];
  selectedId: string;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();

function getVariantLabel(variant: Variant): string {
  return ALTERATION_LABELS[variant.alteration];
}

function handleSelect(id: string): void {
  emit("select", id);
}
</script>

<template>
  <div v-if="variants.length > 1" class="flex items-center gap-2">
    <span class="text-xs font-medium uppercase text-surface-400">
      {{ label }}
    </span>
    <Select
      :model-value="selectedId"
      :options="variants"
      :option-label="getVariantLabel"
      option-value="id"
      class="w-40"
      append-to="self"
      @update:model-value="handleSelect"
    />
  </div>
</template>
