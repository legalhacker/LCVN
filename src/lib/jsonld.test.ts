import { describe, it, expect } from "vitest";
import { buildArticleJsonLd, buildDocumentJsonLd, buildClauseJsonLd, buildPointJsonLd } from "./jsonld";
import type { ArticleWithChildren, DocumentMeta, ClauseWithChildren, PointData } from "@/types/legal";

const mockDoc: DocumentMeta = {
  canonicalId: "VN_LLD_2019",
  title: "Bộ luật Lao động",
  documentNumber: "45/2019/QH14",
  documentType: "luat",
  issuingBody: "Quốc hội",
  issuedDate: "2019-11-20",
  effectiveDate: "2021-01-01",
  slug: "bo-luat-lao-dong",
  year: 2019,
  status: "active",
};

const mockArticle: ArticleWithChildren = {
  id: "test-article-id",
  canonicalId: "VN_LLD_2019_D35",
  articleNumber: 35,
  title: "Quyền đơn phương chấm dứt hợp đồng lao động của người lao động",
  content: "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động.",
  chapter: "Chương III",
  section: "Mục 4",
  document: mockDoc,
  clauses: [
    {
      id: "clause-1-id",
      canonicalId: "VN_LLD_2019_D35_K1",
      clauseNumber: 1,
      content: "Người lao động phải báo trước cho người sử dụng lao động.",
      points: [
        {
          id: "point-a-id",
          canonicalId: "VN_LLD_2019_D35_K1_A",
          pointLetter: "a",
          content: "Ít nhất 45 ngày nếu làm việc theo hợp đồng không xác định thời hạn;",
        },
        {
          id: "point-b-id",
          canonicalId: "VN_LLD_2019_D35_K1_B",
          pointLetter: "b",
          content: "Ít nhất 30 ngày nếu hợp đồng 12–36 tháng;",
        },
      ],
    },
    {
      id: "clause-2-id",
      canonicalId: "VN_LLD_2019_D35_K2",
      clauseNumber: 2,
      content: "Không cần báo trước trong trường hợp sau:",
      points: [],
    },
  ],
};

describe("buildArticleJsonLd", () => {
  const jsonLd = buildArticleJsonLd(mockArticle);

  it("has correct @type", () => {
    expect(jsonLd["@type"]).toBe("Legislation");
    expect(jsonLd["@context"]).toBe("https://schema.org");
  });

  it("uses official document number as legislationIdentifier", () => {
    expect(jsonLd.legislationIdentifier).toBe("45/2019/QH14");
  });

  it("uses canonical ID as identifier", () => {
    expect(jsonLd.identifier).toBe("VN_LLD_2019_D35");
  });

  it("includes articleNumber as numeric", () => {
    expect(jsonLd.articleNumber).toBe(35);
  });

  it("includes both published and enacted dates", () => {
    expect(jsonLd.datePublished).toBe("2019-11-20");
    expect(jsonLd.dateEnacted).toBe("2019-11-20");
    expect(jsonLd.legislationDateVersion).toBe("2021-01-01");
  });

  it("includes jurisdiction", () => {
    expect(jsonLd.legislationJurisdiction).toBe("VN");
    expect(jsonLd.jurisdiction).toEqual({
      "@type": "Country",
      name: "Việt Nam",
      identifier: "VN",
    });
  });

  it("uses GovernmentOrganization for authority", () => {
    expect(jsonLd.legislationPassedBy).toEqual({
      "@type": "GovernmentOrganization",
      name: "Quốc hội",
      identifier: "VN_QH",
    });
  });

  it("includes article text for AI verification", () => {
    expect(jsonLd.text).toBe(mockArticle.content);
  });

  it("builds correct canonical URL", () => {
    expect(jsonLd.url).toBe(
      "https://lcvn.vn/luat/bo-luat-lao-dong/2019/dieu-35",
    );
    expect(jsonLd.mainEntityOfPage).toBe(jsonLd.url);
  });

  it("includes article name with title", () => {
    expect(jsonLd.name).toBe(
      "Điều 35. Quyền đơn phương chấm dứt hợp đồng lao động của người lao động",
    );
  });

  it("includes English alternateName", () => {
    expect(jsonLd.alternateName).toContain("Article 35");
  });

  it("links clauses with fragment anchors", () => {
    const parts = jsonLd.hasPart as Array<Record<string, unknown>>;
    expect(parts).toHaveLength(2);
    expect(parts[0].url).toBe(
      "https://lcvn.vn/luat/bo-luat-lao-dong/2019/dieu-35#khoan-1",
    );
    expect(parts[1].url).toBe(
      "https://lcvn.vn/luat/bo-luat-lao-dong/2019/dieu-35#khoan-2",
    );
  });

  it("includes clause text inline", () => {
    const parts = jsonLd.hasPart as Array<Record<string, unknown>>;
    expect(parts[0].text).toBe(mockArticle.clauses[0].content);
  });

  it("nests points inside clauses with anchors", () => {
    const parts = jsonLd.hasPart as Array<Record<string, unknown>>;
    const clause1 = parts[0];
    const points = clause1.hasPart as Array<Record<string, unknown>>;
    expect(points).toHaveLength(2);
    expect(points[0].identifier).toBe("VN_LLD_2019_D35_K1_A");
    expect(points[0].url).toBe(
      "https://lcvn.vn/luat/bo-luat-lao-dong/2019/dieu-35#khoan-1-diem-a",
    );
    expect(points[0].text).toBe(mockArticle.clauses[0].points[0].content);
  });

  it("omits hasPart on clauses with no points", () => {
    const parts = jsonLd.hasPart as Array<Record<string, unknown>>;
    expect(parts[1].hasPart).toBeUndefined();
  });

  it("includes parent document in isPartOf", () => {
    const parent = jsonLd.isPartOf as Record<string, unknown>;
    expect(parent["@type"]).toBe("Legislation");
    expect(parent.name).toBe("Bộ luật Lao động");
    expect(parent.identifier).toBe("VN_LLD_2019");
    expect(parent.legislationJurisdiction).toBe("VN");
  });

  it("sets language to Vietnamese", () => {
    expect(jsonLd.inLanguage).toBe("vi");
  });
});

describe("buildArticleJsonLd without title", () => {
  it("uses plain article number as name", () => {
    const noTitle = { ...mockArticle, title: null };
    const jsonLd = buildArticleJsonLd(noTitle);
    expect(jsonLd.name).toBe("Điều 35");
    expect(jsonLd.alternateName).toBe("Article 35");
  });
});

describe("buildDocumentJsonLd", () => {
  const jsonLd = buildDocumentJsonLd(mockDoc);

  it("has correct type and name", () => {
    expect(jsonLd["@type"]).toBe("Legislation");
    expect(jsonLd.name).toBe("Bộ luật Lao động");
  });

  it("includes dates", () => {
    expect(jsonLd.datePublished).toBe("2019-11-20");
    expect(jsonLd.legislationDateVersion).toBe("2021-01-01");
  });

  it("builds correct URL", () => {
    expect(jsonLd.url).toBe("https://lcvn.vn/doc/bo-luat-lao-dong/2019");
  });
});

describe("buildClauseJsonLd", () => {
  const clause: ClauseWithChildren = mockArticle.clauses[0];
  const article = { canonicalId: "VN_LLD_2019_D35", articleNumber: 35, title: mockArticle.title };
  const jsonLd = buildClauseJsonLd(clause, article, mockDoc);

  it("has correct name", () => {
    expect(jsonLd.name).toBe("Khoản 1, Điều 35");
  });

  it("references parent article", () => {
    const parent = jsonLd.isPartOf as Record<string, unknown>;
    expect(parent.legislationIdentifier).toBe("VN_LLD_2019_D35");
  });

  it("includes child points", () => {
    const parts = jsonLd.hasPart as Array<Record<string, unknown>>;
    expect(parts).toHaveLength(2);
    expect(parts[0].name).toBe("Điểm a");
  });
});

describe("buildPointJsonLd", () => {
  const point: PointData = mockArticle.clauses[0].points[0];
  const clause = { canonicalId: "VN_LLD_2019_D35_K1", clauseNumber: 1 };
  const article = { canonicalId: "VN_LLD_2019_D35", articleNumber: 35 };
  const jsonLd = buildPointJsonLd(point, clause, article, mockDoc);

  it("has correct name", () => {
    expect(jsonLd.name).toBe("Điểm a, Khoản 1, Điều 35");
  });

  it("references parent clause", () => {
    const parent = jsonLd.isPartOf as Record<string, unknown>;
    expect(parent.name).toBe("Khoản 1");
    expect(parent.legislationIdentifier).toBe("VN_LLD_2019_D35_K1");
  });

  it("builds correct point URL", () => {
    expect(jsonLd.url).toBe(
      "https://lcvn.vn/luat/bo-luat-lao-dong/2019/dieu-35/khoan-1/diem-a",
    );
  });
});
