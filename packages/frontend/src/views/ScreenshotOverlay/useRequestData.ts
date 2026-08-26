import { ref } from "vue";

import { useEntry } from "./useEntry";

import { useSDK } from "@/plugins/sdk";
import { type OverlayTarget, type ResponseMeta, type Variant } from "@/types";
import { isPresent } from "@/utils/optional";
import { toVariants } from "@/utils/variants";

export function useRequestData() {
  const sdk = useSDK();
  const { getActiveRequestId } = useEntry();

  const requestRaw = ref("");
  const responseRaw = ref("");
  const urlInfo = ref<{ url: string; sni: string | undefined }>({
    url: "",
    sni: undefined,
  });
  const responseInfo = ref<ResponseMeta | undefined>(undefined);
  const requestVariants = ref<Variant[]>([]);
  const responseVariants = ref<Variant[]>([]);
  const selectedRequestId = ref("");
  const selectedResponseId = ref("");

  function clearResponse(): void {
    responseRaw.value = "";
    responseInfo.value = undefined;
    responseVariants.value = [];
    selectedResponseId.value = "";
  }

  function clear(): void {
    requestRaw.value = "";
    urlInfo.value = { url: "", sni: undefined };
    requestVariants.value = [];
    selectedRequestId.value = "";
    clearResponse();
  }

  function notifyFailure(subject: string, error: unknown): void {
    const message = error instanceof Error ? error.message : "Unknown error";
    sdk.window.showToast(`Failed to load ${subject}: ${message}`, {
      variant: "error",
    });
  }

  async function loadResponse(
    responseId: string,
    preloadedRaw: string | undefined,
  ): Promise<void> {
    try {
      const { response } = await sdk.graphql.response({ id: responseId });
      if (!isPresent(response)) {
        clearResponse();
        return;
      }

      responseRaw.value = preloadedRaw ?? response.raw;
      responseInfo.value = {
        length: response.length,
        roundtripTime: response.roundtripTime,
      };
      responseVariants.value = toVariants(response, response.edits);
      selectedResponseId.value = response.id;
    } catch (error) {
      clearResponse();
      notifyFailure("response data", error);
    }
  }

  async function loadFromRequest(target: OverlayTarget): Promise<void> {
    try {
      const { request } = await sdk.graphql.request({ id: target.requestId });
      if (!isPresent(request)) {
        clear();
        return;
      }

      requestRaw.value = target.requestRaw ?? request.raw;
      urlInfo.value = {
        url: `${request.isTls ? "https" : "http"}://${request.host}:${
          request.port
        }${request.path}${request.query}`,
        sni: request.sni ?? undefined,
      };
      requestVariants.value = toVariants(request, request.edits);
      selectedRequestId.value = request.id;

      if (isPresent(target.responseId)) {
        await loadResponse(target.responseId, target.responseRaw);
        return;
      }

      if (isPresent(request.response)) {
        await loadResponse(request.response.id, undefined);
        return;
      }

      clearResponse();
    } catch (error) {
      clear();
      notifyFailure("request data", error);
    }
  }

  async function loadFromSession(): Promise<void> {
    const activeRequestId = await getActiveRequestId();
    if (!isPresent(activeRequestId)) {
      return;
    }

    await loadFromRequest({ requestId: activeRequestId });
  }

  async function selectRequestVariant(requestId: string): Promise<void> {
    await loadFromRequest({ requestId });
  }

  async function selectResponseVariant(responseId: string): Promise<void> {
    await loadResponse(responseId, undefined);
  }

  return {
    requestRaw,
    responseRaw,
    urlInfo,
    responseInfo,
    requestVariants,
    responseVariants,
    selectedRequestId,
    selectedResponseId,
    loadFromSession,
    loadFromRequest,
    selectRequestVariant,
    selectResponseVariant,
  };
}
