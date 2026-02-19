import { NextRequest, NextResponse } from "next/server";
import { DuthaoOnlineCrawler } from "@/lib/crawlers/duthao-crawler";
import { saveNewItems } from "@/lib/crawlers/utils";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const crawler = new DuthaoOnlineCrawler();
    const items = await crawler.crawl();
    const result = await saveNewItems(items, crawler.sourceName);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Crawl failed", details: message },
      { status: 500 }
    );
  }
}
