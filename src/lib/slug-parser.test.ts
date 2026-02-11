import { describe, it, expect } from "vitest";
import { parseSourceSlug, parseReadingSlug } from "./slug-parser";

describe("parseSourceSlug", () => {
  it("parses document slug", () => {
    expect(parseSourceSlug(["bo-luat-lao-dong", "2019"])).toEqual({
      docSlug: "bo-luat-lao-dong",
      year: 2019,
      articleNumber: undefined,
      clauseNumber: undefined,
      pointLetter: undefined,
      entityType: "document",
    });
  });

  it("parses article slug", () => {
    expect(parseSourceSlug(["bo-luat-lao-dong", "2019", "dieu-35"])).toEqual({
      docSlug: "bo-luat-lao-dong",
      year: 2019,
      articleNumber: 35,
      clauseNumber: undefined,
      pointLetter: undefined,
      entityType: "article",
    });
  });

  it("parses clause slug", () => {
    expect(
      parseSourceSlug(["bo-luat-lao-dong", "2019", "dieu-35", "khoan-1"]),
    ).toEqual({
      docSlug: "bo-luat-lao-dong",
      year: 2019,
      articleNumber: 35,
      clauseNumber: 1,
      pointLetter: undefined,
      entityType: "clause",
    });
  });

  it("parses point slug", () => {
    expect(
      parseSourceSlug([
        "bo-luat-lao-dong",
        "2019",
        "dieu-35",
        "khoan-1",
        "diem-a",
      ]),
    ).toEqual({
      docSlug: "bo-luat-lao-dong",
      year: 2019,
      articleNumber: 35,
      clauseNumber: 1,
      pointLetter: "a",
      entityType: "point",
    });
  });

  it("returns null for too few parts", () => {
    expect(parseSourceSlug(["bo-luat-lao-dong"])).toBeNull();
    expect(parseSourceSlug([])).toBeNull();
  });

  it("returns null for invalid year", () => {
    expect(parseSourceSlug(["bo-luat-lao-dong", "abc"])).toBeNull();
  });

  it("returns null for invalid segment", () => {
    expect(
      parseSourceSlug(["bo-luat-lao-dong", "2019", "garbage"]),
    ).toBeNull();
  });

  it("handles multi-digit article numbers", () => {
    expect(
      parseSourceSlug(["bo-luat-lao-dong", "2019", "dieu-220"]),
    ).toEqual({
      docSlug: "bo-luat-lao-dong",
      year: 2019,
      articleNumber: 220,
      clauseNumber: undefined,
      pointLetter: undefined,
      entityType: "article",
    });
  });

  it("rejects uppercase point letters", () => {
    expect(
      parseSourceSlug([
        "bo-luat-lao-dong",
        "2019",
        "dieu-35",
        "khoan-1",
        "diem-A",
      ]),
    ).toBeNull();
  });
});

describe("parseReadingSlug", () => {
  it("parses document overview slug", () => {
    expect(parseReadingSlug(["bo-luat-lao-dong", "2019"])).toEqual({
      docSlug: "bo-luat-lao-dong",
      year: 2019,
      articleNumber: undefined,
      entityType: "document",
    });
  });

  it("parses article reading slug", () => {
    expect(
      parseReadingSlug(["bo-luat-lao-dong", "2019", "dieu-35"]),
    ).toEqual({
      docSlug: "bo-luat-lao-dong",
      year: 2019,
      articleNumber: 35,
      entityType: "article",
    });
  });

  it("returns null for invalid third segment", () => {
    expect(
      parseReadingSlug(["bo-luat-lao-dong", "2019", "khoan-1"]),
    ).toBeNull();
  });

  it("returns null for too few parts", () => {
    expect(parseReadingSlug(["bo-luat-lao-dong"])).toBeNull();
  });

  it("returns null for invalid year", () => {
    expect(parseReadingSlug(["bo-luat-lao-dong", "xyz"])).toBeNull();
  });
});
