import { Classic } from "@caido/primevue";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import { openOverlay } from "./stores/overlay";
import { initSettingsStore } from "./stores/settings";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

const COMMAND_OPEN_SCREENSHOT = "screenshot-mode.open";
const PLUGIN_PATH = "/screenshot-mode";

export const init = (sdk: FrontendSDK) => {
  initSettingsStore(sdk);

  const app = createApp(App);

  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  app.use(ConfirmationService);
  app.use(SDKPlugin, sdk);

  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  root.id = `plugin--frontend-vue`;

  app.mount(root);

  sdk.navigation.addPage(PLUGIN_PATH, {
    body: root,
  });

  sdk.sidebar.registerItem("Screenshot Mode", PLUGIN_PATH, {
    icon: "fas fa-camera",
  });

  sdk.commands.register(COMMAND_OPEN_SCREENSHOT, {
    name: "Open Screenshot Mode",
    group: "Screenshot Mode",
    run: () => {
      const session = sdk.replay.getCurrentSession();
      if (session !== undefined) {
        openOverlay(session.id);
      }
    },
    when: () => {
      return sdk.replay.getCurrentSession() !== undefined;
    },
  });

  sdk.commandPalette.register(COMMAND_OPEN_SCREENSHOT);

  sdk.shortcuts.register(COMMAND_OPEN_SCREENSHOT, ["Ctrl", "Shift", "S"]);

  sdk.replay.addToSlot("session-toolbar-primary", {
    type: "Button",
    label: "Screenshot",
    icon: "fas fa-camera",
    onClick: () => {
      const session = sdk.replay.getCurrentSession();
      if (session !== undefined) {
        openOverlay(session.id);
      }
    },
  });
};
