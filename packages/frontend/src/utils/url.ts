type UrlParts = {
  isTls: boolean;
  host: string;
  port: number;
  path: string;
  query: string;
};

export function formatUrl(parts: UrlParts): string {
  const scheme = parts.isTls ? "https" : "http";
  const query = parts.query === "" ? "" : `?${parts.query}`;

  return `${scheme}://${parts.host}:${parts.port}${parts.path}${query}`;
}
