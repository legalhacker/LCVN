import { CrawledDocumentType } from "@prisma/client";

export interface CrawlerResult {
  title: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string;
  publishDate: Date | null;
  documentType: CrawledDocumentType;
  isDraft: boolean;
  legalFields: string[];
  affectedSubjects: string[];
  consultationStartDate?: Date | null;
  consultationEndDate?: Date | null;
  draftingAuthority?: string | null;
  expectedApprovalTime?: string | null;
  rawHtml?: string | null;
}

export interface CrawlRunResult {
  source: string;
  newItems: number;
  skipped: number;
  errors: string[];
}

export interface BaseCrawler {
  readonly sourceName: string;
  crawl(): Promise<CrawlerResult[]>;
}
