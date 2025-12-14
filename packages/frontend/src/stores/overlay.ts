import { ref, type Ref } from "vue";

type OverlayState = {
  isOpen: boolean;
  sessionId: string | undefined;
};

const overlayState: Ref<OverlayState> = ref({
  isOpen: false,
  sessionId: undefined,
});

export function getOverlayState(): Ref<OverlayState> {
  return overlayState;
}

export function openOverlay(sessionId: string): void {
  overlayState.value = {
    isOpen: true,
    sessionId,
  };
}

export function closeOverlay(): void {
  overlayState.value = {
    isOpen: false,
    sessionId: undefined,
  };
}
