/**
 * Filters headers from raw HTTP content based on header rules.
 *
 * Rules are header names, one per entry:
 * - `Accept` — hides the Accept header
 * - `!Content-Type` — always shows Content-Type, even if another rule hides it
 */
export function filterHeaders(raw: string, headerRules: string[]): string {
  if (headerRules.length === 0) {
    return raw;
  }

  const hideSet: string[] = [];
  const showSet: string[] = [];

  for (const rule of headerRules) {
    if (rule.startsWith("!")) {
      showSet.push(rule.slice(1).toLowerCase());
    } else {
      hideSet.push(rule.toLowerCase());
    }
  }

  const lines = raw.split("\r\n");
  const filteredLines: string[] = [];
  let inBody = false;

  for (const line of lines) {
    if (inBody) {
      filteredLines.push(line);
      continue;
    }

    if (line === "") {
      inBody = true;
      filteredLines.push(line);
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const headerName = line.substring(0, colonIndex).toLowerCase();

      if (showSet.includes(headerName)) {
        filteredLines.push(line);
      } else if (!hideSet.includes(headerName)) {
        filteredLines.push(line);
      }
    } else {
      filteredLines.push(line);
    }
  }

  return filteredLines.join("\r\n");
}
