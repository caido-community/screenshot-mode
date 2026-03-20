<script setup lang="ts">
import { computed, ref } from "vue";

import DataDisplay from "./DataDisplay.vue";
import UrlHeader from "./UrlHeader.vue";

import { type RuleTarget, type ScreenshotSettings, WidthMode } from "@/types";
import { isPresent } from "@/utils/optional";

interface DataDisplayExposed {
  clearSelectionsForCapture: () => void;
}

const captureRootRef = ref<HTMLElement | undefined>(undefined);
const dataDisplayRef = ref<DataDisplayExposed | undefined>(undefined);

const WIDTH_PRESETS = {
  [WidthMode.A4]: 595,
  [WidthMode.Letter]: 612,
} as const;

const {
  settings,
  requestRaw,
  responseRaw,
  url,
  sni,
  splitterSizes,
  cropMaxHeight = undefined,
  responseInfo = undefined,
} = defineProps<{
  settings: ScreenshotSettings;
  requestRaw: string;
  responseRaw: string;
  url: string;
  sni: string | undefined;
  splitterSizes: [number, number];
  cropMaxHeight?: number;
  responseInfo?: { length: number; roundtripTime: number };
}>();

const emit = defineEmits<{
  addHighlight: [regex: string, target: RuleTarget];
  addRedaction: [regex: string, target: RuleTarget];
  addHiddenHeader: [headerName: string];
  updateSplitterSizes: [sizes: [number, number]];
  cropDragStart: [event: MouseEvent];
}>();

const contentStyle = computed(() => {
  const width = settings.width;
  const style: Record<string, string> = {};

  if (width.mode === WidthMode.Pixel) {
    style.maxWidth = `${width.value}px`;
  } else if (width.mode === WidthMode.A4 || width.mode === WidthMode.Letter) {
    style.maxWidth = `${WIDTH_PRESETS[width.mode]}px`;
  }

  if (cropMaxHeight !== undefined) {
    style.maxHeight = `${cropMaxHeight}px`;
    style.overflow = "hidden";
  }

  return style;
});

function clearSelectionsForCapture(): void {
  dataDisplayRef.value?.clearSelectionsForCapture();
}

function getCaptureRootElement(): HTMLElement | undefined {
  return captureRootRef.value;
}

defineExpose({
  clearSelectionsForCapture,
  getCaptureRootElement,
});
</script>

<template>
  <div class="flex w-full flex-1 flex-col">
    <div
      ref="captureRootRef"
      class="flex w-full flex-1 flex-col overflow-hidden border border-surface-600"
      :style="contentStyle"
    >
      <UrlHeader :url="url" :sni="sni" />
      <DataDisplay
        ref="dataDisplayRef"
        :request-raw="requestRaw"
        :response-raw="responseRaw"
        :settings="settings"
        :splitter-sizes="splitterSizes"
        :is-cropped="isPresent(cropMaxHeight)"
        :response-info="responseInfo"
        @add-highlight="(regex, target) => emit('addHighlight', regex, target)"
        @add-redaction="(regex, target) => emit('addRedaction', regex, target)"
        @add-hidden-header="(headerName) => emit('addHiddenHeader', headerName)"
        @update-splitter-sizes="(sizes) => emit('updateSplitterSizes', sizes)"
      />
    </div>
    <!-- Crop drag handle -->
    <div
      class="flex h-2 w-full shrink-0 cursor-row-resize items-center justify-center bg-surface-800 transition-colors hover:bg-surface-700"
      title="Drag to adjust content height"
      @mousedown="(e) => emit('cropDragStart', e)"
    >
      <div class="h-0.5 w-8 rounded bg-surface-500" />
    </div>
  </div>
</template>
