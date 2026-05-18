<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";

const showTimestamp = defineModel<boolean>({ required: true });
</script>

<template>
  <div class="rounded-lg border border-surface-600 p-4">
    <div class="mb-3 flex items-center gap-2">
      <div
        class="flex h-5 w-5 items-center justify-center rounded bg-surface-600"
      >
        <i class="fas fa-info-circle text-xs text-surface-300" />
      </div>
      <label class="text-sm font-medium text-surface-200">Metadata</label>
    </div>
    <div class="flex items-center justify-between">
      <label class="text-sm text-surface-200">Show Timestamp</label>
      <ToggleSwitch v-model="showTimestamp" />
    </div>
  </div>
</template>
