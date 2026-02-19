import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-auth";
import { NewsLegalCrawler } from "@/lib/crawlers/news-crawler";
import { PolicyDraftCrawler } from "@/lib/crawlers/policy-draft-crawler";
import { DuthaoOnlineCrawler } from "@/lib/crawlers/duthao-crawler";
import { saveNewItems } from "@/lib/crawlers/utils";
import type { CrawlRunResult } from "@/lib/crawlers/types";

export const maxDuration = 60;

export async function POST() {
  const { error, status } = await requireAuth("admin");
  if (error) return NextResponse.json({ error }, { status });

  const crawlers = [
    new NewsLegalCrawler(),
    new PolicyDraftCrawler(),
    new DuthaoOnlineCrawler(),
  ];

  const results: CrawlRunResult[] = [];

  const settled = await Promise.allSettled(
    crawlers.map(async (crawler) => {
      const items = await crawler.crawl();
      return saveNewItems(items, crawler.sourceName);
    })
  );

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      results.push(outcome.value);
    } else {
      const message =
        outcome.reason instanceof Error
          ? outcome.reason.message
          : String(outcome.reason);
      results.push({
        source: "unknown",
        newItems: 0,
        skipped: 0,
        errors: [message],
      });
    }
  }

  const totalNew = results.reduce((sum, r) => sum + r.newItems, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  return NextResponse.json({
    summary: { totalNew, totalSkipped, totalErrors },
    results,
  });
}
