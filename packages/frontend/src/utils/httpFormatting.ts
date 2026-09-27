export const MessageViewMode = {
  Pretty: "pretty",
  Raw: "raw",
} as const;

export type MessageViewMode =
  (typeof MessageViewMode)[keyof typeof MessageViewMode];

type HttpMessageParts = {
  body: string;
  contentType: string | undefined;
  head: string;
  newline: "\r\n" | "\n";
  separator: string;
};

function splitHttpMessage(raw: string): HttpMessageParts | undefined {
  const match = /\r?\n\r?\n/.exec(raw);
  if (match?.index === undefined) return undefined;

  const head = raw.slice(0, match.index);
  const contentTypeMatch = /^content-type\s*:\s*([^;\r\n]+)/im.exec(head);

  return {
    head,
    separator: match[0],
    body: raw.slice(match.index + match[0].length),
    newline:
      head.includes("\r\n") || match[0].startsWith("\r\n") ? "\r\n" : "\n",
    contentType: contentTypeMatch?.[1]?.trim().toLowerCase(),
  };
}

export function getHttpContentType(raw: string): string | undefined {
  const match = /\r?\n\r?\n/.exec(raw);
  const head = match?.index === undefined ? raw : raw.slice(0, match.index);
  return /^content-type\s*:\s*([^;\r\n]+)/im
    .exec(head)?.[1]
    ?.trim()
    .toLowerCase();
}

function readMarkupToken(input: string, start: number): number | undefined {
  if (input.startsWith("<!--", start)) {
    const end = input.indexOf("-->", start + 4);
    return end < 0 ? undefined : end + 3;
  }

  if (input.startsWith("<![CDATA[", start)) {
    const end = input.indexOf("]]>", start + 9);
    return end < 0 ? undefined : end + 3;
  }

  if (input.startsWith("<?", start)) {
    const end = input.indexOf("?>", start + 2);
    return end < 0 ? undefined : end + 2;
  }

  let quote: '"' | "'" | undefined;
  for (let index = start + 1; index < input.length; index++) {
    const character = input[index];
    if (quote !== undefined) {
      if (character === quote) quote = undefined;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ">") {
      return index + 1;
    }
  }

  return undefined;
}

function tokenizeMarkup(input: string): string[] | undefined {
  const tokens: string[] = [];
  let position = 0;

  while (position < input.length) {
    const tagStart = input.indexOf("<", position);
    if (tagStart < 0) {
      tokens.push(input.slice(position));
      break;
    }

    if (tagStart > position) tokens.push(input.slice(position, tagStart));

    const tagEnd = readMarkupToken(input, tagStart);
    if (tagEnd === undefined) return undefined;
    tokens.push(input.slice(tagStart, tagEnd));
    position = tagEnd;
  }

  return tokens;
}

function getOpeningTagName(token: string): string | undefined {
  return /^<\s*([^\s/>]+)/.exec(token)?.[1];
}

function getClosingTagName(token: string): string | undefined {
  return /^<\/\s*([^\s>]+)/.exec(token)?.[1];
}

function prettyXml(body: string, newline: string): string | undefined {
  const normalizedBody = body.replace(/^\uFEFF/, "").trim();
  if (!normalizedBody.startsWith("<") || /<!DOCTYPE/i.test(normalizedBody)) {
    return undefined;
  }

  const tokens = tokenizeMarkup(normalizedBody);
  if (tokens === undefined) return undefined;

  const lines: string[] = [];
  const elementStack: string[] = [];
  let elementCount = 0;

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]?.trim() ?? "";
    if (token.length === 0) continue;

    const isTag = token.startsWith("<");
    const isClosingTag = /^<\//.test(token);
    const isStandaloneTag =
      /^<\?/.test(token) || /^<!/.test(token) || /\/\s*>$/.test(token);
    const isOpeningTag = isTag && !isClosingTag && !isStandaloneTag;

    if (!isTag) {
      const nextToken = tokens[index + 1]?.trim() ?? "";
      const closingName = getClosingTagName(nextToken);
      const currentName = elementStack.at(-1);
      if (closingName === undefined || closingName !== currentName) {
        return undefined;
      }

      const previousLine = lines.at(-1);
      if (previousLine === undefined) return undefined;
      lines[lines.length - 1] = `${previousLine}${token}${nextToken}`;
      elementStack.pop();
      elementCount++;
      index++;
      continue;
    }

    if (isClosingTag) {
      const closingName = getClosingTagName(token);
      if (closingName === undefined || elementStack.pop() !== closingName) {
        return undefined;
      }
    }

    if (!/^<\?/.test(token) && !/^<!/.test(token)) elementCount++;

    lines.push(`${"  ".repeat(elementStack.length)}${token}`);

    if (isOpeningTag) {
      const openingName = getOpeningTagName(token);
      if (openingName === undefined) return undefined;
      elementStack.push(openingName);
    }
  }

  if (elementStack.length !== 0 || elementCount === 0) return undefined;
  return lines.join(newline);
}

function prettyJson(body: string, newline: string): string | undefined {
  try {
    JSON.parse(body);
  } catch {
    return undefined;
  }

  const source = body.trim();
  const output: string[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;

  const startLine = () => {
    output.push(newline, "  ".repeat(depth));
  };

  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (character === undefined) continue;

    if (inString) {
      output.push(character);
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
      output.push(character);
    } else if (character === "{" || character === "[") {
      const closingCharacter = character === "{" ? "}" : "]";
      let nextIndex = index + 1;
      while (/\s/.test(source[nextIndex] ?? "")) nextIndex++;
      if (source[nextIndex] === closingCharacter) {
        output.push(character, closingCharacter);
        index = nextIndex;
      } else {
        output.push(character);
        depth++;
        startLine();
      }
    } else if (character === "}" || character === "]") {
      depth--;
      startLine();
      output.push(character);
    } else if (character === ",") {
      output.push(character);
      startLine();
    } else if (character === ":") {
      output.push(": ");
    } else if (!/\s/.test(character)) {
      output.push(character);
    }
  }

  return output.join("");
}

function prettyForm(body: string, newline: string): string | undefined {
  if (!body.includes("&")) return undefined;
  return body.split("&").join(`${newline}&`);
}

export function formatHttpMessage(
  raw: string,
  mode: MessageViewMode,
  contentTypeHint?: string,
): string {
  if (mode === MessageViewMode.Raw || raw.length === 0) return raw;

  const parts = splitHttpMessage(raw);
  if (parts === undefined || parts.body.trim().length === 0) return raw;

  const trimmedBody = parts.body.trimStart();
  const contentType = (contentTypeHint ?? parts.contentType)
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  const isJsonType =
    contentType?.endsWith("/json") === true ||
    contentType?.endsWith("+json") === true;
  const isXmlType =
    contentType?.endsWith("/xml") === true ||
    contentType?.endsWith("+xml") === true;
  const isFormType = contentType === "application/x-www-form-urlencoded";
  const looksLikeJson =
    trimmedBody.startsWith("{") || trimmedBody.startsWith("[");
  const looksLikeXml = trimmedBody.startsWith("<?xml");

  const formattedBody = isJsonType
    ? prettyJson(parts.body, parts.newline)
    : isXmlType
      ? prettyXml(parts.body, parts.newline)
      : isFormType
        ? prettyForm(parts.body, parts.newline)
        : contentType === undefined && looksLikeJson
          ? prettyJson(parts.body, parts.newline)
          : contentType === undefined && looksLikeXml
            ? prettyXml(parts.body, parts.newline)
            : undefined;

  if (formattedBody === undefined) return raw;
  return `${parts.head}${parts.separator}${formattedBody}`;
}
