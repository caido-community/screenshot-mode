import { describe, expect, it } from "vitest";

import { filterHeaders } from "./headers";

const RAW_REQUEST = [
  "GET / HTTP/1.1",
  "Host: example.com",
  "Accept: text/html",
  "Content-Type: application/json",
  "X-Custom: value",
  "",
  "body content",
].join("\r\n");

describe("filterHeaders", () => {
  it("returns raw unchanged when no rules", () => {
    expect(filterHeaders(RAW_REQUEST, [])).toBe(RAW_REQUEST);
  });

  it("hides a single header", () => {
    const result = filterHeaders(RAW_REQUEST, ["Accept"]);

    expect(result).toContain("Host: example.com");
    expect(result).not.toContain("Accept: text/html");
    expect(result).toContain("Content-Type: application/json");
  });

  it("hides multiple headers", () => {
    const result = filterHeaders(RAW_REQUEST, ["Accept", "X-Custom"]);

    expect(result).not.toContain("Accept: text/html");
    expect(result).not.toContain("X-Custom: value");
    expect(result).toContain("Host: example.com");
  });

  it("is case-insensitive", () => {
    const result = filterHeaders(RAW_REQUEST, ["accept", "HOST"]);

    expect(result).not.toContain("Accept: text/html");
    expect(result).not.toContain("Host: example.com");
    expect(result).toContain("Content-Type: application/json");
  });

  it("preserves the request line", () => {
    const result = filterHeaders(RAW_REQUEST, ["Host", "Accept"]);

    expect(result).toContain("GET / HTTP/1.1");
  });

  it("preserves the body", () => {
    const result = filterHeaders(RAW_REQUEST, ["Host", "Accept"]);

    expect(result).toContain("body content");
  });

  it("shows a header with ! prefix even without hide rules", () => {
    const result = filterHeaders(RAW_REQUEST, ["!Accept"]);

    expect(result).toContain("Accept: text/html");
    expect(result).toContain("Host: example.com");
  });

  it("! prefix overrides a hide rule for the same header", () => {
    const result = filterHeaders(RAW_REQUEST, ["Accept", "!Accept"]);

    expect(result).toContain("Accept: text/html");
  });

  it("hides some and shows others with mixed rules", () => {
    const result = filterHeaders(RAW_REQUEST, [
      "Accept",
      "Content-Type",
      "!Content-Type",
    ]);

    expect(result).not.toContain("Accept: text/html");
    expect(result).toContain("Content-Type: application/json");
    expect(result).toContain("Host: example.com");
  });

  it("does not affect body content even if it looks like a header", () => {
    const raw = [
      "GET / HTTP/1.1",
      "Host: example.com",
      "",
      "Accept: should-stay",
    ].join("\r\n");

    const result = filterHeaders(raw, ["Accept"]);

    expect(result).not.toContain("Accept: text/html");
    expect(result).toContain("Accept: should-stay");
  });
});
