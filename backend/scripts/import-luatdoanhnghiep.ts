import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ArticleMetadata {
  article_id: string;
  keywords: string[];
  summary: string;
  topics: string[];
}

// Map topics to chapter info
const topicToChapter: Record<string, { chapterNumber: string; chapterTitle: string }> = {
  'doanh-nghiep': { chapterNumber: 'Chương I', chapterTitle: 'Những quy định chung' },
  'chu-so-huu': { chapterNumber: 'Chương I', chapterTitle: 'Những quy định chung' },
  'quyen-va-nghia-vu': { chapterNumber: 'Chương I', chapterTitle: 'Những quy định chung' },
  'dang-ky-doanh-nghiep': { chapterNumber: 'Chương II', chapterTitle: 'Đăng ký doanh nghiệp' },
  'cong-ty-tnhh': { chapterNumber: 'Chương III', chapterTitle: 'Công ty trách nhiệm hữu hạn' },
  'cong-ty-co-phan': { chapterNumber: 'Chương V', chapterTitle: 'Công ty cổ phần' },
  'quan-tri-cong-ty': { chapterNumber: 'Chương V', chapterTitle: 'Quản trị công ty' },
  'von-dieu-le': { chapterNumber: 'Chương III', chapterTitle: 'Vốn và tài sản' },
  'nguoi-dai-dien-phap-luat': { chapterNumber: 'Chương I', chapterTitle: 'Những quy định chung' },
  'giai-the-pha-san': { chapterNumber: 'Chương IX', chapterTitle: 'Giải thể và phá sản doanh nghiệp' },
  'pha-san': { chapterNumber: 'Chương IX', chapterTitle: 'Giải thể và phá sản doanh nghiệp' },
  'nganh-nghe-kinh-doanh': { chapterNumber: 'Chương II', chapterTitle: 'Đăng ký doanh nghiệp' },
  'to-chuc-hoat-dong': { chapterNumber: 'Chương II', chapterTitle: 'Tổ chức hoạt động' },
  'trach-nhiem-phap-ly': { chapterNumber: 'Chương V', chapterTitle: 'Quản trị công ty' },
};

// Extract article number from article_id
function extractArticleNumber(articleId: string): string {
  // art_ld_vbhn_2025_dieu_46 -> Điều 46
  const match = articleId.match(/dieu_(\d+)/);
  if (match) {
    return `Điều ${match[1]}`;
  }
  return articleId;
}

// Extract numeric order from article_id
function extractOrderIndex(articleId: string): number {
  const match = articleId.match(/dieu_(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  return 0;
}

async function main() {
  console.log('🚀 Starting import of Luật Doanh nghiệp metadata...\n');

  // Read metadata file
  const metadataPath = path.join(__dirname, '../../luatdoanhnghiep_metadata.txt');
  const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
  const articlesMetadata: ArticleMetadata[] = JSON.parse(metadataContent);

  console.log(`📄 Found ${articlesMetadata.length} articles in metadata file\n`);

  // Create or update the Document for Luật Doanh nghiệp VBHN 2025
  let document = await prisma.document.findUnique({
    where: { documentNumber: 'VBHN/2025/QH15-LDN' },
  });

  if (!document) {
    document = await prisma.document.create({
      data: {
        documentNumber: 'VBHN/2025/QH15-LDN',
        title: 'Luật Doanh nghiệp (Văn bản hợp nhất)',
        titleSlug: 'luat-doanh-nghiep-vbhn-2025',
        documentType: 'LAW',
        issuingBody: 'Quốc hội',
        issuedDate: new Date('2025-01-01'),
        effectiveDate: new Date('2025-01-01'),
        status: 'EFFECTIVE',
        keywords: [
          'doanh nghiệp',
          'công ty',
          'cổ phần',
          'TNHH',
          'đăng ký kinh doanh',
          'góp vốn',
          'giải thể',
          'phá sản',
          'văn bản hợp nhất',
        ],
        summary:
          'Văn bản hợp nhất Luật Doanh nghiệp quy định về việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động có liên quan của doanh nghiệp.',
        preamble:
          'Căn cứ Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam;\nQuốc hội ban hành Luật Doanh nghiệp.',
      },
    });
    console.log('✓ Created new document: Luật Doanh nghiệp VBHN 2025');
  } else {
    console.log('✓ Found existing document: Luật Doanh nghiệp VBHN 2025');
  }

  // Process each article
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const meta of articlesMetadata) {
    const articleNumber = extractArticleNumber(meta.article_id);
    const orderIndex = extractOrderIndex(meta.article_id);
    const articleIdSlug = `luat-doanh-nghiep-vbhn-2025:${articleNumber.toLowerCase().replace(' ', '-')}`;

    // Get chapter info from first topic
    const primaryTopic = meta.topics[0] || 'doanh-nghiep';
    const chapterInfo = topicToChapter[primaryTopic] || {
      chapterNumber: 'Chương I',
      chapterTitle: 'Những quy định chung',
    };

    // Check if article already exists
    const existingArticle = await prisma.article.findUnique({
      where: { articleId: articleIdSlug },
    });

    const articleData = {
      documentId: document.id,
      articleNumber: articleNumber,
      title: meta.summary.split('.')[0], // Use first sentence as title
      chapterNumber: chapterInfo.chapterNumber,
      chapterTitle: chapterInfo.chapterTitle,
      content: meta.summary, // Use summary as content placeholder
      contentHtml: `<div class="article-content"><p>${meta.summary}</p></div>`,
      orderIndex: orderIndex,
      keywords: meta.keywords,
      summary: meta.summary,
      hasPracticalReferences: false,
    };

    if (existingArticle) {
      await prisma.article.update({
        where: { articleId: articleIdSlug },
        data: articleData,
      });
      updated++;
      console.log(`  ↻ Updated: ${articleNumber}`);
    } else {
      await prisma.article.create({
        data: {
          ...articleData,
          articleId: articleIdSlug,
        },
      });
      created++;
      console.log(`  + Created: ${articleNumber}`);
    }
  }

  console.log('\n✅ Import completed!');
  console.log(`   Created: ${created} articles`);
  console.log(`   Updated: ${updated} articles`);
  console.log(`   Skipped: ${skipped} articles`);

  // Show total count
  const totalArticles = await prisma.article.count({
    where: { documentId: document.id },
  });
  console.log(`\n📊 Total articles in Luật Doanh nghiệp VBHN 2025: ${totalArticles}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
