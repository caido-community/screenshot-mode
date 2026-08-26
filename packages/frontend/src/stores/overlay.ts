import { ref, type Ref } from "vue";

import { type OverlayTarget } from "@/types";

type OverlayState = {
  isOpen: boolean;
} & (
  | { sessionId: string; target?: never }
  | { target: OverlayTarget; sessionId?: never }
  | { sessionId?: never; target?: never }
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

export function openOverlayWithRequest(target: OverlayTarget): void {
  overlayState.value = {
    isOpen: true,
    target,
  };
}

export function closeOverlay(): void {
  overlayState.value = {
    isOpen: false,
  };
}
