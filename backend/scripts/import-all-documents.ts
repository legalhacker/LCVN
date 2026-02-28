/**
 * Bulk Import Legal Documents
 *
 * Imports multiple .doc files from the legal documents folder
 * Run with: npx tsx scripts/import-all-documents.ts
 */

import { PrismaClient, DocumentType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

interface ParsedArticle {
  articleNumber: string;
  title: string;
  content: string;
  chapterNumber: string;
  chapterTitle: string;
  sectionNumber?: string;
  sectionTitle?: string;
  orderIndex: number;
}

interface DocumentConfig {
  filePath: string;
  documentNumber: string;
  title: string;
  titleSlug: string;
  documentType: DocumentType;
  issuingBody: string;
  issuedDate: Date;
  effectiveDate: Date;
  keywords: string[];
  summary: string;
}

// ============================================================================
// DOCUMENT CONFIGURATIONS
// ============================================================================

const DOCUMENTS_TO_IMPORT: DocumentConfig[] = [
  {
    filePath: '61_2020_QH14_321051.doc',
    documentNumber: '61/2020/QH14',
    title: 'Luật Đầu tư',
    titleSlug: 'luat-dau-tu-2020',
    documentType: 'LAW',
    issuingBody: 'Quốc hội',
    issuedDate: new Date('2020-06-17'),
    effectiveDate: new Date('2021-01-01'),
    keywords: ['đầu tư', 'dự án đầu tư', 'nhà đầu tư', 'ưu đãi đầu tư', 'đăng ký đầu tư', 'giấy chứng nhận đầu tư'],
    summary: 'Luật Đầu tư quy định về hoạt động đầu tư kinh doanh tại Việt Nam và đầu tư kinh doanh từ Việt Nam ra nước ngoài.',
  },
  {
    filePath: '45_2019_QH14_333670.doc',
    documentNumber: '45/2019/QH14',
    title: 'Bộ luật Lao động',
    titleSlug: 'bo-luat-lao-dong-2019',
    documentType: 'CODE',
    issuingBody: 'Quốc hội',
    issuedDate: new Date('2019-11-20'),
    effectiveDate: new Date('2021-01-01'),
    keywords: ['lao động', 'hợp đồng lao động', 'tiền lương', 'bảo hiểm xã hội', 'sa thải', 'nghỉ phép', 'người sử dụng lao động'],
    summary: 'Bộ luật Lao động quy định tiêu chuẩn lao động; quyền, nghĩa vụ, trách nhiệm của người lao động, người sử dụng lao động.',
  },
  {
    filePath: '36_2005_QH11_2633.doc',
    documentNumber: '36/2005/QH11',
    title: 'Luật Thương mại',
    titleSlug: 'luat-thuong-mai-2005',
    documentType: 'LAW',
    issuingBody: 'Quốc hội',
    issuedDate: new Date('2005-06-14'),
    effectiveDate: new Date('2006-01-01'),
    keywords: ['thương mại', 'mua bán hàng hóa', 'cung ứng dịch vụ', 'xúc tiến thương mại', 'trung gian thương mại'],
    summary: 'Luật Thương mại quy định về hoạt động thương mại thực hiện trên lãnh thổ Việt Nam.',
  },
  {
    filePath: '50_2005_QH11_7022.doc',
    documentNumber: '50/2005/QH11',
    title: 'Luật Sở hữu trí tuệ',
    titleSlug: 'luat-so-huu-tri-tue-2005',
    documentType: 'LAW',
    issuingBody: 'Quốc hội',
    issuedDate: new Date('2005-11-29'),
    effectiveDate: new Date('2006-07-01'),
    keywords: ['sở hữu trí tuệ', 'bản quyền', 'sáng chế', 'nhãn hiệu', 'kiểu dáng công nghiệp', 'quyền tác giả'],
    summary: 'Luật Sở hữu trí tuệ quy định về quyền tác giả, quyền liên quan, quyền sở hữu công nghiệp, quyền đối với giống cây trồng.',
  },
  {
    filePath: '31_2021_ND-CP_462291.doc',
    documentNumber: '31/2021/NĐ-CP',
    title: 'Nghị định quy định chi tiết và hướng dẫn thi hành một số điều của Luật Đầu tư',
    titleSlug: 'nghi-dinh-31-2021-huong-dan-luat-dau-tu',
    documentType: 'DECREE',
    issuingBody: 'Chính phủ',
    issuedDate: new Date('2021-03-26'),
    effectiveDate: new Date('2021-03-26'),
    keywords: ['nghị định', 'hướng dẫn', 'luật đầu tư', 'thủ tục đầu tư', 'đăng ký đầu tư'],
    summary: 'Nghị định quy định chi tiết và hướng dẫn thi hành một số điều của Luật Đầu tư.',
  },
  {
    filePath: '47_2021_ND-CP_470561.doc',
    documentNumber: '47/2021/NĐ-CP',
    title: 'Nghị định quy định chi tiết một số điều của Luật Doanh nghiệp',
    titleSlug: 'nghi-dinh-47-2021-huong-dan-luat-doanh-nghiep',
    documentType: 'DECREE',
    issuingBody: 'Chính phủ',
    issuedDate: new Date('2021-04-01'),
    effectiveDate: new Date('2021-04-01'),
    keywords: ['nghị định', 'hướng dẫn', 'luật doanh nghiệp', 'đăng ký doanh nghiệp', 'con dấu'],
    summary: 'Nghị định quy định chi tiết một số điều của Luật Doanh nghiệp.',
  },
  {
    filePath: '67_2025_QH15_580594.doc',
    documentNumber: '67/2025/QH15',
    title: 'Luật sửa đổi, bổ sung một số điều của Luật Đầu tư, Luật Đầu tư công và Luật PPP',
    titleSlug: 'luat-sua-doi-dau-tu-2025',
    documentType: 'LAW',
    issuingBody: 'Quốc hội',
    issuedDate: new Date('2025-01-09'),
    effectiveDate: new Date('2025-03-01'),
    keywords: ['sửa đổi', 'luật đầu tư', 'luật đầu tư công', 'PPP', 'đầu tư công'],
    summary: 'Luật sửa đổi, bổ sung một số điều của Luật Đầu tư, Luật Đầu tư công và Luật Đầu tư theo phương thức đối tác công tư.',
  },
];

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

function convertWordToText(wordPath: string): string {
  const txtPath = wordPath.replace(/\.(doc|docx)$/i, '_converted.txt');

  try {
    execSync(`textutil -convert txt -output "${txtPath}" "${wordPath}"`, { encoding: 'utf-8' });
    const content = fs.readFileSync(txtPath, 'utf-8');
    // Clean up temp file
    fs.unlinkSync(txtPath);
    return content;
  } catch (error) {
    console.error('Error converting Word file:', error);
    throw error;
  }
}

function parseDocument(text: string): ParsedArticle[] {
  const articles: ParsedArticle[] = [];
  const lines = text.split('\n');

  let currentChapter = '';
  let currentChapterTitle = '';
  let currentSection = '';
  let currentSectionTitle = '';
  let currentArticle: ParsedArticle | null = null;
  let articleContent: string[] = [];
  let orderIndex = 0;

  // Regex patterns - more flexible for different document formats
  const chapterPattern = /^(Chương [IVXLCDM]+|CHƯƠNG [IVXLCDM]+)\s*$/i;
  const sectionPattern = /^(Mục \d+|MỤC \d+)\s*$/i;
  const articlePattern = /^Điều (\d+[a-z]?)\.\s*(.*)$/i;
  const titlePattern = /^[A-ZĐÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ\s,]+$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (currentArticle && articleContent.length > 0) {
        articleContent.push('');
      }
      continue;
    }

    // Check for chapter
    const chapterMatch = line.match(chapterPattern);
    if (chapterMatch) {
      currentChapter = chapterMatch[1];
      currentSection = '';
      currentSectionTitle = '';

      // Look ahead for chapter title
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (titlePattern.test(nextLine) && !nextLine.match(articlePattern)) {
          currentChapterTitle = nextLine;
          i++; // Skip the title line
        }
      }
      continue;
    }

    // Check for section
    const sectionMatch = line.match(sectionPattern);
    if (sectionMatch) {
      currentSection = sectionMatch[1];

      // Look ahead for section title
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (titlePattern.test(nextLine) && !nextLine.match(articlePattern)) {
          currentSectionTitle = nextLine;
          i++; // Skip the title line
        }
      }
      continue;
    }

    // Check for article start
    const articleMatch = line.match(articlePattern);
    if (articleMatch) {
      // Save previous article
      if (currentArticle) {
        currentArticle.content = cleanContent(articleContent.join('\n'));
        if (currentArticle.content.length > 0) {
          articles.push(currentArticle);
        }
      }

      // Start new article
      orderIndex++;
      currentArticle = {
        articleNumber: `Điều ${articleMatch[1]}`,
        title: articleMatch[2] || '',
        content: '',
        chapterNumber: currentChapter,
        chapterTitle: currentChapterTitle,
        sectionNumber: currentSection || undefined,
        sectionTitle: currentSectionTitle || undefined,
        orderIndex: orderIndex,
      };
      articleContent = [];
      continue;
    }

    // Add content to current article
    if (currentArticle) {
      articleContent.push(line);
    }
  }

  // Save last article
  if (currentArticle) {
    currentArticle.content = cleanContent(articleContent.join('\n'));
    if (currentArticle.content.length > 0) {
      articles.push(currentArticle);
    }
  }

  return articles;
}

function cleanContent(content: string): string {
  return content
    .replace(/HYPERLINK[^[]*\[[^\]]*\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function generateArticleId(titleSlug: string, articleNumber: string): string {
  const normalized = articleNumber
    .toLowerCase()
    .replace(/điều\s+/i, 'điều-')
    .replace(/\s+/g, '-');
  return `${titleSlug}:${normalized}`;
}

function contentToHtml(content: string): string {
  const lines = content.split('\n');
  let html = '<div class="article-content">';
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    if (/^(\d+|[a-z])\)?\.\s/.test(trimmed)) {
      if (!inList) {
        html += '<ul class="legal-list">';
        inList = true;
      }
      html += `<li>${trimmed}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p>${trimmed}</p>`;
    }
  }

  if (inList) {
    html += '</ul>';
  }

  html += '</div>';
  return html;
}

function extractArticleKeywords(article: ParsedArticle): string[] {
  const keywords: string[] = [];
  const content = article.content.toLowerCase();

  const keywordPatterns = [
    'doanh nghiệp', 'công ty', 'cổ phần', 'thành viên', 'cổ đông',
    'vốn điều lệ', 'góp vốn', 'đăng ký', 'giấy chứng nhận',
    'đầu tư', 'nhà đầu tư', 'dự án', 'ưu đãi',
    'lao động', 'hợp đồng', 'tiền lương', 'bảo hiểm',
    'thương mại', 'mua bán', 'dịch vụ',
    'sở hữu trí tuệ', 'bản quyền', 'sáng chế', 'nhãn hiệu',
    'quyền', 'nghĩa vụ', 'trách nhiệm', 'xử phạt',
  ];

  for (const kw of keywordPatterns) {
    if (content.includes(kw)) {
      keywords.push(kw);
    }
  }

  if (article.title) {
    const titleWords = article.title.toLowerCase().split(/\s+/);
    for (const word of titleWords) {
      if (word.length > 2 && !keywords.includes(word)) {
        keywords.push(word);
      }
    }
  }

  return keywords.slice(0, 10);
}

function generateSummary(article: ParsedArticle): string {
  if (article.title) {
    return `${article.articleNumber} quy định về ${article.title.toLowerCase()}.`;
  }
  const firstSentence = article.content.split(/[.!?]/)[0];
  if (firstSentence.length < 200) {
    return firstSentence + '.';
  }
  return firstSentence.substring(0, 197) + '...';
}

// ============================================================================
// IMPORT FUNCTION
// ============================================================================

async function importDocument(config: DocumentConfig): Promise<{ created: number; updated: number }> {
  const fullPath = path.join(
    '/Users/thingkingman/Desktop/vietlaw-platform/legal documents',
    config.filePath
  );

  console.log(`\n📄 Processing: ${config.title}`);
  console.log(`   File: ${config.filePath}`);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠ File not found, skipping...`);
    return { created: 0, updated: 0 };
  }

  // Convert Word to text
  console.log('   Converting Word to text...');
  const text = convertWordToText(fullPath);

  // Parse articles
  console.log('   Parsing articles...');
  const articles = parseDocument(text);
  console.log(`   Found ${articles.length} articles`);

  if (articles.length === 0) {
    console.log(`   ⚠ No articles found, skipping...`);
    return { created: 0, updated: 0 };
  }

  // Create or update document
  let document = await prisma.document.findFirst({
    where: {
      OR: [
        { documentNumber: config.documentNumber },
        { titleSlug: config.titleSlug },
      ],
    },
  });

  if (!document) {
    document = await prisma.document.create({
      data: {
        documentNumber: config.documentNumber,
        title: config.title,
        titleSlug: config.titleSlug,
        documentType: config.documentType,
        issuingBody: config.issuingBody,
        issuedDate: config.issuedDate,
        effectiveDate: config.effectiveDate,
        status: 'EFFECTIVE',
        keywords: config.keywords,
        summary: config.summary,
      },
    });
    console.log(`   ✓ Created document: ${config.title}`);
  } else {
    document = await prisma.document.update({
      where: { id: document.id },
      data: {
        title: config.title,
        documentType: config.documentType,
        issuingBody: config.issuingBody,
        issuedDate: config.issuedDate,
        effectiveDate: config.effectiveDate,
        keywords: config.keywords,
        summary: config.summary,
      },
    });
    console.log(`   ✓ Updated existing document: ${config.title}`);
  }

  // Import articles
  let created = 0;
  let updated = 0;

  for (const art of articles) {
    const articleId = generateArticleId(config.titleSlug, art.articleNumber);

    const existingArticle = await prisma.article.findUnique({
      where: { articleId },
    });

    const articleData = {
      documentId: document.id,
      articleNumber: art.articleNumber,
      title: art.title || null,
      chapterNumber: art.chapterNumber || null,
      chapterTitle: art.chapterTitle || null,
      sectionNumber: art.sectionNumber || null,
      sectionTitle: art.sectionTitle || null,
      content: art.content,
      contentHtml: contentToHtml(art.content),
      orderIndex: art.orderIndex,
      keywords: extractArticleKeywords(art),
      summary: generateSummary(art),
      hasPracticalReferences: false,
    };

    if (existingArticle) {
      await prisma.article.update({
        where: { articleId },
        data: articleData,
      });
      updated++;
    } else {
      await prisma.article.create({
        data: { ...articleData, articleId },
      });
      created++;
    }
  }

  console.log(`   ✓ Created: ${created} articles`);
  console.log(`   ✓ Updated: ${updated} articles`);

  return { created, updated };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Starting bulk document import...\n');
  console.log(`📋 Documents to import: ${DOCUMENTS_TO_IMPORT.length}\n`);

  let totalCreated = 0;
  let totalUpdated = 0;
  let successCount = 0;

  for (const config of DOCUMENTS_TO_IMPORT) {
    try {
      const { created, updated } = await importDocument(config);
      totalCreated += created;
      totalUpdated += updated;
      if (created > 0 || updated > 0) {
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error importing ${config.title}:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ IMPORT COMPLETED!');
  console.log('='.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Documents processed: ${successCount}/${DOCUMENTS_TO_IMPORT.length}`);
  console.log(`   Articles created: ${totalCreated}`);
  console.log(`   Articles updated: ${totalUpdated}`);

  // Show total counts
  const totalDocs = await prisma.document.count();
  const totalArticles = await prisma.article.count();
  console.log(`\n📚 Database totals:`);
  console.log(`   Documents: ${totalDocs}`);
  console.log(`   Articles: ${totalArticles}`);

  console.log('\n⚠️  Remember to run: npx tsx scripts/sync-search.ts');
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
