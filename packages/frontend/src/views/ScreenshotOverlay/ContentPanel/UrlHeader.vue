<script setup lang="ts">
const { url, sni } = defineProps<{
  url: string;
  sni: string | undefined;
}>();
</script>

<template>
  <div
    class="flex items-center gap-4 border-b border-surface-600 bg-surface-800 px-4 py-2"
  >
    <div class="flex items-center gap-2">
      <span class="text-xs font-medium uppercase text-surface-400">URL</span>
      <code
        class="rounded bg-surface-700 px-2 py-1 font-mono text-sm text-surface-100"
      >
        {{ url }}
      </code>
    </div>
    <div v-if="sni !== undefined" class="flex items-center gap-2">
      <span class="text-xs font-medium uppercase text-surface-400">SNI</span>
      <code
        class="rounded bg-surface-700 px-2 py-1 font-mono text-sm text-amber-400"
      >
        {{ sni }}
      </code>
    </div>
  </div>
</template>
