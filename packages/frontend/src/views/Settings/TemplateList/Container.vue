<script setup lang="ts">
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Column from "primevue/column";
import ConfirmDialog from "primevue/confirmdialog";
import DataTable from "primevue/datatable";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { useConfirm } from "primevue/useconfirm";
import { computed, ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useTemplatesStore } from "@/stores/templates";
import type { Template } from "@/types";

const sdk = useSDK();
const templatesStore = useTemplatesStore();
const { templates, defaultTemplateId } = storeToRefs(templatesStore);
const { deleteTemplate, setDefaultTemplate } = templatesStore;
const confirm = useConfirm();

const emit = defineEmits<{
  create: [];
  edit: [template: Template];
}>();

const searchQuery = ref("");

const filteredTemplates = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (query === "") {
    return templates.value;
  }
  return templates.value.filter((t) => t.name.toLowerCase().includes(query));
});

function isDefault(template: Template): boolean {
  return template.id === defaultTemplateId.value;
}

function handleCreate(): void {
  emit("create");
}

function handleEdit(template: Template): void {
  emit("edit", template);
}

function handleDelete(template: Template): void {
  if (isDefault(template)) {
    sdk.window.showToast("Cannot delete the default template", {
      variant: "error",
    });
    return;
  }

  confirm.require({
    message: `Are you sure you want to delete "${template.name}"?`,
    header: "Delete Template",
    icon: "fas fa-exclamation-triangle",
    rejectLabel: "Cancel",
    acceptLabel: "Delete",
    accept: async () => {
      const success = await deleteTemplate(template.id);
      if (success === true) {
        sdk.window.showToast("Template deleted", { variant: "success" });
      }
    },
  });
}

async function handleSetDefault(template: Template): Promise<void> {
  const success = await setDefaultTemplate(template.id);
  if (success === true) {
    sdk.window.showToast(`"${template.name}" is now the default template`, {
      variant: "success",
    });
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center justify-between gap-2 p-3">
      <IconField class="flex-1">
        <InputIcon class="fas fa-search" />
        <InputText
          v-model="searchQuery"
          placeholder="Search templates..."
          class="w-full"
        />
      </IconField>
      <Button
        label="Create Template"
        icon="fas fa-plus"
        size="small"
        @click="handleCreate"
      />
    </div>

    <DataTable
      :value="filteredTemplates"
      striped-rows
      class="flex-1"
      scrollable
      scroll-height="flex"
    >
      <Column field="name" header="Name">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span
              v-if="isDefault(data)"
              class="h-2 w-2 rounded-full bg-secondary-400"
              title="Default template"
            />
            <span>{{ data.name }}</span>
          </div>
        </template>
      </Column>
      <Column header="Actions" class="w-48">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <Button
              text
              severity="contrast"
              icon="fas fa-edit"
              size="small"
              title="Edit"
              @click="handleEdit(data)"
            />
            <button
              class="p-1 transition-colors"
              :class="
                isDefault(data)
                  ? 'text-secondary-400 cursor-default'
                  : 'text-surface-400 hover:text-primary cursor-pointer'
              "
              :disabled="isDefault(data)"
              :title="isDefault(data) ? 'Default template' : 'Set as default'"
              @click="handleSetDefault(data)"
            >
              <i :class="isDefault(data) ? 'fas fa-star' : 'far fa-star'" />
            </button>
            <Button
              text
              severity="danger"
              icon="fas fa-trash"
              size="small"
              :disabled="isDefault(data)"
              title="Delete"
              @click="handleDelete(data)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="py-8 text-center text-surface-400">
          <i class="fas fa-inbox mb-2 text-3xl" />
          <p>No templates found</p>
        </div>
      </template>
    </DataTable>

    <ConfirmDialog />
  </div>
</template>
