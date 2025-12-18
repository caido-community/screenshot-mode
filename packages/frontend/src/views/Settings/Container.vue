<script setup lang="ts">
import Card from "primevue/card";
import { ref } from "vue";

import { TemplateEditor } from "./TemplateEditor";
import { TemplateList } from "./TemplateList";

import type { Template } from "@/types";

type View = { type: "list" } | { type: "editor"; template?: Template };

const currentView = ref<View>({ type: "list" });

function handleCreate(): void {
  currentView.value = { type: "editor" };
}

function handleEdit(template: Template): void {
  currentView.value = { type: "editor", template };
}

function handleCancel(): void {
  currentView.value = { type: "list" };
}

function handleSaved(): void {
  currentView.value = { type: "list" };
}
</script>

<template>
  <Card
    class="h-full overflow-hidden"
    :pt="{
      body: { class: 'h-full p-0' },
      content: { class: 'h-full' },
    }"
  >
    <template #content>
      <TemplateList
        v-if="currentView.type === 'list'"
        @create="handleCreate"
        @edit="handleEdit"
      />
      <TemplateEditor
        v-else
        :template="currentView.template"
        @cancel="handleCancel"
        @saved="handleSaved"
      />
    </template>
  </Card>
</template>
