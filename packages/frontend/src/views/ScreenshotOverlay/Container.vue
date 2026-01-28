<script setup lang="ts">
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import { ContentPanel } from "./ContentPanel";
import SettingsPanel from "./SettingsPanel.vue";
import { useEntry } from "./useEntry";

import { useSDK } from "@/plugins/sdk";
import { closeOverlay, getOverlayState } from "@/stores/overlay";
import { useTabsStore } from "@/stores/tabs";
import { useTemplatesStore } from "@/stores/templates";
import {
  HighlightMode,
  type HighlightRule,
  RedactionMode,
  type RedactionRule,
  type RuleTarget,
  type ScreenshotSettings,
} from "@/types";
import { isPresent } from "@/utils/optional";
import { escapeRegex } from "@/utils/regex";
import {
  captureAndCopyToClipboard,
  captureAndDownload,
} from "@/utils/screenshot";

const DEFAULT_HIGHLIGHT_COLOR = "#ffff00";
const DEFAULT_REDACTION_TEXT = "[REDACTED]";

const sdk = useSDK();
const { getActiveRequestId } = useEntry();
const { getTabSettings, setTabSettingsFromTemplate, updateTabSettings,  getSplitterSizes, setSplitterSizes, getSelectedTemplateId, setSelectedTemplateId} = useTabsStore();
const templatesStore = useTemplatesStore();
const { defaultTemplateId } = storeToRefs(templatesStore);
const { createTemplate, updateTemplate } = templatesStore;
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

interface ContentPanelExposed {
  clearSelectionsForCapture: () => void;
  restoreSelectionsAfterCapture: () => void;
}

const contentPanelComponentRef = ref<ContentPanelExposed | undefined>(
  undefined,
);

const isVisible = computed(() => overlayState.value.isOpen);
const sessionId = computed(() => overlayState.value.sessionId);
const splitterSizes = computed(() => {
  const sid = sessionId.value;
  if (sid === undefined) return [50, 50] as [number, number];
  return getSplitterSizes(sid);
});

async function loadSessionData(): Promise<void> {
  const sid = sessionId.value;
  if (sid === undefined) {
    return;
  }

  settings.value = getTabSettings(sid);
  selectedTemplateId.value =
    getSelectedTemplateId(sid) ?? defaultTemplateId.value;

  const session = sdk.replay.getCurrentSession();
  if (session === undefined) {
    return;
  }

  const activeRequestId = await getActiveRequestId();
  if (activeRequestId === undefined) {
    return;
  }

  const requestData = await sdk.graphql.request({ id: activeRequestId });
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

  if (isPresent(request.response)) {
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
  setSelectedTemplateId(sid, templateId);
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

function delay(ms: number): Promise<void> {
  // eslint-disable-next-line compat/compat
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function handleSaveScreenshot(): Promise<void> {
  if (contentPanelRef.value === undefined) {
    sdk.window.showToast("Content panel not ready", { variant: "error" });
    return;
  }
  contentPanelComponentRef.value?.clearSelectionsForCapture();
  await delay(50);
  try {
    const result = await captureAndDownload(contentPanelRef.value);
    if (result.success) {
      sdk.window.showToast("Screenshot saved!", { variant: "success" });
    } else {
      sdk.window.showToast(`Failed: ${result.error}`, { variant: "error" });
    }
  } finally {
    contentPanelComponentRef.value?.restoreSelectionsAfterCapture();
  }
}

async function handleCopyScreenshot(): Promise<void> {
  if (contentPanelRef.value === undefined) {
    sdk.window.showToast("Content panel not ready", { variant: "error" });
    return;
  }
  contentPanelComponentRef.value?.clearSelectionsForCapture();
  await delay(50);
  try {
    const result = await captureAndCopyToClipboard(contentPanelRef.value);
    if (result.success) {
      sdk.window.showToast("Screenshot copied to clipboard!", {
        variant: "success",
      });
    } else {
      sdk.window.showToast(`Failed: ${result.error}`, { variant: "error" });
    }
  } finally {
    contentPanelComponentRef.value?.restoreSelectionsAfterCapture();
  }
}

function handleAddHighlight(regex: string, target: RuleTarget): void {
  if (!isPresent(settings.value)) return;

  const newRule: HighlightRule = {
    id: crypto.randomUUID(),
    regex: escapeRegex(regex),
    target,
    mode: HighlightMode.Highlight,
    color: DEFAULT_HIGHLIGHT_COLOR,
  };

  handleSettingsChange({
    ...settings.value,
    highlights: [...settings.value.highlights, newRule],
  });
}

function handleAddRedaction(regex: string, target: RuleTarget): void {
  if (!isPresent(settings.value)) return;

  const newRule: RedactionRule = {
    id: crypto.randomUUID(),
    regex: escapeRegex(regex),
    target,
    mode: RedactionMode.Replace,
    replacementText: DEFAULT_REDACTION_TEXT,
    useCaptureGroups: false,
    selectedGroups: [],
  };

  handleSettingsChange({
    ...settings.value,
    redactions: [...settings.value.redactions, newRule],
  });
}

function handleAddHiddenHeader(headerName: string): void {
  if (!isPresent(settings.value)) return;
  if (settings.value.headersToHide.includes(headerName)) return;

  handleSettingsChange({
    ...settings.value,
    headersToHide: [...settings.value.headersToHide, headerName],
  });
}

async function handleSaveAsNewTemplate(name: string): Promise<void> {
  if (!isPresent(settings.value)) return;
  if (name === "") return;

  const newTemplate = await createTemplate(name, settings.value);
  selectedTemplateId.value = newTemplate.id;

  const sid = sessionId.value;
  if (sid !== undefined) setSelectedTemplateId(sid, newTemplate.id);

  sdk.window.showToast(`Template "${name}" created!`, { variant: "success" });
}

async function handleUpdateCurrentTemplate(): Promise<void> {
  if (!isPresent(settings.value)) return;
  if (selectedTemplateId.value === "") return;

  const updated = await updateTemplate(selectedTemplateId.value, {
    settings: settings.value,
  });

  if (updated) {
    sdk.window.showToast(`Template updated!`, { variant: "success" });
  } else {
    sdk.window.showToast("Failed to update template", { variant: "error" });
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
            <Button
              label="Copy To Clipboard"
              icon="fas fa-copy"
              size="small"
              @click="handleCopyScreenshot"
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
              v-if="isPresent(settings)"
              :settings="settings"
              :selected-template-id="selectedTemplateId"
              @update="handleSettingsChange"
              @template-change="handleTemplateChange"
              @reset-to-template="handleResetToTemplate"
              @save-as-new-template="handleSaveAsNewTemplate"
              @update-current-template="handleUpdateCurrentTemplate"
            />
          </div>

          <div class="flex flex-1 bg-surface-900">
            <div ref="contentPanelRef" class="flex flex-1 justify-center">
              <ContentPanel
                v-if="isPresent(settings)"
                ref="contentPanelComponentRef"
                :settings="settings"
                :request-raw="requestRaw"
                :response-raw="responseRaw"
                :url="urlInfo.url"
                :sni="urlInfo.sni"
                :splitter-sizes="splitterSizes"
                @add-highlight="handleAddHighlight"
                @add-redaction="handleAddRedaction"
                @add-hidden-header="handleAddHiddenHeader"
                @update-splitter-sizes="
                  (sizes) => {
                    const sid = sessionId;
                    if (sid) setSplitterSizes(sid, sizes);
                  }
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
