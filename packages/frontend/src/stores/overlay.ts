import { ref, type Ref } from "vue";

type OverlayState = {
  isOpen: boolean;
  sessionId: string | undefined;
  requestId: string | undefined;
};

const overlayState: Ref<OverlayState> = ref({
  isOpen: false,
  sessionId: undefined,
  requestId: undefined,
});

export function getOverlayState(): Ref<OverlayState> {
  return overlayState;
}

export function openOverlay(sessionId: string): void {
  overlayState.value = {
    isOpen: true,
    sessionId,
    requestId: undefined,
  };
}

export function openOverlayForRequest(requestId: string): void {
  overlayState.value = {
    isOpen: true,
    sessionId: undefined,
    requestId,
  };
}

export function closeOverlay(): void {
  overlayState.value = {
    isOpen: false,
    sessionId: undefined,
    requestId: undefined,
  };
}
