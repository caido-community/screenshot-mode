import { useSDK } from "@/plugins/sdk";
import { isPresent } from "@/utils/optional";

type HistoryInfo = {
  current: number;
  total: number;
};

export const useEntry = () => {
  const sdk = useSDK();

  const extractHistory = (): HistoryInfo | undefined => {
    const historyPattern = /History\s*\((\d+)\/(\d+)\)/;

    const button = document.querySelector('button[aria-label*="History"]');
    if (isPresent(button)) {
      const ariaLabel = button.getAttribute("aria-label");
      if (ariaLabel !== null) {
        const match = ariaLabel.match(historyPattern);
        if (isPresent(match) && isPresent(match[1]) && isPresent(match[2])) {
          return {
            current: Number.parseInt(match[1], 10),
            total: Number.parseInt(match[2], 10),
          };
        }
      }
    }

    return undefined;
  };

  const getActiveRequestId = async (): Promise<string | undefined> => {
    const session = sdk.replay.getCurrentSession();
    if (!isPresent(session)) {
      return undefined;
    }

    // Very ugly DOM hack since v0.54 doesn't set the active entry when
    // the user picks it from the history list.
    const dom = extractHistory();
    if (isPresent(dom)) {
      const resp = await sdk.graphql.replayEntriesBySession({
        sessionId: session.id,
      });
      const entries = resp.replaySession?.entries?.nodes;
      if (isPresent(entries) && entries.length >= dom.current) {
        return entries[dom.current - 1]!.request?.id;
      }
    }

    const activeEntry = await sdk.graphql.activeReplayEntryBySession({
      sessionId: session.id,
    });
    const activeRequestId = activeEntry.replaySession?.activeEntry?.request?.id;
    return activeRequestId;
  };

  return {
    getActiveRequestId,
  };
};
