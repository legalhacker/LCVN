import * as cheerio from "cheerio";
import { BaseNewsCrawler } from "./base-crawler";
import { extractLegalFields, extractAffectedSubjects } from "./utils";
import type { CrawlerResult } from "./types";

const VNEXPRESS_RSS_URL = "https://vnexpress.net/rss/phap-luat.rss";

const LEGAL_KEYWORDS = [
  "luật",
  "nghị định",
  "thông tư",
  "quy định",
  "pháp luật",
  "sửa đổi",
  "bổ sung",
  "ban hành",
  "có hiệu lực",
  "dự thảo",
  "quyết định",
  "nghị quyết",
  "chính sách",
  "xử phạt",
  "quy phạm",
];

const MAX_ITEMS = 20;

export class NewsLegalCrawler extends BaseNewsCrawler {
  readonly sourceName = "vnexpress";

  async crawl(): Promise<CrawlerResult[]> {
    const xml = await this.fetchXml(VNEXPRESS_RSS_URL);
    const $ = cheerio.load(xml, { xmlMode: true });
    const results: CrawlerResult[] = [];

    const items = $("item").toArray().slice(0, MAX_ITEMS);

    for (const item of items) {
      const title = $(item).find("title").text().trim();
      const link = $(item).find("link").text().trim();
      const description = $(item).find("description").text().trim();
      const pubDate = $(item).find("pubDate").text().trim();

      if (!title || !link) continue;

      const combinedText = `${title} ${description}`.toLowerCase();
      const isLegal = LEGAL_KEYWORDS.some((kw) => combinedText.includes(kw));
      if (!isLegal) continue;

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
        documentType: combinedText.includes("dự thảo") ? "draft" : "law",
        isDraft: combinedText.includes("dự thảo"),
        legalFields: extractLegalFields(combinedText),
        affectedSubjects: extractAffectedSubjects(combinedText),
      });
    }

    return results;
  }
}
