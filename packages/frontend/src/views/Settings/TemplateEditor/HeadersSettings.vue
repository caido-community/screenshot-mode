<script setup lang="ts">
import Textarea from "primevue/textarea";
import { computed } from "vue";

const model = defineModel<string[]>({ required: true });

const headersText = computed({
  get: () => model.value.join("\n"),
  set: (value: string) => {
    const headers = value
      .split("\n")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);
    model.value = headers;
  },
});
</script>

<template>
  <div class="flex flex-1 flex-col rounded-lg border border-surface-600 p-4">
    <div class="mb-2 flex items-center gap-2">
      <div
        class="flex h-5 w-5 items-center justify-center rounded bg-surface-600"
      >
        <i class="fas fa-eye-slash text-xs text-surface-300" />
      </div>
      <label class="text-sm font-medium text-surface-200"
        >Headers to Hide</label
      >
    </div>
    <p class="mb-2 text-xs text-surface-400">
      Headers that will be hidden from both request and response
    </p>
    <Textarea
      v-model="headersText"
      placeholder="Enter headers to hide, one per line"
      class="min-h-32 w-full flex-1 font-mono text-sm"
      :pt="{
        root: { style: 'resize: vertical' },
      }"
    />
  </div>
</template>
