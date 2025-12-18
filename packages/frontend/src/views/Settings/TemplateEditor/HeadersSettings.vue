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
  <div class="flex flex-1 flex-col">
    <div class="mb-2">
      <label class="block text-sm font-medium text-surface-200">
        Headers to Hide
      </label>
      <p class="text-xs text-surface-400">
        Headers that will be hidden from both request and response
      </p>
    </div>
    <Textarea
      v-model="headersText"
      placeholder="Enter headers to hide, one per line"
      class="min-h-0 w-full flex-1 font-mono text-sm"
      auto-resize
    />
  </div>
</template>
