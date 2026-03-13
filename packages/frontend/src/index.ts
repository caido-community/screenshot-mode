import { Classic } from "@caido/primevue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import { openOverlay, openOverlayWithRequest } from "./stores/overlay";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import { isPresent } from "./utils/optional";
import App from "./views/App.vue";

const COMMAND_OPEN_SCREENSHOT = "screenshot-mode.open";
const COMMAND_SCREENSHOT_REQUEST = "screenshot-mode.screenshot-request";
const PLUGIN_PATH = "/screenshot-mode";

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
      const session = sdk.replay.getCurrentSession();
      if (isPresent(session)) {
        openOverlay(session.id);
      }
    },
    when: () => {
      return isPresent(sdk.replay.getCurrentSession());
    },
  });

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

  sdk.commands.register(COMMAND_SCREENSHOT_REQUEST, {
    name: "Screenshot",
    group: "Screenshot Mode",
    run: (context) => {
      if (context.type === "RequestRowContext") {
        const request = context.requests[0];
        if (isPresent(request)) {
          openOverlayWithRequest(request.id);
        }
      } else if (context.type === "RequestContext") {
        if ("id" in context.request) {
          openOverlayWithRequest(context.request.id);
        }
      } else if (context.type === "ResponseContext") {
        openOverlayWithRequest(context.request.id);
      }
    },
    when: (context) => {
      if (context.type === "RequestRowContext") {
        return context.requests.length > 0;
      }
      if (context.type === "RequestContext") {
        return "id" in context.request;
      }
      if (context.type === "ResponseContext") {
        return true;
      }
      return false;
    },
  });

  sdk.menu.registerItem({
    type: "RequestRow",
    commandId: COMMAND_SCREENSHOT_REQUEST,
    leadingIcon: "fas fa-camera",
  });

  sdk.menu.registerItem({
    type: "Request",
    commandId: COMMAND_SCREENSHOT_REQUEST,
    leadingIcon: "fas fa-camera",
  });

  sdk.menu.registerItem({
    type: "Response",
    commandId: COMMAND_SCREENSHOT_REQUEST,
    leadingIcon: "fas fa-camera",
  });
};
