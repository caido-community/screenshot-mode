import { describe, expect, it } from "vitest";

import {
  formatHttpMessage,
  getHttpContentType,
  MessageViewMode,
} from "./httpFormatting";

describe("formatHttpMessage", () => {
  it("keeps the exact message in raw mode", () => {
    const raw = [
      "HTTP/1.1 200 OK",
      "Content-Type: text/xml",
      "",
      '<?xml version="1.0"?><response code="200"><result ok="true"/></response>',
    ].join("\r\n");

    expect(formatHttpMessage(raw, MessageViewMode.Raw)).toBe(raw);
  });

  it("indents compact XML without changing attributes", () => {
    const raw = [
      "HTTP/1.1 200 OK",
      "Content-Type: text/xml; charset=utf-8",
      "",
      '<?xml version="1.0"?><response code="200" msg="OK"><data format="records"><record><field name="user" value="demo-user"/><field name="role" value="viewer"/></record></data></response>',
    ].join("\r\n");

    const result = formatHttpMessage(raw, MessageViewMode.Pretty);

    expect(result).toContain('\r\n  <data format="records">\r\n    <record>');
    expect(result).toContain('      <field name="role" value="viewer"/>');
    expect(result).toContain("\r\n</response>");
  });

  it("preserves quoted greater-than signs and inline text in XML", () => {
    const raw = [
      "HTTP/1.1 200 OK",
      "Content-Type: application/xml",
      "",
      '<root><item value="a > b">Example &amp; Demo</item></root>',
    ].join("\n");

    const result = formatHttpMessage(raw, MessageViewMode.Pretty);
    expect(result).toContain('  <item value="a > b">Example &amp; Demo</item>');
  });

  it("pretty prints JSON while retaining original number and key tokens", () => {
    const raw = [
      "HTTP/1.1 200 OK",
      "Content-Type: application/problem+json",
      "",
      '{"id":900719925474099312345,"same":1,"same":2,"empty":{}}',
    ].join("\r\n");

    const result = formatHttpMessage(raw, MessageViewMode.Pretty);

    expect(result).toContain('\r\n  "id": 900719925474099312345,');
    expect(result.match(/"same"/g)).toHaveLength(2);
    expect(result).toContain('"empty": {}');
  });

  it("uses the original content type after that header is hidden", () => {
    const original = [
      "HTTP/1.1 200 OK",
      "Content-Type: text/xml; charset=utf-8",
      "",
      '<response code="200"><result ok="true"/></response>',
    ].join("\r\n");
    const filtered = [
      "HTTP/1.1 200 OK",
      "",
      '<response code="200"><result ok="true"/></response>',
    ].join("\r\n");

    const result = formatHttpMessage(
      filtered,
      MessageViewMode.Pretty,
      getHttpContentType(original),
    );

    expect(result).toContain('\r\n  <result ok="true"/>');
  });

  it("keeps malformed or unsupported XML raw", () => {
    const malformed = [
      "HTTP/1.1 200 OK",
      "Content-Type: text/xml",
      "",
      "<response><result></response>",
    ].join("\r\n");
    const doctype = [
      "HTTP/1.1 200 OK",
      "Content-Type: text/xml",
      "",
      '<!DOCTYPE response [<!ENTITY demo "value">]><response>&demo;</response>',
    ].join("\r\n");

    expect(formatHttpMessage(malformed, MessageViewMode.Pretty)).toBe(
      malformed,
    );
    expect(formatHttpMessage(doctype, MessageViewMode.Pretty)).toBe(doctype);
  });

  it("splits form fields without decoding or reordering them", () => {
    const raw = [
      "POST /api/v1/search HTTP/1.1",
      "Content-Type: application/x-www-form-urlencoded; charset=utf-8",
      "",
      "query=hello+world&tag=one&tag=two&literal=%26&empty=",
    ].join("\r\n");

    const result = formatHttpMessage(raw, MessageViewMode.Pretty);

    expect(result).toContain(
      "query=hello+world\r\n&tag=one\r\n&tag=two\r\n&literal=%26\r\n&empty=",
    );
  });

  it("leaves unknown content types unchanged", () => {
    const raw = [
      "HTTP/1.1 200 OK",
      "Content-Type: application/octet-stream",
      "",
      '{"binary":"looking but explicitly typed"}',
    ].join("\r\n");

    expect(formatHttpMessage(raw, MessageViewMode.Pretty)).toBe(raw);
  });

  it("sniffs JSON only when Content-Type is absent", () => {
    const raw = [
      "HTTP/1.1 200 OK",
      "X-Demo: synthetic",
      "",
      '{"status":"ok","count":2}',
    ].join("\r\n");

    expect(formatHttpMessage(raw, MessageViewMode.Pretty)).toContain(
      '\r\n  "status": "ok",',
    );
  });
});
