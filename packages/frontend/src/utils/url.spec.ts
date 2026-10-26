import { describe, expect, it } from "vitest";

import { formatUrl } from "./url";

const base = {
  isTls: true,
  host: "httpbin.org",
  port: 443,
  path: "/",
  query: "",
};

describe("formatUrl", () => {
  it("omits the question mark when there is no query", () => {
    expect(formatUrl(base)).toBe("https://httpbin.org:443/");
  });

  it("separates the path and query with a question mark", () => {
    expect(formatUrl({ ...base, query: "test" })).toBe(
      "https://httpbin.org:443/?test",
    );
    expect(formatUrl({ ...base, path: "/get", query: "a=1&b=2" })).toBe(
      "https://httpbin.org:443/get?a=1&b=2",
    );
  });

  it("uses http for plain connections", () => {
    expect(formatUrl({ ...base, isTls: false, port: 80 })).toBe(
      "http://httpbin.org:80/",
    );
  });
});
