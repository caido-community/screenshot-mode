import { toPng } from "html-to-image";

async function renderElement(element: HTMLElement): Promise<string> {
  const dataUrl = await toPng(element, { pixelRatio: 2 });
  return dataUrl;
}

function downloadDataUrl(dataUrl: string): void {
  const link = document.createElement("a");
  link.download = "screenshot.png";
  link.href = dataUrl;
  link.click();
}

export async function captureAndDownload(element: HTMLElement): Promise<void> {
  const dataUrl = await renderElement(element);
  downloadDataUrl(dataUrl);
}
