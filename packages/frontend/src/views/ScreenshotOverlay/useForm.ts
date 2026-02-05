import { type Ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useTabsStore } from "@/stores/tabs";
import { useTemplatesStore } from "@/stores/templates";
import { type ScreenshotSettings } from "@/types";
import { isPresent } from "@/utils/optional";

export interface ContentPanelExposed {
  clearSelectionsForCapture: () => void;
}

export function useForm(
  settings: Ref<ScreenshotSettings | undefined>,
  sessionId: Ref<string | undefined>,
  selectedTemplateId: Ref<string>,
) {
  const sdk = useSDK();
  const templatesStore = useTemplatesStore();
  const { createTemplate, updateTemplate } = templatesStore;
  const { setSelectedTemplateId } = useTabsStore();

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

  return {
    handleSaveAsNewTemplate,
    handleUpdateCurrentTemplate,
  };
}
