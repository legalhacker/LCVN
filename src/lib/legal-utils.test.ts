import { describe, it, expect } from "vitest";
import {
  buildCanonicalId,
  parseCanonicalId,
  buildSourceUrl,
  buildReadingUrl,
  getRelationshipLabel,
  getEntityTypeLabel,
} from "./legal-utils";

describe("buildCanonicalId", () => {
  it("builds document-level ID", () => {
    expect(buildCanonicalId({ docPrefix: "VN_LLD", year: 2019 })).toBe(
      "VN_LLD_2019",
    );
  });

  it("builds article-level ID", () => {
    expect(
      buildCanonicalId({ docPrefix: "VN_LLD", year: 2019, articleNumber: 35 }),
    ).toBe("VN_LLD_2019_D35");
  });

  it("builds clause-level ID", () => {
    expect(
      buildCanonicalId({
        docPrefix: "VN_LLD",
        year: 2019,
        articleNumber: 35,
        clauseNumber: 1,
      }),
    ).toBe("VN_LLD_2019_D35_K1");
  });

  it("builds point-level ID", () => {
    expect(
      buildCanonicalId({
        docPrefix: "VN_LLD",
        year: 2019,
        articleNumber: 35,
        clauseNumber: 1,
        pointLetter: "a",
      }),
    ).toBe("VN_LLD_2019_D35_K1_A");
  });

  it("uppercases point letter", () => {
    expect(
      buildCanonicalId({
        docPrefix: "VN_LLD",
        year: 2019,
        articleNumber: 35,
        clauseNumber: 2,
        pointLetter: "g",
      }),
    ).toBe("VN_LLD_2019_D35_K2_G");
  });
});

describe("parseCanonicalId", () => {
  it("parses document ID", () => {
    const result = parseCanonicalId("VN_LLD_2019");
    expect(result).toEqual({
      docPrefix: "VN_LLD",
      year: 2019,
      articleNumber: undefined,
      clauseNumber: undefined,
      pointLetter: undefined,
      entityType: "document",
    });
  });

  it("parses article ID", () => {
    const result = parseCanonicalId("VN_LLD_2019_D35");
    expect(result).toEqual({
      docPrefix: "VN_LLD",
      year: 2019,
      articleNumber: 35,
      clauseNumber: undefined,
      pointLetter: undefined,
      entityType: "article",
    });
  });

  it("parses clause ID", () => {
    const result = parseCanonicalId("VN_LLD_2019_D35_K1");
    expect(result).toEqual({
      docPrefix: "VN_LLD",
      year: 2019,
      articleNumber: 35,
      clauseNumber: 1,
      pointLetter: undefined,
      entityType: "clause",
    });
  });

  it("parses point ID", () => {
    const result = parseCanonicalId("VN_LLD_2019_D35_K1_A");
    expect(result).toEqual({
      docPrefix: "VN_LLD",
      year: 2019,
      articleNumber: 35,
      clauseNumber: 1,
      pointLetter: "a",
      entityType: "point",
    });
  });

  it("throws for missing year", () => {
    expect(() => parseCanonicalId("VN_LLD")).toThrow("Invalid canonical ID");
  });

  it("roundtrips with buildCanonicalId", () => {
    const original = {
      docPrefix: "VN_LLD",
      year: 2019,
      articleNumber: 35,
      clauseNumber: 2,
      pointLetter: "b",
    };
    const id = buildCanonicalId(original);
    const parsed = parseCanonicalId(id);
    expect(parsed.docPrefix).toBe(original.docPrefix);
    expect(parsed.year).toBe(original.year);
    expect(parsed.articleNumber).toBe(original.articleNumber);
    expect(parsed.clauseNumber).toBe(original.clauseNumber);
    expect(parsed.pointLetter).toBe(original.pointLetter);
  });
});

describe("buildSourceUrl", () => {
  it("builds document URL", () => {
    expect(buildSourceUrl({ docSlug: "bo-luat-lao-dong", year: 2019 })).toBe(
      "/luat/bo-luat-lao-dong/2019",
    );
  });

  it("builds article URL", () => {
    expect(
      buildSourceUrl({
        docSlug: "bo-luat-lao-dong",
        year: 2019,
        articleNumber: 35,
      }),
    ).toBe("/luat/bo-luat-lao-dong/2019/dieu-35");
  });

  it("builds clause URL", () => {
    expect(
      buildSourceUrl({
        docSlug: "bo-luat-lao-dong",
        year: 2019,
        articleNumber: 35,
        clauseNumber: 1,
      }),
    ).toBe("/luat/bo-luat-lao-dong/2019/dieu-35/khoan-1");
  });

  it("builds point URL", () => {
    expect(
      buildSourceUrl({
        docSlug: "bo-luat-lao-dong",
        year: 2019,
        articleNumber: 35,
        clauseNumber: 1,
        pointLetter: "a",
      }),
    ).toBe("/luat/bo-luat-lao-dong/2019/dieu-35/khoan-1/diem-a");
  });
});

describe("buildReadingUrl", () => {
  it("builds document reading URL", () => {
    expect(
      buildReadingUrl({ docSlug: "bo-luat-lao-dong", year: 2019 }),
    ).toBe("/doc/bo-luat-lao-dong/2019");
  });

  it("builds article reading URL", () => {
    expect(
      buildReadingUrl({
        docSlug: "bo-luat-lao-dong",
        year: 2019,
        articleNumber: 35,
      }),
    ).toBe("/doc/bo-luat-lao-dong/2019/dieu-35");
  });
});

describe("getRelationshipLabel", () => {
  it("returns Vietnamese label for known types", () => {
    expect(getRelationshipLabel("amended_by")).toBe("Được sửa đổi bởi");
    expect(getRelationshipLabel("replaces")).toBe("Thay thế");
    expect(getRelationshipLabel("related_to")).toBe("Liên quan đến");
    expect(getRelationshipLabel("references")).toBe("Tham chiếu");
    expect(getRelationshipLabel("implements")).toBe("Hướng dẫn thi hành");
  });

  it("returns raw type for unknown types", () => {
    expect(getRelationshipLabel("unknown_type")).toBe("unknown_type");
  });
});

describe("getEntityTypeLabel", () => {
  it("returns Vietnamese labels", () => {
    expect(getEntityTypeLabel("document")).toBe("Văn bản");
    expect(getEntityTypeLabel("article")).toBe("Điều");
    expect(getEntityTypeLabel("clause")).toBe("Khoản");
    expect(getEntityTypeLabel("point")).toBe("Điểm");
  });
});
