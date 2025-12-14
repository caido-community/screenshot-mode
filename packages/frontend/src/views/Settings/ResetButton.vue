<script setup lang="ts">
const emit = defineEmits<{
  reset: [];
}>();
</script>

<template>
  <button
    class="flex items-center gap-2 text-sm font-medium text-red-400 transition-colors hover:text-red-300"
    @click="emit('reset')"
  >
    <i class="fas fa-trash" />
    Reset to Defaults
  </button>
</template>
