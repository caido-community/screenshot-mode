const STYLE_ID = "screenshot-mode-editor-style";
const HOST_ATTRIBUTE = "data-screenshot-editor";

function createStyle(scope: string): HTMLStyleElement {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
${scope} .c-editor-http-request,
${scope} .c-editor-http-response {
  height: 100% !important;
}
${scope} .c-card {
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  height: 100% !important;
}
${scope} .c-card__header {
  display: flex !important;
  flex-shrink: 0 !important;
  border-bottom: 0.15em solid rgb(0 0 0 / 0.2) !important;
}
${scope} .c-editor-http-request__header,
${scope} .c-editor-http-response__header {
  display: flex !important;
  align-items: center !important;
  padding: 0.5rem 1rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
}
${scope} .c-card__footer {
  display: none !important;
}
${scope} .c-card__body {
  display: flex !important;
  flex: 1 1 0% !important;
  min-height: 0 !important;
}
${scope} .c-editor-http-request__body,
${scope} .c-editor-http-response__body {
  width: 100% !important;
  height: 100% !important;
}`;
  return style;
}

export function mountEditor(
  container: HTMLElement,
  element: HTMLElement,
): void {
  element.style.height = "100%";
  element.style.width = "100%";
  container.replaceChildren(element);

  const root = element.shadowRoot;
  if (root === null) {
    element.setAttribute(HOST_ATTRIBUTE, "");
    container.appendChild(createStyle(`[${HOST_ATTRIBUTE}]`));
    return;
  }

  if (root.getElementById(STYLE_ID) === null) {
    root.appendChild(createStyle(":host"));
  }
}
