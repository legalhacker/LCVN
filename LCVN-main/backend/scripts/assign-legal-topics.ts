/**
 * Auto-assign Legal Topics to Articles
 *
 * This script analyzes article titles and content to assign:
 * - legalTopics: Array of topic tags
 * - articleType: Type classification
 * - subjectMatter: Primary subject
 * - importance: 1-5 score
 *
 * Run with: npx tsx scripts/assign-legal-topics.ts
 */

import { prisma } from '../src/services/prisma.js';

// ============================================================================
// LEGAL TOPIC TAXONOMY FOR VIETNAMESE BUSINESS LAW
// ============================================================================

const TOPIC_PATTERNS: Record<string, RegExp[]> = {
  // Business Formation
  'thành lập doanh nghiệp': [
    /thành lập (công ty|doanh nghiệp)/i,
    /đăng ký (doanh nghiệp|kinh doanh)/i,
    /giấy chứng nhận đăng ký/i,
  ],
  'loại hình doanh nghiệp': [
    /công ty (tnhh|cổ phần|hợp danh)/i,
    /doanh nghiệp (tư nhân|nhà nước)/i,
    /loại hình (doanh nghiệp|công ty)/i,
  ],

  // Capital & Shares
  'vốn điều lệ': [
    /vốn điều lệ/i,
    /góp vốn/i,
    /phần vốn góp/i,
    /tăng vốn|giảm vốn/i,
  ],
  'cổ phần cổ phiếu': [
    /cổ phần/i,
    /cổ phiếu/i,
    /cổ đông/i,
    /mua lại cổ phần/i,
  ],

  // Corporate Governance
  'quản trị công ty': [
    /hội đồng (quản trị|thành viên)/i,
    /đại hội đồng cổ đông/i,
    /ban (kiểm soát|giám đốc)/i,
    /giám đốc|tổng giám đốc/i,
  ],
  'quyền cổ đông': [
    /quyền (của )?(cổ đông|thành viên)/i,
    /nghĩa vụ (của )?(cổ đông|thành viên)/i,
    /biểu quyết/i,
  ],

  // Restructuring
  'tổ chức lại doanh nghiệp': [
    /chia|tách|hợp nhất|sáp nhập/i,
    /chuyển đổi (loại hình|công ty)/i,
    /tổ chức lại/i,
  ],
  'giải thể phá sản': [
    /giải thể/i,
    /phá sản/i,
    /chấm dứt hoạt động/i,
    /thanh lý/i,
  ],

  // Employment
  'lao động nhân sự': [
    /người lao động/i,
    /hợp đồng lao động/i,
    /tiền lương|thù lao/i,
    /sa thải|chấm dứt.*lao động/i,
  ],

  // Contracts & Transactions
  'hợp đồng giao dịch': [
    /hợp đồng/i,
    /giao dịch/i,
    /ký kết/i,
    /thỏa thuận/i,
  ],

  // Legal Procedures
  'thủ tục hành chính': [
    /thủ tục/i,
    /hồ sơ/i,
    /đăng ký/i,
    /thông báo/i,
    /cơ quan.*đăng ký/i,
  ],

  // Violations & Penalties
  'vi phạm xử phạt': [
    /vi phạm/i,
    /xử phạt/i,
    /chế tài/i,
    /trách nhiệm.*pháp lý/i,
  ],
};

// Article type patterns
const ARTICLE_TYPE_PATTERNS: Record<string, RegExp[]> = {
  'DEFINITION': [
    /^Điều \d+\.\s*(Giải thích từ ngữ|Định nghĩa)/i,
    /trong (luật|bộ luật|nghị định) này.*được hiểu/i,
    /là.*theo quy định/i,
  ],
  'SCOPE': [
    /phạm vi (điều chỉnh|áp dụng)/i,
    /đối tượng áp dụng/i,
  ],
  'RIGHTS': [
    /quyền (của|được)/i,
    /được phép/i,
    /có quyền/i,
  ],
  'OBLIGATIONS': [
    /nghĩa vụ/i,
    /phải/i,
    /không được/i,
    /cấm/i,
  ],
  'PROCEDURE': [
    /thủ tục/i,
    /trình tự/i,
    /hồ sơ/i,
    /bước/i,
  ],
  'PENALTY': [
    /xử phạt/i,
    /xử lý vi phạm/i,
    /chế tài/i,
  ],
};

// Importance scoring rules
function calculateImportance(article: {
  title: string | null;
  articleNumber: string;
  content: string;
  hasPracticalReferences: boolean;
  articleType: string | null;
}): number {
  let score = 2; // Default score

  // Definition articles are high importance
  if (article.articleType === 'DEFINITION') {
    score = 5;
  }

  // Scope articles are important
  if (article.articleType === 'SCOPE') {
    score = 4;
  }

  // Articles with practical references
  if (article.hasPracticalReferences) {
    score = Math.min(5, score + 1);
  }

  // First few articles of each chapter tend to be more important
  const articleNum = parseInt(article.articleNumber.replace(/\D/g, ''), 10);
  if (articleNum <= 5) {
    score = Math.min(5, score + 1);
  }

  // Articles with titles are usually more important than untitled ones
  if (article.title && article.title.length > 5) {
    score = Math.min(5, score + 1);
  }

  // Very short articles (procedural references) are less important
  if (article.content.length < 200) {
    score = Math.max(1, score - 1);
  }

  return Math.max(1, Math.min(5, score));
}

// Extract subject matter from title
function extractSubjectMatter(title: string | null, content: string): string | null {
  if (title && title.length > 3) {
    // Clean up the title
    return title
      .replace(/^(Quy định về|Về|Các|Những)\s*/i, '')
      .trim();
  }

  // Try to extract from first sentence of content
  const firstSentence = content.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length < 100) {
    return firstSentence.trim();
  }

  return null;
}

async function assignTopicsToArticles() {
  console.log('Starting legal topic assignment...\n');

  const articles = await prisma.article.findMany({
    select: {
      id: true,
      articleNumber: true,
      title: true,
      content: true,
      chapterTitle: true,
      hasPracticalReferences: true,
    },
  });

  console.log(`Found ${articles.length} articles to process\n`);

  let updated = 0;

  for (const article of articles) {
    const textToAnalyze = `${article.title || ''} ${article.chapterTitle || ''} ${article.content}`.toLowerCase();

    // Find matching topics
    const matchedTopics: string[] = [];
    for (const [topic, patterns] of Object.entries(TOPIC_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(textToAnalyze)) {
          matchedTopics.push(topic);
          break;
        }
      }
    }

    // Determine article type
    let articleType: string | null = null;
    const titleAndContent = `${article.articleNumber}. ${article.title || ''} ${article.content}`;
    for (const [type, patterns] of Object.entries(ARTICLE_TYPE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(titleAndContent)) {
          articleType = type;
          break;
        }
      }
      if (articleType) break;
    }

    // Default to GENERAL if no specific type found
    if (!articleType) {
      articleType = 'GENERAL';
    }

    // Extract subject matter
    const subjectMatter = extractSubjectMatter(article.title, article.content);

    // Calculate importance
    const importance = calculateImportance({
      title: article.title,
      articleNumber: article.articleNumber,
      content: article.content,
      hasPracticalReferences: article.hasPracticalReferences,
      articleType,
    });

    // Update article
    await prisma.article.update({
      where: { id: article.id },
      data: {
        legalTopics: matchedTopics,
        articleType,
        subjectMatter,
        importance,
      },
    });

    updated++;
    if (updated % 50 === 0) {
      console.log(`Processed ${updated}/${articles.length} articles...`);
    }
  }

  console.log(`\nCompleted! Updated ${updated} articles.`);

  // Print summary
  const topicCounts = await prisma.article.groupBy({
    by: ['articleType'],
    _count: { articleType: true },
  });

  console.log('\n--- Article Type Distribution ---');
  for (const tc of topicCounts) {
    console.log(`${tc.articleType || 'null'}: ${tc._count.articleType}`);
  }

  const importanceCounts = await prisma.article.groupBy({
    by: ['importance'],
    _count: { importance: true },
    orderBy: { importance: 'desc' },
  });

  console.log('\n--- Importance Distribution ---');
  for (const ic of importanceCounts) {
    console.log(`Level ${ic.importance}: ${ic._count.importance} articles`);
  }
}

// Run
assignTopicsToArticles()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
