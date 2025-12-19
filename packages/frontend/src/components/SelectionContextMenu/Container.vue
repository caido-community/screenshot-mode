<script setup lang="ts">
import Button from "primevue/button";

const { x, y, visible } = defineProps<{
  x: number;
  y: number;
  visible: boolean;
}>();

const emit = defineEmits<{
  highlight: [];
  redact: [];
  hideHeader: [];
  close: [];
}>();
</script>

<template>
  <div
    v-if="visible"
    class="fixed z-[10000] rounded border border-surface-600 bg-surface-800 p-1 shadow-lg"
    :style="{ top: `${y}px`, left: `${x}px` }"
  >
    <Button
      label="Highlight"
      icon="fas fa-highlighter"
      class="text-secondary-400"
      text
      @click="emit('highlight')"
    />
    
    <Button
      label="Redact"
      icon="fas fa-mask"
      class="text-secondary-400"
      text
      @click="emit('redact')"
    />

    <Button
      label="Hide Header"
      icon="fas fa-eye-slash"
      class="text-secondary-400"
      text
      @click="emit('hideHeader')"
    />
  </div>
</template>
