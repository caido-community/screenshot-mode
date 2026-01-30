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

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mimeMatch = parts[0]?.match(/:(.*?);/);
  const mime = mimeMatch?.[1] ?? "image/png";
  const base64Data = parts[1] ?? "";
  const binary = atob(base64Data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
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

export async function captureAndCopyToClipboard(
  element: HTMLElement,
): Promise<{ success: boolean; error?: string }> {
  try {
    const dataUrl = await renderElement(element);
    const blob = dataUrlToBlob(dataUrl);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
