import { reactive, ref, type Ref } from "vue";

import {
  DEFAULT_SETTINGS,
  Disposition,
  type FrontendSDK,
  type ScreenshotSettings,
  type StoredSettings,
} from "@/types";

const tabSettings = reactive(new Map<string, ScreenshotSettings>());
const defaultSettings: Ref<ScreenshotSettings> = ref({ ...DEFAULT_SETTINGS });
let sdkInstance: FrontendSDK | undefined;

function parseStoredSettings(stored: unknown): ScreenshotSettings {
  if (stored === undefined || stored === null || typeof stored !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const data = stored as Partial<StoredSettings>;

  return {
    headersToHide: Array.isArray(data.headersToHide) ? data.headersToHide : [],
    disposition:
      data.disposition === Disposition.Vertical
        ? Disposition.Vertical
        : Disposition.Horizontal,
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    redactions: Array.isArray(data.redactions) ? data.redactions : [],
  };
}

export function initSettingsStore(sdk: FrontendSDK): void {
  sdkInstance = sdk;

  const stored = sdk.storage.get();
  defaultSettings.value = parseStoredSettings(stored);

  sdk.storage.onChange((value) => {
    defaultSettings.value = parseStoredSettings(value);
  });
}

export function getDefaultSettings(): ScreenshotSettings {
  return { ...defaultSettings.value };
}

export function getTabSettings(sessionId: string): ScreenshotSettings {
  const existing = tabSettings.get(sessionId);
  if (existing !== undefined) {
    return existing;
  }

  const newSettings = getDefaultSettings();
  tabSettings.set(sessionId, newSettings);
  return newSettings;
}

export function updateTabSettings(
  sessionId: string,
  updates: Partial<ScreenshotSettings>,
): ScreenshotSettings {
  const current = getTabSettings(sessionId);
  const updated = { ...current, ...updates };
  tabSettings.set(sessionId, updated);
  return updated;
}

export async function saveDefaultSettings(
  settings: ScreenshotSettings,
): Promise<void> {
  if (sdkInstance === undefined) {
    return;
  }

  const toStore: StoredSettings = {
    headersToHide: settings.headersToHide,
    disposition: settings.disposition,
    highlights: settings.highlights,
    redactions: settings.redactions,
  };

  await sdkInstance.storage.set(toStore);
  defaultSettings.value = { ...settings };
}
