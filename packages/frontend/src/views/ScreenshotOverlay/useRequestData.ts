import { ref } from "vue";

import { useEntry } from "./useEntry";

import { useSDK } from "@/plugins/sdk";
import { isPresent } from "@/utils/optional";

export function useRequestData() {
  const sdk = useSDK();
  const { getActiveRequestId } = useEntry();

  const requestRaw = ref("");
  const responseRaw = ref("");
  const urlInfo = ref<{ url: string; sni: string | undefined }>({
    url: "",
    sni: undefined,
  });
  const responseInfo = ref<
    | {
        length: number;
        roundtripTime: number;
      }
    | undefined
  >(undefined);

  async function fetchRequestData(requestId: string): Promise<void> {
    const requestData = await sdk.graphql.request({ id: requestId });
    const request = requestData.request;
    if (!isPresent(request)) {
      return;
    }

    requestRaw.value = request.raw ?? "";
    urlInfo.value = {
      url: `${request.isTls ? "https" : "http"}://${request.host}:${
        request.port
      }${request.path}${request.query ?? ""}`,
      sni: request.sni ?? undefined,
    };

    if (isPresent(request.response)) {
      const responseData = await sdk.graphql.response({
        id: request.response.id,
      });
      responseRaw.value = responseData.response?.raw ?? "";
      responseInfo.value = isPresent(responseData.response)
        ? {
            length: responseData.response.length,
            roundtripTime: responseData.response.roundtripTime,
          }
        : undefined;
    } else {
      responseRaw.value = "";
      responseInfo.value = undefined;
    }
  }

  async function loadFromSession(): Promise<void> {
    const activeRequestId = await getActiveRequestId();
    if (!isPresent(activeRequestId)) {
      return;
    }

    await fetchRequestData(activeRequestId);
  }

  async function loadFromRequest(requestId: string): Promise<void> {
    await fetchRequestData(requestId);
  }

  return {
    requestRaw,
    responseRaw,
    urlInfo,
    responseInfo,
    loadFromSession,
    loadFromRequest,
  };
}
