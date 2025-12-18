import { toPng } from "html-to-image";

function shouldIncludeNode(node: Node): boolean {
  if (node instanceof HTMLElement) {
    // Exclude CodeMirror internal widget buffer images that can't be rendered
    if (node.classList.contains("cm-widgetBuffer")) {
      return false;
    }
  }
  return true;
}

async function renderElement(element: HTMLElement): Promise<string> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    filter: shouldIncludeNode,
  });
  return dataUrl;
}

function downloadDataUrl(dataUrl: string): void {
  const link = document.createElement("a");
  link.download = "screenshot.png";
  link.href = dataUrl;
  link.click();
}

export async function captureAndDownload(
  element: HTMLElement,
): Promise<{ success: boolean; error?: string }> {
  try {
    const dataUrl = await renderElement(element);
    downloadDataUrl(dataUrl);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
