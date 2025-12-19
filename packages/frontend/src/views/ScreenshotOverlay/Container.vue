<script setup lang="ts">
import Button from "primevue/button";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import { ContentPanel } from "./ContentPanel";
import SettingsPanel from "./SettingsPanel.vue";

import { useSDK } from "@/plugins/sdk";
import { closeOverlay, getOverlayState } from "@/stores/overlay";
import { useTabsStore } from "@/stores/tabs";
import { useTemplatesStore } from "@/stores/templates";
import type { ScreenshotSettings } from "@/types";
import { captureAndDownload } from "@/utils/screenshot";

const sdk = useSDK();
const { getTabSettings, setTabSettingsFromTemplate, updateTabSettings } =
  useTabsStore();
const { defaultTemplateId } = useTemplatesStore();
const overlayState = getOverlayState();

const settings = ref<ScreenshotSettings | undefined>(undefined);
const selectedTemplateId = ref<string>("");
const requestRaw = ref<string>("");
const responseRaw = ref<string>("");
const urlInfo = ref<{ url: string; sni: string | undefined }>({
  url: "",
  sni: undefined,
});
const contentPanelRef = ref<HTMLElement | undefined>(undefined);

const isVisible = computed(() => overlayState.value.isOpen);
const sessionId = computed(() => overlayState.value.sessionId);

async function loadSessionData(): Promise<void> {
  const sid = sessionId.value;
  if (sid === undefined) {
    return;
  }

  settings.value = getTabSettings(sid);
  selectedTemplateId.value = defaultTemplateId;

  const session = sdk.replay.getCurrentSession();
  if (session === undefined) {
    return;
  }

  const activeEntryId = session.entryIds[session.entryIds.length - 1];
  if (activeEntryId === undefined) {
    return;
  }

  const entry = sdk.replay.getEntry(activeEntryId);
  if (entry.requestId === undefined) {
    return;
  }

  const requestData = await sdk.graphql.request({ id: entry.requestId });
  const request = requestData.request;
  if (request === undefined || request === null) {
    return;
  }

  requestRaw.value = request.raw ?? "";
  urlInfo.value = {
    url: `${request.isTls ? "https" : "http"}://${request.host}:${
      request.port
    }${request.path}${request.query ?? ""}`,
    sni: request.sni ?? undefined,
  };

  if (request.response !== undefined && request.response !== null) {
    const responseData = await sdk.graphql.response({
      id: request.response.id,
    });
    responseRaw.value = responseData.response?.raw ?? "";
  }
}

function handleSettingsChange(newSettings: ScreenshotSettings): void {
  const sid = sessionId.value;
  if (sid === undefined) {
    return;
  }

  settings.value = updateTabSettings(sid, newSettings);
}

function handleTemplateChange(templateId: string): void {
  const sid = sessionId.value;
  if (sid === undefined) {
    return;
  }

  selectedTemplateId.value = templateId;
  settings.value = setTabSettingsFromTemplate(sid, templateId);
}

function handleResetToTemplate(): void {
  const sid = sessionId.value;
  if (sid === undefined) {
    return;
  }

  settings.value = setTabSettingsFromTemplate(sid, selectedTemplateId.value);
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && isVisible.value) {
    closeOverlay();
  }
}

function handleBackdropClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    closeOverlay();
  }
}

async function handleSaveScreenshot(): Promise<void> {
  if (contentPanelRef.value === undefined) {
    sdk.window.showToast("Content panel not ready", { variant: "error" });
    return;
  }
  const result = await captureAndDownload(contentPanelRef.value);
  if (result.success) {
    sdk.window.showToast("Screenshot saved!", { variant: "success" });
  } else {
    sdk.window.showToast(`Failed: ${result.error}`, { variant: "error" });
  }
}

watch(
  () => overlayState.value.sessionId,
  () => {
    if (overlayState.value.isOpen) {
      loadSessionData();
    }
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  if (isVisible.value) {
    loadSessionData();
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      @click="handleBackdropClick"
    >
      <div
        class="flex h-[90vh] w-[95vw] flex-col overflow-hidden rounded-lg border border-surface-600 bg-surface-800 shadow-2xl"
      >
        <div
          class="flex items-center justify-between border-b border-surface-600 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold text-surface-50">
              Screenshot Mode
            </h2>
            <Button
              label="Save Screenshot"
              icon="fas fa-download"
              size="small"
              @click="handleSaveScreenshot"
            />
          </div>
          <button
            class="rounded p-1 text-surface-400 transition-colors hover:bg-surface-700 hover:text-surface-200"
            @click="closeOverlay"
          >
            <i class="fas fa-times text-lg" />
          </button>
        </div>

        <div class="flex flex-1 overflow-hidden">
          <div
            class="w-1/4 min-w-64 overflow-y-auto border-r border-surface-600 p-4"
          >
            <SettingsPanel
              v-if="settings !== undefined"
              :settings="settings"
              :selected-template-id="selectedTemplateId"
              @update="handleSettingsChange"
              @template-change="handleTemplateChange"
              @reset-to-template="handleResetToTemplate"
            />
          </div>

          <div ref="contentPanelRef" class="flex flex-1 overflow-hidden">
            <ContentPanel
              v-if="settings !== undefined"
              :settings="settings"
              :request-raw="requestRaw"
              :response-raw="responseRaw"
              :url="urlInfo.url"
              :sni="urlInfo.sni"
            />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
