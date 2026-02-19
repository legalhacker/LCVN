import * as cheerio from "cheerio";
import { BaseNewsCrawler } from "./base-crawler";
import { extractLegalFields, extractAffectedSubjects } from "./utils";
import type { CrawlerResult } from "./types";

const BASE_URL = "https://duthaoonline.quochoi.vn";
const LIST_URL = `${BASE_URL}/Pages/dsduthao/dsdt-quochoikh.aspx`;

const MAX_ITEMS = 15;

export class DuthaoOnlineCrawler extends BaseNewsCrawler {
  readonly sourceName = "duthaoonline";

  async crawl(): Promise<CrawlerResult[]> {
    const html = await this.fetchHtml(LIST_URL);

    // This site uses cookie-based bot protection (JS redirect).
    // If we get a tiny response with document.cookie, we can't proceed.
    if (html.length < 500 && html.includes("document.cookie")) {
      console.warn("[DuthaoOnlineCrawler] Bot protection detected, skipping");
      return [];
    }

    const $ = cheerio.load(html);
    const results: CrawlerResult[] = [];

    // Selectors are best-effort — update after inspecting live HTML
    const rows = $("table tr, .list-item, .box-item, .item-draft, a[href*='Pages/duthao']")
      .toArray()
      .slice(0, MAX_ITEMS * 2);

    const seen = new Set<string>();

    for (const row of rows) {
      if (results.length >= MAX_ITEMS) break;

      const linkEl = $(row).is("a") ? $(row) : $(row).find("a").first();
      const href = linkEl.attr("href");
      if (!href) continue;

      const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      if (seen.has(fullUrl)) continue;
      seen.add(fullUrl);

      const title = linkEl.text().trim();
      if (!title || title.length < 10) continue;

      let summary: string | null = null;
      let rawHtml: string | null = null;
      let consultationStartDate: Date | null = null;
      let consultationEndDate: Date | null = null;
      let draftingAuthority: string | null = null;

      try {
        const detailHtml = await this.fetchHtml(fullUrl);
        const detail$ = cheerio.load(detailHtml);
        rawHtml = detailHtml;

        // Try to extract summary
        const descEl = detail$(".detail-content p:first-of-type, .summary, .sapo, .description");
        if (descEl.length > 0) {
          summary = descEl.first().text().trim();
        }

        // Try to extract consultation dates and drafting authority from detail page
        const metaText = detail$(".info-detail, .meta-info, .box-info").text();

        const startMatch = metaText.match(
          /(?:bắt đầu|từ ngày|ngày bắt đầu)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i
        );
        if (startMatch) {
          consultationStartDate = parseVietnameseDate(startMatch[1]);
        }

        const endMatch = metaText.match(
          /(?:kết thúc|đến ngày|ngày kết thúc|hết hạn)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i
        );
        if (endMatch) {
          consultationEndDate = parseVietnameseDate(endMatch[1]);
        }

        const authorityEl = detail$(".co-quan, .drafting-authority, .info-detail span:contains('Cơ quan')");
        if (authorityEl.length > 0) {
          draftingAuthority = authorityEl.text().replace(/cơ quan[:\s]*/i, "").trim() || null;
        }
      } catch {
        // Skip detail fetch errors
      }

      const combinedText = `${title} ${summary || ""}`;

      results.push({
        title,
        summary,
        sourceUrl: fullUrl,
        sourceName: this.sourceName,
        publishDate: null,
        documentType: "draft",
        isDraft: true,
        legalFields: extractLegalFields(combinedText),
        affectedSubjects: extractAffectedSubjects(combinedText),
        consultationStartDate,
        consultationEndDate,
        draftingAuthority,
        rawHtml,
      });
    }

    return results;
  }
}

function parseVietnameseDate(dateStr: string): Date | null {
  // Handles dd/MM/yyyy or dd-MM-yyyy
  const parts = dateStr.split(/[/-]/);
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}
