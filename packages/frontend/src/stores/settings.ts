import { reactive, ref, type Ref } from "vue";

import {
  DEFAULT_SETTINGS,
  Disposition,
  type FrontendSDK,
  type ScreenshotSettings,
  type StoredData,
  type StoredSettings,
  type Template,
  WidthMode,
  type WidthSetting,
} from "@/types";

const tabSettings = reactive(new Map<string, ScreenshotSettings>());
const templates: Ref<Template[]> = ref([]);
const defaultTemplateId: Ref<string> = ref("");
let sdkInstance: FrontendSDK | undefined;

function cloneSettings(settings: ScreenshotSettings): ScreenshotSettings {
  return {
    headersToHide: [...settings.headersToHide],
    disposition: settings.disposition,
    width:
      settings.width.mode === WidthMode.Pixel
        ? { mode: WidthMode.Pixel, value: settings.width.value }
        : { mode: settings.width.mode },
    highlights: settings.highlights.map((h) => ({ ...h })),
    redactions: settings.redactions.map((r) => ({
      ...r,
      selectedGroups: [...r.selectedGroups],
    })),
  };
}

function parseWidthSetting(width: unknown): WidthSetting {
  if (width === undefined || width === null || typeof width !== "object") {
    return { mode: WidthMode.Full };
  }

  const data = width as Partial<WidthSetting>;

  if (data.mode === WidthMode.Pixel) {
    const pixelData = data as { mode: typeof WidthMode.Pixel; value?: number };
    return {
      mode: WidthMode.Pixel,
      value: typeof pixelData.value === "number" ? pixelData.value : 800,
    };
  }

  if (data.mode === WidthMode.A4) {
    return { mode: WidthMode.A4 };
  }

  if (data.mode === WidthMode.Letter) {
    return { mode: WidthMode.Letter };
  }

  return { mode: WidthMode.Full };
}

function parseRedactions(
  redactions: unknown,
): ScreenshotSettings["redactions"] {
  if (!Array.isArray(redactions)) {
    return [];
  }

  return redactions.map((r) => {
    const selectedGroups = Array.isArray(r.selectedGroups)
      ? r.selectedGroups
      : [];
    const useCaptureGroups =
      typeof r.useCaptureGroups === "boolean"
        ? r.useCaptureGroups
        : selectedGroups.length > 0;

    return {
      ...r,
      useCaptureGroups,
      selectedGroups,
    };
  });
}

function parseStoredSettings(stored: unknown): ScreenshotSettings {
  if (stored === undefined || stored === null || typeof stored !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const data = stored as Partial<StoredSettings>;

  return {
    headersToHide: Array.isArray(data.headersToHide)
      ? data.headersToHide
      : DEFAULT_SETTINGS.headersToHide,
    disposition:
      data.disposition === Disposition.Vertical
        ? Disposition.Vertical
        : Disposition.Horizontal,
    width: parseWidthSetting(data.width),
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    redactions: parseRedactions(data.redactions),
  };
}

function isStoredData(stored: unknown): stored is StoredData {
  if (stored === undefined || stored === null || typeof stored !== "object") {
    return false;
  }

  const data = stored as Partial<StoredData>;
  return (
    typeof data.version === "number" &&
    Array.isArray(data.templates) &&
    typeof data.defaultTemplateId === "string"
  );
}

function migrateStorage(stored: unknown): StoredData {
  if (isStoredData(stored)) {
    return stored;
  }

  const settings = parseStoredSettings(stored);
  const defaultTemplate: Template = {
    id: crypto.randomUUID(),
    name: "Default",
    settings,
  };

  return {
    version: 1,
    templates: [defaultTemplate],
    defaultTemplateId: defaultTemplate.id,
  };
}

function loadFromStoredData(data: StoredData): void {
  templates.value = data.templates;
  defaultTemplateId.value = data.defaultTemplateId;
}

async function persistStorage(): Promise<void> {
  if (sdkInstance === undefined) {
    return;
  }

  const data: StoredData = {
    version: 1,
    templates: templates.value,
    defaultTemplateId: defaultTemplateId.value,
  };

  await sdkInstance.storage.set(data);
}

export function initSettingsStore(sdk: FrontendSDK): void {
  sdkInstance = sdk;

  const stored = sdk.storage.get();
  const data = migrateStorage(stored);
  loadFromStoredData(data);

  if (!isStoredData(stored)) {
    persistStorage();
  }

  sdk.storage.onChange((value) => {
    const newData = migrateStorage(value);
    loadFromStoredData(newData);
  });
}

export function getTemplates(): Template[] {
  return templates.value;
}

function getDefaultTemplate(): Template {
  const template = templates.value.find(
    (t) => t.id === defaultTemplateId.value,
  );
  if (template !== undefined) {
    return template;
  }

  return (
    templates.value[0] ?? {
      id: "",
      name: "Default",
      settings: { ...DEFAULT_SETTINGS },
    }
  );
}

function getTemplateById(id: string): Template | undefined {
  return templates.value.find((t) => t.id === id);
}

export async function createTemplate(
  name: string,
  settings?: ScreenshotSettings,
): Promise<Template> {
  const newTemplate: Template = {
    id: crypto.randomUUID(),
    name,
    settings: settings ?? { ...DEFAULT_SETTINGS },
  };

  templates.value = [...templates.value, newTemplate];
  await persistStorage();
  return newTemplate;
}

export async function updateTemplate(
  id: string,
  updates: Partial<Pick<Template, "name" | "settings">>,
): Promise<Template | undefined> {
  const index = templates.value.findIndex((t) => t.id === id);
  if (index === -1) {
    return undefined;
  }

  const updated = { ...templates.value[index]!, ...updates };
  templates.value = [
    ...templates.value.slice(0, index),
    updated,
    ...templates.value.slice(index + 1),
  ];

  await persistStorage();
  return updated;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  if (id === defaultTemplateId.value) {
    return false;
  }

  const index = templates.value.findIndex((t) => t.id === id);
  if (index === -1) {
    return false;
  }

  templates.value = [
    ...templates.value.slice(0, index),
    ...templates.value.slice(index + 1),
  ];

  await persistStorage();
  return true;
}

export async function setDefaultTemplate(id: string): Promise<boolean> {
  const template = templates.value.find((t) => t.id === id);
  if (template === undefined) {
    return false;
  }

  defaultTemplateId.value = id;
  await persistStorage();
  return true;
}

export function getDefaultTemplateId(): string {
  return defaultTemplateId.value;
}

export function getTabSettings(sessionId: string): ScreenshotSettings {
  const existing = tabSettings.get(sessionId);
  if (existing !== undefined) {
    return existing;
  }

  const defaultTemplate = getDefaultTemplate();
  const newSettings = cloneSettings(defaultTemplate.settings);
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

export function setTabSettingsFromTemplate(
  sessionId: string,
  templateId: string,
): ScreenshotSettings {
  const template = getTemplateById(templateId);
  if (template === undefined) {
    return getTabSettings(sessionId);
  }

  const settings = cloneSettings(template.settings);
  tabSettings.set(sessionId, settings);
  return settings;
}
