import { ref, type Ref } from "vue";

type OverlayState = {
  isOpen: boolean;
} & (
  | { sessionId: string; requestId?: never }
  | { requestId: string; sessionId?: never }
  | { sessionId?: never; requestId?: never }
);

const overlayState: Ref<OverlayState> = ref({
  isOpen: false,
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

export function openOverlayWithRequest(requestId: string): void {
  overlayState.value = {
    isOpen: true,
    requestId,
  };
}

export function closeOverlay(): void {
  overlayState.value = {
    isOpen: false,
  };
}
