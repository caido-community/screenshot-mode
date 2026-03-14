<script setup lang="ts">
import SelectButton from "primevue/selectbutton";
import Textarea from "primevue/textarea";
import { computed, ref } from "vue";

import {
  HeaderTarget,
  type HeaderTarget as HeaderTargetType,
  type ShownHeaders,
} from "@/types";

const model = defineModel<ShownHeaders>({ required: true });

const headerTargetOptions = [
  { label: "Both", value: HeaderTarget.Both },
  { label: "Request", value: HeaderTarget.Request },
  { label: "Response", value: HeaderTarget.Response },
];

const headerTarget = ref<HeaderTargetType>(HeaderTarget.Both);

const headersText = computed({
  get: () => model.value[headerTarget.value].join("\n"),
  set: (value: string) => {
    const headers = value
      .split("\n")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);
    model.value = { ...model.value, [headerTarget.value]: headers };
  },
});
</script>

<template>
  <div class="flex flex-1 flex-col rounded-lg border border-surface-600 p-4">
    <div class="mb-2 flex items-center gap-2">
      <div
        class="flex h-5 w-5 items-center justify-center rounded bg-surface-600"
      >
        <i class="fas fa-eye text-xs text-surface-300" />
      </div>
      <label class="text-sm font-medium text-surface-200"
        >Headers to Show</label
      >
    </div>
    <p class="mb-2 text-xs text-surface-400">
      Always show these headers, even if hidden
    </p>
    <SelectButton
      v-model="headerTarget"
      :options="headerTargetOptions"
      option-label="label"
      option-value="value"
      class="mb-2 w-full"
    />
    <Textarea
      v-model="headersText"
      placeholder="Enter headers to always show, one per line"
      class="min-h-32 w-full flex-1 font-mono text-sm"
      :pt="{
        root: { style: 'resize: vertical' },
      }"
    />
  </div>
</template>
