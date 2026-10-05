<script setup lang="ts">
import ColorPicker from "primevue/colorpicker";
import { ref, watch } from "vue";

import { hexToHsb, type Hsb, hsbToHex } from "@/utils/color";

const { color, appendTo = undefined } = defineProps<{
  color: string;
  appendTo?: string;
}>();

const emit = defineEmits<{
  update: [color: string];
}>();

const hsb = ref<Hsb>(hexToHsb(color));

watch(
  () => color,
  (value) => {
    if (value !== hsbToHex(hsb.value)) {
      hsb.value = hexToHsb(value);
    }
  },
);

function handleChange(value: Hsb): void {
  hsb.value = value;
  emit("update", hsbToHex(value));
}
</script>

<template>
  <ColorPicker
    :model-value="hsb"
    format="hsb"
    :append-to="appendTo"
    @update:model-value="handleChange"
  />
</template>
