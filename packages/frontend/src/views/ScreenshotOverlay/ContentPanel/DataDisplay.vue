<script setup lang="ts">
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

import { useSDK } from "@/plugins/sdk";
import { Disposition, RuleTarget, type ScreenshotSettings } from "@/types";
import { applyDecorations } from "@/utils/decorations";
import { isPresent } from "@/utils/optional";

const { requestRaw, responseRaw, settings } = defineProps<{
  requestRaw: string;
  responseRaw: string;
  settings: ScreenshotSettings;
}>();

const sdk = useSDK();

const requestEditorContainer = ref<HTMLElement | undefined>(undefined);
const responseEditorContainer = ref<HTMLElement | undefined>(undefined);

const panelSizes = ref([50, 50]);
const splitterKey = ref(0);

const requestEditor = sdk.ui.httpRequestEditor();
const responseEditor = sdk.ui.httpResponseEditor();

const splitterLayout = computed(() => {
  return settings.disposition === Disposition.Horizontal
    ? "horizontal"
    : "vertical";
});

function filterHeaders(raw: string, headersToHide: string[]): string {
  if (headersToHide.length === 0) {
    return raw;
  }

  const lowerHeaders = headersToHide.map((h) => h.toLowerCase());
  const lines = raw.split("\r\n");
  const filteredLines: string[] = [];
  let inBody = false;

  for (const line of lines) {
    if (inBody) {
      filteredLines.push(line);
      continue;
    }

    if (line === "") {
      inBody = true;
      filteredLines.push(line);
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const headerName = line.substring(0, colonIndex).toLowerCase();
      if (!lowerHeaders.includes(headerName)) {
        filteredLines.push(line);
      }
    } else {
      filteredLines.push(line);
    }
  }

  return filteredLines.join("\r\n");
}

function updateEditors(): void {
  const filteredRequest = filterHeaders(requestRaw, settings.headersToHide);
  const filteredResponse = filterHeaders(responseRaw, settings.headersToHide);

  const requestView = requestEditor.getEditorView();
  const responseView = responseEditor.getEditorView();

  requestView.dispatch({
    changes: {
      from: 0,
      to: requestView.state.doc.length,
      insert: filteredRequest,
    },
  });

  responseView.dispatch({
    changes: {
      from: 0,
      to: responseView.state.doc.length,
      insert: filteredResponse,
    },
  });

  applyDecorations(
    requestView,
    settings.highlights.filter((h) => h.target === RuleTarget.Request),
    settings.redactions.filter((r) => r.target === RuleTarget.Request),
  );

  applyDecorations(
    responseView,
    settings.highlights.filter((h) => h.target === RuleTarget.Response),
    settings.redactions.filter((r) => r.target === RuleTarget.Response),
  );
}

watch(
  () => [
    requestRaw,
    responseRaw,
    settings.headersToHide,
    settings.highlights,
    settings.redactions,
  ],
  () => {
    updateEditors();
  },
  { deep: true },
);

watch(
  () => settings.width,
  async () => {
    panelSizes.value = [50, 50];
    splitterKey.value++;
    await nextTick();
    mountEditors();
  },
);

function mountEditors(): void {
  if (isPresent(requestEditorContainer.value)) {
    const element = requestEditor.getElement();
    element.style.height = "100%";
    element.style.width = "100%";
    requestEditorContainer.value.innerHTML = "";
    requestEditorContainer.value.appendChild(element);
  }

  if (isPresent(responseEditorContainer.value)) {
    const element = responseEditor.getElement();
    element.style.height = "100%";
    element.style.width = "100%";
    responseEditorContainer.value.innerHTML = "";
    responseEditorContainer.value.appendChild(element);
  }

  updateEditors();
}

onMounted(() => {
  mountEditors();
});

onUnmounted(() => {
  if (isPresent(requestEditorContainer.value)) {
    requestEditorContainer.value.innerHTML = "";
  }
  if (isPresent(responseEditorContainer.value)) {
    responseEditorContainer.value.innerHTML = "";
  }
});
</script>

<template>
  <Splitter
    :key="splitterKey"
    :layout="splitterLayout"
    class="flex-1 overflow-hidden"
  >
    <SplitterPanel :size="panelSizes[0]" :min-size="10" class="overflow-hidden">
      <div ref="requestEditorContainer" class="h-full w-full" />
    </SplitterPanel>
    <SplitterPanel :size="panelSizes[1]" :min-size="10" class="overflow-hidden">
      <div ref="responseEditorContainer" class="h-full w-full" />
    </SplitterPanel>
  </Splitter>
</template>
