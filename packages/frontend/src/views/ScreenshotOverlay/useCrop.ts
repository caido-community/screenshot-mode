import { type ComputedRef, onUnmounted, ref } from "vue";

import { useTabsStore } from "@/stores/tabs";

export function useCrop(
  sessionId: ComputedRef<string | undefined>,
  getCaptureElement: () => HTMLElement | undefined,
) {
  const { getCropSizes, setCropSizes } = useTabsStore();

  const cropMaxHeight = ref<number | undefined>(undefined);
  let isDragging = false;
  let dragStartY = 0;
  let dragStartHeight = 0;

  function getCropHeight(): number | undefined {
    const sid = sessionId.value;
    if (sid === undefined) return undefined;
    const stored = getCropSizes(sid);

    return stored.active ? stored.height : undefined;
  }

  function saveCropHeight(height: number | undefined): void {
    const sid = sessionId.value;
    if (sid === undefined) return;
    if (height === undefined) {
      setCropSizes(sid, { height: 0, active: false });
    } else {
      setCropSizes(sid, { height, active: true });
    }
  }

  function restoreCropHeight(): void {
    cropMaxHeight.value = getCropHeight();
  }

  function handleCropDragStart(e: MouseEvent): void {
    e.preventDefault();
    isDragging = true;
    dragStartY = e.clientY;
    const captureEl = getCaptureElement();
    dragStartHeight = cropMaxHeight.value ?? captureEl?.clientHeight ?? 0;

    document.addEventListener("mousemove", handleCropDragMove);
    document.addEventListener("mouseup", handleCropDragEnd);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }

  function handleCropDragMove(e: MouseEvent): void {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY;
    const newHeight = Math.max(50, dragStartHeight + delta);
    cropMaxHeight.value = newHeight;
    saveCropHeight(newHeight);
  }

  function handleCropDragEnd(): void {
    isDragging = false;
    document.removeEventListener("mousemove", handleCropDragMove);
    document.removeEventListener("mouseup", handleCropDragEnd);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }

  function handleCropReset(): void {
    cropMaxHeight.value = undefined;
    saveCropHeight(undefined);
  }

  onUnmounted(() => {
    document.removeEventListener("mousemove", handleCropDragMove);
    document.removeEventListener("mouseup", handleCropDragEnd);
  });

  return {
    cropMaxHeight,
    restoreCropHeight,
    handleCropDragStart,
    handleCropReset,
  };
}
