import { cloneDeep } from "lodash-es";
import { defineStore } from "pinia";
import { ref } from "vue";

import { useTemplatesStore } from "./templates";

import { type ScreenshotSettings } from "@/types";
import { isPresent } from "@/utils/optional";

export const useTabsStore = defineStore("tabs", () => {
  const { getDefaultTemplate, getTemplateById } = useTemplatesStore();

  const tabSettings = ref(new Map<string, ScreenshotSettings>());
  const tabSplitterSizes = ref(new Map<string, [number, number]>());
  const tabSelectedTemplateId = ref(new Map<string, string>());

  const getTabSettings = (sessionId: string): ScreenshotSettings => {
    const existing = tabSettings.value.get(sessionId);
    if (isPresent(existing)) {
      return existing;
    }

    const defaultTemplate = getDefaultTemplate();
    const newSettings = cloneDeep(defaultTemplate.settings);
    tabSettings.value.set(sessionId, newSettings);
    return newSettings;
  };

  const updateTabSettings = (
    sessionId: string,
    updates: Partial<ScreenshotSettings>,
  ): ScreenshotSettings => {
    const current = getTabSettings(sessionId);
    const updated = { ...current, ...updates };
    tabSettings.value.set(sessionId, updated);
    return updated;
  };
  const setTabSettingsFromTemplate = (
    sessionId: string,
    templateId: string,
  ): ScreenshotSettings => {
    const template = getTemplateById(templateId);
    if (template === undefined) {
      return getTabSettings(sessionId);
    }

    const settings = cloneDeep(template.settings);
    tabSettings.value.set(sessionId, settings);
    return settings;
  };
  const getSplitterSizes = (sessionId: string): [number, number] => {
    return tabSplitterSizes.value.get(sessionId) ?? [50, 50];
  };
  const setSplitterSizes = (
    sessionId: string,
    sizes: [number, number],
  ): void => {
    tabSplitterSizes.value.set(sessionId, sizes);
  };

  const getSelectedTemplateId = (sessionId: string): string | undefined => {
    return tabSelectedTemplateId.value.get(sessionId);
  };
  const setSelectedTemplateId = (
    sessionId: string,
    templateId: string,
  ): void => {
    tabSelectedTemplateId.value.set(sessionId, templateId);
  };

  return {
    getTabSettings,
    updateTabSettings,
    setTabSettingsFromTemplate,
    getSplitterSizes,
    setSplitterSizes,
    getSelectedTemplateId,
    setSelectedTemplateId,
  };
});
