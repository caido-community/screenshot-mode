import { ScreenshotSettingsSchema } from "@/schemas";
import { DEFAULT_SETTINGS, type ScreenshotSettings } from "@/types";

export function parseStoredSettings(stored: unknown): ScreenshotSettings {
  const result = ScreenshotSettingsSchema.safeParse(stored);

  if (result.success) {
    return result.data;
  }

  return { ...DEFAULT_SETTINGS };
}
