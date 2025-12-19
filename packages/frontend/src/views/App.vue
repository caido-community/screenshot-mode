<script setup lang="ts">
import Card from "primevue/card";
import Menubar from "primevue/menubar";
import { onMounted, ref } from "vue";

import { ScreenshotOverlay } from "./ScreenshotOverlay";
import { SettingsPage } from "./Settings";

import { useTemplatesStore } from "@/stores/templates";

const activeTab = ref("settings");

const menuItems = [
  {
    label: "Templates",
    command: () => {
      activeTab.value = "settings";
    },
  },
];

const templatesStore = useTemplatesStore();

onMounted(() => {
  templatesStore.initialize();
});
</script>

<template>
  <div class="flex h-full flex-col gap-1 overflow-hidden">
    <Card
      :pt="{
        body: { class: 'p-0' },
        content: { class: 'px-4 py-2' },
      }"
    >
      <template #content>
        <div class="flex items-center gap-1">
          <span class="text-base font-bold text-surface-50"
            >Screenshot Mode</span
          >
          <Menubar :model="menuItems" />
        </div>
      </template>
    </Card>

    <div class="flex-1 overflow-auto">
      <SettingsPage v-if="activeTab === 'settings'" />
    </div>
  </div>

  <ScreenshotOverlay />
</template>
