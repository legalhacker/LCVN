/**
 * Import enriched article data from CSV
 *
 * Updates existing articles with:
 * - primaryTopic -> subjectMatter
 * - intent -> added to legalTopics
 * - importance -> importance score
 * - note -> stored in summary if notable
 *
 * Run with: npx tsx scripts/import-enriched-csv.ts
 */

import { prisma } from '../src/services/prisma.js';
import * as fs from 'fs';
import * as path from 'path';

interface EnrichedArticle {
  articleNumber: string;
  title: string;
  primaryTopic: string;
  intent: string;
  importance: number;
  note: string;
}

function parseCSV(content: string): EnrichedArticle[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].replace(/^\uFEFF/, '').split(','); // Remove BOM if present

  const articles: EnrichedArticle[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle CSV with quoted fields containing commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length >= 5) {
      articles.push({
        articleNumber: values[0],
        title: values[1],
        primaryTopic: values[2],
        intent: values[3],
        importance: parseInt(values[4], 10) || 3,
        note: values[5] || '',
      });
    }
  }

  return articles;
}

async function importEnrichedData() {
  console.log('Importing enriched article data from CSV...\n');

  // Read CSV file
  const csvPath = path.join(
    process.cwd(),
    '..',
    'legal documents',
    'luat_doanh_nghiep_enriched_roi.csv'
  );

  // Try alternate path if first doesn't exist
  let content: string;
  try {
    content = fs.readFileSync(csvPath, 'utf-8');
  } catch {
    const altPath = '/Users/thingkingman/Desktop/vietlaw-platform/legal documents/luat_doanh_nghiep_enriched_roi.csv';
    content = fs.readFileSync(altPath, 'utf-8');
  }

  const enrichedArticles = parseCSV(content);
  console.log(`Found ${enrichedArticles.length} enriched articles in CSV\n`);

  // Get document slug for Luật Doanh nghiệp
  const docSlug = 'luat-doanh-nghiep-vbhn-2025';

  let updated = 0;
  let notFound = 0;

  for (const enriched of enrichedArticles) {
    // Build articleId pattern to match
    const articleId = `${docSlug}:điều-${enriched.articleNumber}`;

    // Find the article
    const article = await prisma.article.findFirst({
      where: {
        OR: [
          { articleId },
          { articleId: `${docSlug}:dieu-${enriched.articleNumber}` },
          {
            articleNumber: `Điều ${enriched.articleNumber}`,
            document: { titleSlug: docSlug }
          },
        ],
      },
    });

    if (!article) {
      console.log(`  ⚠ Article not found: Điều ${enriched.articleNumber}`);
      notFound++;
      continue;
    }

    // Build legalTopics array
    const legalTopics = new Set(article.legalTopics || []);
    if (enriched.primaryTopic) {
      legalTopics.add(enriched.primaryTopic);
    }
    if (enriched.intent) {
      legalTopics.add(enriched.intent);
    }

    // Update article
    await prisma.article.update({
      where: { id: article.id },
      data: {
        subjectMatter: enriched.primaryTopic || article.subjectMatter,
        legalTopics: Array.from(legalTopics),
        importance: enriched.importance,
        // Add note to summary if notable
        summary: enriched.note
          ? `${article.summary || ''} [${enriched.note}]`.trim()
          : article.summary,
      },
    });

    console.log(`  ✓ Updated Điều ${enriched.articleNumber}: ${enriched.title} (importance: ${enriched.importance})`);
    updated++;
  }

  console.log(`\n--- Import Summary ---`);
  console.log(`Updated: ${updated} articles`);
  console.log(`Not found: ${notFound} articles`);

  // Show importance distribution
  const importanceCounts = await prisma.article.groupBy({
    by: ['importance'],
    _count: { importance: true },
    orderBy: { importance: 'desc' },
  });

  console.log('\n--- Updated Importance Distribution ---');
  for (const ic of importanceCounts) {
    console.log(`Level ${ic.importance}: ${ic._count.importance} articles`);
  }
}

// Run
importEnrichedData()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
