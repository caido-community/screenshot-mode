import { cloneDeep } from "lodash-es";
import { defineStore } from "pinia";
import { ref } from "vue";

import { useTemplatesStore } from "./templates";

import { type ScreenshotSettings } from "@/types";

export const useTabsStore = defineStore("tabs", () => {
  const { getDefaultTemplate, getTemplateById } = useTemplatesStore();

  const tabSettings = ref(new Map<string, ScreenshotSettings>());

  const getTabSettings = (sessionId: string): ScreenshotSettings => {
    const existing = tabSettings.value.get(sessionId);
    if (existing !== undefined) {
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

  return {
    getTabSettings,
    updateTabSettings,
    setTabSettingsFromTemplate,
  };
});
