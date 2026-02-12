import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllTopicSlugs, getDocumentsByTopic } from "@/lib/content";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push({
    url: `${BASE_URL}/`,
    changeFrequency: "weekly",
    priority: 1.0,
  });

  // Search page
  entries.push({
    url: `${BASE_URL}/search`,
    changeFrequency: "weekly",
    priority: 0.5,
  });

  // Topic pages
  const topicSlugs = getAllTopicSlugs();
  for (const slug of topicSlugs) {
    entries.push({
      url: `${BASE_URL}/topic/${slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    });

    // Document pages under each topic
    const docs = getDocumentsByTopic(slug);
    for (const doc of docs) {
      entries.push({
        url: `${BASE_URL}/document/${doc.slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Article source pages from database
  const documents = await prisma.legalDocument.findMany({
    include: {
      articles: {
        orderBy: { articleNumber: "asc" },
        select: { articleNumber: true },
      },
    },
  });

  for (const doc of documents) {
    for (const article of doc.articles) {
      entries.push({
        url: `${BASE_URL}/luat/${doc.slug}/${doc.year}/dieu-${article.articleNumber}`,
        changeFrequency: "yearly",
        priority: 0.9,
      });
    }
  }

  return entries;
}
