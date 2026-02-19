import type { BaseCrawler, CrawlerResult } from "./types";

// Undici-based fetch options type for Node.js TLS
interface FetchOptions extends RequestInit {
  dispatcher?: unknown;
}

export abstract class BaseNewsCrawler implements BaseCrawler {
  abstract readonly sourceName: string;
  abstract crawl(): Promise<CrawlerResult[]>;

  private async getDispatcher() {
    // In development, some Vietnamese gov sites use certs that Node doesn't trust.
    // Use undici Agent to skip TLS verification only in dev.
    if (process.env.NODE_ENV !== "production") {
      try {
        const { Agent } = await import("undici");
        return new Agent({ connect: { rejectUnauthorized: false } });
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  protected async fetchHtml(url: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const dispatcher = await this.getDispatcher();
      const options: FetchOptions = {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; LCVNCrawler/1.0; +https://lcvn.vn)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.5",
        },
      };
      if (dispatcher) {
        options.dispatcher = dispatcher;
      }

      const res = await (fetch as (url: string, init?: FetchOptions) => Promise<Response>)(url, options);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      return await res.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  protected async fetchXml(url: string): Promise<string> {
    return this.fetchHtml(url);
  }
}
