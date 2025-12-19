import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

import { isStoredData, migrateStorage } from "./migrate";

import { useSDK } from "@/plugins/sdk";
import {
  DEFAULT_SETTINGS,
  type ScreenshotSettings,
  type StoredData,
  type Template,
} from "@/types";
import { isPresent } from "@/utils/optional";

export const useTemplatesStore = defineStore("templates", () => {
  const sdk = useSDK();

  const templates: Ref<Template[]> = ref([]);
  const defaultTemplateId: Ref<string> = ref("");

  const initialize = async () => {
    const stored = sdk.storage.get();
    const data = migrateStorage(stored);
    templates.value = data.templates;
    defaultTemplateId.value = data.defaultTemplateId;

    if (!isStoredData(stored)) {
      await persistStorage();
    }

    sdk.storage.onChange((value) => {
      const newData = migrateStorage(value);
      templates.value = newData.templates;
      defaultTemplateId.value = newData.defaultTemplateId;
    });
  };

  const createTemplate = async (
    name: string,
    settings?: ScreenshotSettings,
  ): Promise<Template> => {
    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name,
      settings: settings ?? { ...DEFAULT_SETTINGS },
    };

    templates.value = [...templates.value, newTemplate];
    await persistStorage();
    return newTemplate;
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<Pick<Template, "name" | "settings">>,
  ): Promise<Template | undefined> => {
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
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
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
  };

  const setDefaultTemplate = async (id: string): Promise<boolean> => {
    const template = templates.value.find((t) => t.id === id);
    if (template === undefined) {
      return false;
    }

    defaultTemplateId.value = id;
    await persistStorage();
    return true;
  };

  const getDefaultTemplate = (): Template => {
    const template = templates.value.find(
      (t) => t.id === defaultTemplateId.value,
    );
    if (isPresent(template)) {
      return template;
    }
    return (
      templates.value[0] ?? {
        id: "",
        name: "Default",
        settings: { ...DEFAULT_SETTINGS },
      }
    );
  };

  const getTemplateById = (id: string): Template | undefined => {
    return templates.value.find((t) => t.id === id);
  };

  const persistStorage = async () => {
    const data: StoredData = {
      version: 1,
      templates: templates.value,
      defaultTemplateId: defaultTemplateId.value,
    };

    await sdk.storage.set(data);
  };

  return {
    initialize,
    templates,
    defaultTemplateId,
    getDefaultTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    getTemplateById,
  };
});
