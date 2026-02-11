import fs from "fs";
import path from "path";

export interface ContentDocument {
  title: string;
  documentNumber: string;
  effectiveDate: string;
  summary: string;
  slug: string;
}

export interface TopicInfo {
  slug: string;
  name: string;
  description: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

const TOPIC_META: Record<string, { name: string; description: string }> = {
  "civil-law": { name: "Civil Law", description: "Contracts, property, obligations, and civil disputes" },
  "corporate-law": { name: "Corporate Law", description: "Business formation, governance, and commercial transactions" },
  "labor-hr": { name: "Labor & HR", description: "Employment contracts, wages, termination, and worker rights" },
  "tax": { name: "Tax", description: "Corporate tax, VAT, personal income tax, and compliance" },
  "intellectual-property": { name: "Intellectual Property", description: "Trademarks, patents, copyrights, and trade secrets" },
  "environment": { name: "Environment", description: "Environmental protection, permits, and impact assessments" },
  "data-protection": { name: "Data Protection", description: "Personal data, cybersecurity, and privacy regulations" },
  "criminal-law": { name: "Criminal Law", description: "Criminal offenses, penalties, and procedural law" },
};

/** Get all topic slugs from the content directory */
export function getAllTopicSlugs(): string[] {
  try {
    return fs
      .readdirSync(CONTENT_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

/** Get topic metadata by slug */
export function getTopicInfo(slug: string): TopicInfo | null {
  const meta = TOPIC_META[slug];
  if (!meta) return null;
  return { slug, ...meta };
}

/** Get all documents in a topic folder */
export function getDocumentsByTopic(topicSlug: string): ContentDocument[] {
  const topicDir = path.join(CONTENT_DIR, topicSlug);
  try {
    return fs
      .readdirSync(topicDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const raw = fs.readFileSync(path.join(topicDir, file), "utf-8");
        return JSON.parse(raw) as ContentDocument;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

/** Get a single document by its slug, searching all topic folders */
export function getDocumentBySlug(slug: string): (ContentDocument & { topic: string }) | null {
  const topics = getAllTopicSlugs();
  for (const topic of topics) {
    const topicDir = path.join(CONTENT_DIR, topic);
    const files = fs.readdirSync(topicDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(topicDir, file), "utf-8");
      const doc = JSON.parse(raw) as ContentDocument;
      if (doc.slug === slug) {
        return { ...doc, topic };
      }
    }
  }
  return null;
}

/** Get all document slugs across all topics (for generateStaticParams) */
export function getAllDocumentSlugs(): { slug: string; topic: string }[] {
  const results: { slug: string; topic: string }[] = [];
  const topics = getAllTopicSlugs();
  for (const topic of topics) {
    const docs = getDocumentsByTopic(topic);
    for (const doc of docs) {
      results.push({ slug: doc.slug, topic });
    }
  }
  return results;
}
