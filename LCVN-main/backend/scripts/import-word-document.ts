import { PrismaClient } from '@prisma/client';
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
  orderIndex: number;
}

interface DocumentInfo {
  documentNumber: string;
  title: string;
  titleSlug: string;
  issuingBody: string;
  issuedDate: Date;
  effectiveDate: Date;
}

// Chapter titles mapping
const chapterTitles: Record<string, string> = {
  'Chương I': 'Những quy định chung',
  'Chương II': 'Thành lập doanh nghiệp',
  'Chương III': 'Công ty trách nhiệm hữu hạn',
  'Chương IV': 'Doanh nghiệp nhà nước',
  'Chương V': 'Công ty cổ phần',
  'Chương VI': 'Công ty hợp danh',
  'Chương VII': 'Doanh nghiệp tư nhân',
  'Chương VIII': 'Nhóm công ty',
  'Chương IX': 'Tổ chức lại, giải thể và phá sản doanh nghiệp',
  'Chương X': 'Điều khoản thi hành',
};

function convertWordToText(wordPath: string): string {
  const txtPath = wordPath.replace(/\.(doc|docx)$/i, '.txt');

  // Use textutil on macOS to convert Word to text
  try {
    execSync(`textutil -convert txt -output "${txtPath}" "${wordPath}"`, { encoding: 'utf-8' });
    const content = fs.readFileSync(txtPath, 'utf-8');
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
  let currentArticle: ParsedArticle | null = null;
  let articleContent: string[] = [];
  let orderIndex = 0;

  // Regex patterns
  const chapterPattern = /^(Chương [IVXLCDM]+)\s*$/;
  const chapterTitlePattern = /^([A-ZĐÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ\s]+)$/;
  const articlePattern = /^Điều (\d+[a-z]?)\.\s*(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines at the start of content
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
      currentChapterTitle = chapterTitles[currentChapter] || '';

      // Look ahead for chapter title if not in mapping
      if (!currentChapterTitle && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (chapterTitlePattern.test(nextLine)) {
          currentChapterTitle = nextLine;
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
        articles.push(currentArticle);
      }

      // Start new article
      orderIndex++;
      currentArticle = {
        articleNumber: `Điều ${articleMatch[1]}`,
        title: articleMatch[2] || '',
        content: '',
        chapterNumber: currentChapter,
        chapterTitle: currentChapterTitle,
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
    articles.push(currentArticle);
  }

  return articles;
}

function cleanContent(content: string): string {
  return content
    // Remove HYPERLINK references
    .replace(/HYPERLINK[^[]*\[[^\]]*\]/g, '')
    // Remove multiple consecutive empty lines
    .replace(/\n{3,}/g, '\n\n')
    // Clean up whitespace
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

    // Check if it's a numbered item (1., 2., a), b), etc.)
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

async function importDocument(
  wordFilePath: string,
  docInfo: DocumentInfo
): Promise<void> {
  console.log(`\n📄 Processing: ${path.basename(wordFilePath)}`);

  // Convert Word to text
  console.log('   Converting Word to text...');
  const text = convertWordToText(wordFilePath);

  // Parse articles
  console.log('   Parsing articles...');
  const articles = parseDocument(text);
  console.log(`   Found ${articles.length} articles`);

  // Create or update document - check by both documentNumber and titleSlug
  let document = await prisma.document.findFirst({
    where: {
      OR: [
        { documentNumber: docInfo.documentNumber },
        { titleSlug: docInfo.titleSlug },
      ],
    },
  });

  if (!document) {
    document = await prisma.document.create({
      data: {
        documentNumber: docInfo.documentNumber,
        title: docInfo.title,
        titleSlug: docInfo.titleSlug,
        documentType: 'LAW',
        issuingBody: docInfo.issuingBody,
        issuedDate: docInfo.issuedDate,
        effectiveDate: docInfo.effectiveDate,
        status: 'EFFECTIVE',
        keywords: extractKeywords(articles),
        summary: `${docInfo.title} quy định về việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động của doanh nghiệp.`,
      },
    });
    console.log(`   ✓ Created document: ${docInfo.title}`);
  } else {
    // Update existing document
    document = await prisma.document.update({
      where: { id: document.id },
      data: {
        documentNumber: docInfo.documentNumber,
        title: docInfo.title,
        issuingBody: docInfo.issuingBody,
        issuedDate: docInfo.issuedDate,
        effectiveDate: docInfo.effectiveDate,
        keywords: extractKeywords(articles),
      },
    });
    console.log(`   ✓ Updated existing document: ${docInfo.title}`);
  }

  // Import articles
  let created = 0;
  let updated = 0;

  for (const art of articles) {
    const articleId = generateArticleId(docInfo.titleSlug, art.articleNumber);

    const existingArticle = await prisma.article.findUnique({
      where: { articleId },
    });

    const articleData = {
      documentId: document.id,
      articleNumber: art.articleNumber,
      title: art.title,
      chapterNumber: art.chapterNumber,
      chapterTitle: art.chapterTitle,
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
}

function extractKeywords(articles: ParsedArticle[]): string[] {
  const keywords = new Set<string>([
    'doanh nghiệp',
    'công ty',
    'cổ phần',
    'TNHH',
    'trách nhiệm hữu hạn',
    'đăng ký kinh doanh',
    'vốn điều lệ',
    'cổ đông',
    'thành viên',
    'giải thể',
    'phá sản',
  ]);
  return Array.from(keywords);
}

function extractArticleKeywords(article: ParsedArticle): string[] {
  const keywords: string[] = [];
  const content = article.content.toLowerCase();

  // Common legal keywords
  const keywordPatterns = [
    'doanh nghiệp', 'công ty', 'cổ phần', 'thành viên', 'cổ đông',
    'vốn điều lệ', 'góp vốn', 'đăng ký', 'giấy chứng nhận',
    'đại hội đồng', 'hội đồng quản trị', 'ban kiểm soát',
    'giám đốc', 'tổng giám đốc', 'chủ tịch',
    'giải thể', 'phá sản', 'tổ chức lại', 'sáp nhập', 'chia', 'tách',
    'hợp đồng', 'giao dịch', 'quyền', 'nghĩa vụ',
  ];

  for (const kw of keywordPatterns) {
    if (content.includes(kw)) {
      keywords.push(kw);
    }
  }

  // Add title words
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
  // Take first sentence of content
  const firstSentence = article.content.split(/[.!?]/)[0];
  if (firstSentence.length < 200) {
    return firstSentence + '.';
  }
  return firstSentence.substring(0, 197) + '...';
}

async function main() {
  console.log('🚀 Starting Word document import...\n');

  // Import Luật Doanh nghiệp
  await importDocument(
    '/Users/thingkingman/Desktop/vietlaw-platform/legal documents/luatdoanhnghiep.doc',
    {
      documentNumber: '67/VBHN-VPQH',
      title: 'Luật Doanh nghiệp (Văn bản hợp nhất 2025)',
      titleSlug: 'luat-doanh-nghiep-vbhn-2025',
      issuingBody: 'Văn phòng Quốc hội',
      issuedDate: new Date('2025-08-15'),
      effectiveDate: new Date('2025-07-01'),
    }
  );

  console.log('\n✅ Import completed!');

  // Show total counts
  const totalDocs = await prisma.document.count();
  const totalArticles = await prisma.article.count();
  console.log(`\n📊 Database totals:`);
  console.log(`   Documents: ${totalDocs}`);
  console.log(`   Articles: ${totalArticles}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
