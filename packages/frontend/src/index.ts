import { Classic } from "@caido/primevue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import { openOverlay, openOverlayForRequest } from "./stores/overlay";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import { isPresent } from "./utils/optional";
import App from "./views/App.vue";

const COMMAND_OPEN_SCREENSHOT = "screenshot-mode.open";
const PLUGIN_PATH = "/screenshot-mode";

function getSelectedRequestId(sdk: FrontendSDK): string | undefined {
  const context = sdk.window.getContext();
  const page = context.page;

  if (page === undefined) return undefined;

  // Handle HTTP History
  if (
    "kind" in page &&
    page.kind === "HTTPHistory" &&
    "selection" in page &&
    page.selection.kind === "Selected" &&
    typeof page.selection.main === "string"
  ) {
    return page.selection.main;
  }

  // Handle Sitemap
  if (
    "kind" in page &&
    page.kind === "Sitemap" &&
    "requestSelection" in page &&
    page.requestSelection.kind === "Selected" &&
    typeof page.requestSelection.main === "string"
  ) {
    return page.requestSelection.main;
  }

  return undefined;
}

export const init = (sdk: FrontendSDK) => {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
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
      const context = sdk.window.getContext();
      const page = context.page;

      if (page?.kind === "Replay") {
        const session = sdk.replay.getCurrentSession();
        if (isPresent(session)) {
          openOverlay(session.id);
        }
        return;
      }

      const requestId = getSelectedRequestId(sdk);
      if (requestId !== undefined) {
        openOverlayForRequest(requestId);
        return;
      }
    },
    when: () => {
      const context = sdk.window.getContext();
      const page = context.page;

      if (
        page?.kind === "Replay" &&
        isPresent(sdk.replay.getCurrentSession())
      ) {
        return true;
      }

      // Enable if valid selection exists in supported pages
      return getSelectedRequestId(sdk) !== undefined;
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
      if (isPresent(session)) {
        openOverlay(session.id);
      }
    },
  });
};
