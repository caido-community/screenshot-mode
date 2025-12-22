<script setup lang="ts">
import { computed } from "vue";

import DataDisplay from "./DataDisplay.vue";
import UrlHeader from "./UrlHeader.vue";

import { type RuleTarget, type ScreenshotSettings, WidthMode } from "@/types";

const WIDTH_PRESETS = {
  [WidthMode.A4]: 595,
  [WidthMode.Letter]: 612,
} as const;

const { settings, requestRaw, responseRaw, url, sni, splitterSizes } =  defineProps<{
    settings: ScreenshotSettings;
    requestRaw: string;
    responseRaw: string;
    url: string;
    sni: string | undefined;
    splitterSizes: [number, number];
  }>();

const emit = defineEmits<{
  addHighlight: [regex: string, target: RuleTarget];
  addRedaction: [regex: string, target: RuleTarget];
  addHiddenHeader: [headerName: string];
  updateSplitterSizes: [sizes: [number, number]];
}>();

const contentStyle = computed(() => {
  const width = settings.width;

  if (width.mode === WidthMode.Full) {
    return {};
  }

  if (width.mode === WidthMode.Pixel) {
    return { maxWidth: `${width.value}px` };
  }

  if (width.mode === WidthMode.A4 || width.mode === WidthMode.Letter) {
    return { maxWidth: `${WIDTH_PRESETS[width.mode]}px` };
  }

  return {};
});
</script>

<template>
  <div
    class="flex w-full flex-col overflow-hidden border border-surface-600"
    :style="contentStyle"
  >
    <UrlHeader :url="url" :sni="sni" />
    <DataDisplay
      :request-raw="requestRaw"
      :response-raw="responseRaw"
      :settings="settings"
      :splitter-sizes="splitterSizes"
      @add-highlight="(regex, target) => emit('addHighlight', regex, target)"
      @add-redaction="(regex, target) => emit('addRedaction', regex, target)"
      @add-hidden-header="(headerName) => emit('addHiddenHeader', headerName)"
      @update-splitter-sizes="(sizes) => emit('updateSplitterSizes', sizes)"
    />
  </div>
</template>
