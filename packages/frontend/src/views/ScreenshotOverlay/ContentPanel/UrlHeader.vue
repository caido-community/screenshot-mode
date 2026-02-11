<script setup lang="ts">
import { isPresent } from "@/utils/optional";

const { url, sni } = defineProps<{
  url: string;
  sni: string | undefined;
}>();
</script>

<template>
  <div
    class="flex flex-wrap items-start gap-4 overflow-hidden border-b border-surface-600 bg-surface-800 px-4 py-2"
  >
    <div class="flex min-w-0 items-start gap-2">
      <span class="shrink-0 py-1 text-xs font-medium uppercase text-surface-400"
        >URL</span
      >
      <code
        class="break-all rounded bg-surface-700 px-2 py-1 font-mono text-sm text-surface-100"
      >
        {{ url }}
      </code>
    </div>
    <div v-if="isPresent(sni)" class="flex min-w-0 items-start gap-2">
      <span class="shrink-0 py-1 text-xs font-medium uppercase text-surface-400"
        >SNI</span
      >
      <code
        class="break-all rounded bg-surface-700 px-2 py-1 font-mono text-sm text-amber-400"
      >
        {{ sni }}
      </code>
    </div>
  </div>
</template>
