import * as cheerio from "cheerio";
import { BaseNewsCrawler } from "./base-crawler";
import { extractLegalFields, extractAffectedSubjects } from "./utils";
import type { CrawlerResult } from "./types";

const RSS_URL = "https://xaydungchinhsach.chinhphu.vn/home.rss";

const MAX_ITEMS = 15;

const POLICY_KEYWORDS = [
  "chính sách",
  "nghị định",
  "thông tư",
  "quy định",
  "luật",
  "sửa đổi",
  "dự thảo",
  "quyết định",
  "nghị quyết",
  "quy phạm",
  "pháp luật",
  "ban hành",
  "có hiệu lực",
  "tiền lương",
  "công chức",
  "viên chức",
  "bảo hiểm",
];

export class PolicyDraftCrawler extends BaseNewsCrawler {
  readonly sourceName = "xaydungchinhsach";

  async crawl(): Promise<CrawlerResult[]> {
    const xml = await this.fetchXml(RSS_URL);
    const $ = cheerio.load(xml, { xmlMode: true });
    const results: CrawlerResult[] = [];

    const items = $("item").toArray().slice(0, MAX_ITEMS * 2);

    for (const item of items) {
      if (results.length >= MAX_ITEMS) break;

      const title = $(item).find("title").text().trim();
      const link = $(item).find("link").text().trim();
      const description = $(item).find("description").text().trim();
      const pubDate = $(item).find("pubDate").text().trim();

      if (!title || !link) continue;

      const combinedText = `${title} ${description}`.toLowerCase();
      const isRelevant = POLICY_KEYWORDS.some((kw) => combinedText.includes(kw));
      if (!isRelevant) continue;

      const cleanSummary = description
        .replace(/<[^>]*>/g, "")
        .replace(/&lt;[^&]*&gt;/g, "")
        .trim();

      results.push({
        title,
        summary: cleanSummary || null,
        sourceUrl: link,
        sourceName: this.sourceName,
        publishDate: pubDate ? new Date(pubDate) : null,
        documentType: "policy_direction",
        isDraft: combinedText.includes("dự thảo"),
        legalFields: extractLegalFields(combinedText),
        affectedSubjects: extractAffectedSubjects(combinedText),
      });
    }

    return results;
  }
}
