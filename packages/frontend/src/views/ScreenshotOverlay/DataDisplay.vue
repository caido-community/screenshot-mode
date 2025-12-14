<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import { useSDK } from "@/plugins/sdk";
import type { ScreenshotSettings } from "@/types";
import { applyDecorations } from "@/utils/decorations";

const { requestRaw, responseRaw, settings } = defineProps<{
  requestRaw: string;
  responseRaw: string;
  settings: ScreenshotSettings;
}>();

const sdk = useSDK();

const requestEditorContainer = ref<HTMLElement | undefined>(undefined);
const responseEditorContainer = ref<HTMLElement | undefined>(undefined);

const requestEditor = sdk.ui.httpRequestEditor();
const responseEditor = sdk.ui.httpResponseEditor();

const containerClass = computed(() => {
  return settings.disposition === "horizontal"
    ? "flex flex-row flex-1 overflow-hidden"
    : "flex flex-col flex-1 overflow-hidden";
});

const editorClass = computed(() => {
  return settings.disposition === "horizontal"
    ? "flex-1 overflow-hidden border-r border-surface-600 last:border-r-0"
    : "flex-1 overflow-hidden border-b border-surface-600 last:border-b-0";
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
    settings.highlights.filter((h) => h.target === "request"),
    settings.redactions.filter((r) => r.target === "request"),
  );

  applyDecorations(
    responseView,
    settings.highlights.filter((h) => h.target === "response"),
    settings.redactions.filter((r) => r.target === "response"),
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

onMounted(() => {
  if (requestEditorContainer.value !== undefined) {
    const element = requestEditor.getElement();
    element.style.height = "100%";
    element.style.width = "100%";
    requestEditorContainer.value.appendChild(element);
  }

  if (responseEditorContainer.value !== undefined) {
    const element = responseEditor.getElement();
    element.style.height = "100%";
    element.style.width = "100%";
    responseEditorContainer.value.appendChild(element);
  }

  updateEditors();
});

onUnmounted(() => {
  if (requestEditorContainer.value !== undefined) {
    requestEditorContainer.value.innerHTML = "";
  }
  if (responseEditorContainer.value !== undefined) {
    responseEditorContainer.value.innerHTML = "";
  }
});
</script>

<template>
  <div :class="containerClass">
    <div :class="editorClass">
      <div
        class="flex h-8 items-center border-b border-surface-600 bg-surface-750 px-3"
      >
        <span class="text-xs font-medium uppercase text-surface-400"
          >Request</span
        >
      </div>
      <div ref="requestEditorContainer" class="h-[calc(100%-2rem)]" />
    </div>
    <div :class="editorClass">
      <div
        class="flex h-8 items-center border-b border-surface-600 bg-surface-750 px-3"
      >
        <span class="text-xs font-medium uppercase text-surface-400"
          >Response</span
        >
      </div>
      <div ref="responseEditorContainer" class="h-[calc(100%-2rem)]" />
    </div>
  </div>
</template>
