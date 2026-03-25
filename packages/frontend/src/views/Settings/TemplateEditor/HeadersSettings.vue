<script setup lang="ts">
import SelectButton from "primevue/selectbutton";
import Textarea from "primevue/textarea";
import { computed, ref } from "vue";

import {
  HeaderHideTarget,
  type HeaderHideTarget as HeaderHideTargetType,
  type HiddenHeaders,
} from "@/types";

const model = defineModel<HiddenHeaders>({ required: true });

const headerTargetOptions = [
  { label: "Both", value: HeaderHideTarget.Both },
  { label: "Request", value: HeaderHideTarget.Request },
  { label: "Response", value: HeaderHideTarget.Response },
];

const headerTarget = ref<HeaderHideTargetType>(HeaderHideTarget.Both);

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
        <i class="fas fa-eye-slash text-xs text-surface-300" />
      </div>
      <label class="text-sm font-medium text-surface-200"
        >Headers to Hide</label
      >
    </div>
    <p class="mb-2 text-xs text-surface-400">
      One header per line. Prefix with ! to always show
    </p>
    <SelectButton
      v-model="headerTarget"
      :options="headerTargetOptions"
      option-label="label"
      option-value="value"
      :allow-empty="false"
      class="mb-2 w-full"
    />
    <Textarea
      v-model="headersText"
      placeholder="Enter headers to hide, one per line"
      class="min-h-32 w-full flex-1 font-mono text-sm"
      :pt="{
        root: { style: 'resize: vertical' },
      }"
    />
  </div>
</template>
