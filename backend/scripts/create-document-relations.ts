/**
 * Create Document Relations
 *
 * Links related documents together:
 * - Decrees/Circulars that IMPLEMENT laws
 * - Laws that AMEND other laws
 * - Laws that are RELATED to each other
 *
 * Run with: npx tsx scripts/create-document-relations.ts
 */

import { PrismaClient, RelationType } from '@prisma/client';

const prisma = new PrismaClient();

interface RelationConfig {
  fromSlug: string;
  toSlug: string;
  relationType: RelationType;
  description: string;
}

// ============================================================================
// DOCUMENT RELATIONSHIPS
// ============================================================================

const RELATIONS: RelationConfig[] = [
  // Decrees implementing Investment Law
  {
    fromSlug: 'nghi-dinh-31-2021-huong-dan-luat-dau-tu',
    toSlug: 'luat-dau-tu-2020',
    relationType: 'IMPLEMENTS',
    description: 'Nghị định hướng dẫn thi hành Luật Đầu tư 2020',
  },

  // Decrees implementing Enterprise Law
  {
    fromSlug: 'nghi-dinh-47-2021-huong-dan-luat-doanh-nghiep',
    toSlug: 'luat-doanh-nghiep-2020',
    relationType: 'IMPLEMENTS',
    description: 'Nghị định hướng dẫn thi hành Luật Doanh nghiệp 2020',
  },
  {
    fromSlug: 'nghi-dinh-47-2021-huong-dan-luat-doanh-nghiep',
    toSlug: 'luat-doanh-nghiep-vbhn-2025',
    relationType: 'IMPLEMENTS',
    description: 'Nghị định hướng dẫn thi hành Luật Doanh nghiệp (VBHN 2025)',
  },

  // Decrees/Circulars implementing Land Law
  {
    fromSlug: 'nghi-dinh-102-2024-huong-dan-luat-dat-dai',
    toSlug: 'luat-dat-dai-2024',
    relationType: 'IMPLEMENTS',
    description: 'Nghị định hướng dẫn thi hành Luật Đất đai 2024',
  },
  {
    fromSlug: 'thong-tu-08-2024-tt-btnmt',
    toSlug: 'luat-dat-dai-2024',
    relationType: 'IMPLEMENTS',
    description: 'Thông tư hướng dẫn về hồ sơ địa chính theo Luật Đất đai 2024',
  },

  // Amendment relationships
  {
    fromSlug: 'luat-sua-doi-dau-tu-2025',
    toSlug: 'luat-dau-tu-2020',
    relationType: 'AMENDS',
    description: 'Sửa đổi, bổ sung một số điều của Luật Đầu tư 2020',
  },

  // Consolidated version relationship
  {
    fromSlug: 'luat-doanh-nghiep-vbhn-2025',
    toSlug: 'luat-doanh-nghiep-2020',
    relationType: 'SUPPLEMENTS',
    description: 'Văn bản hợp nhất Luật Doanh nghiệp (bao gồm các sửa đổi, bổ sung)',
  },

  // Related business laws
  {
    fromSlug: 'luat-dau-tu-2020',
    toSlug: 'luat-doanh-nghiep-2020',
    relationType: 'RELATED',
    description: 'Cùng điều chỉnh hoạt động kinh doanh của doanh nghiệp',
  },
  {
    fromSlug: 'luat-dau-tu-2020',
    toSlug: 'luat-doanh-nghiep-vbhn-2025',
    relationType: 'RELATED',
    description: 'Cùng điều chỉnh hoạt động kinh doanh của doanh nghiệp',
  },
  {
    fromSlug: 'luat-thuong-mai-2005',
    toSlug: 'luat-doanh-nghiep-2020',
    relationType: 'RELATED',
    description: 'Cùng điều chỉnh hoạt động thương mại của doanh nghiệp',
  },
  {
    fromSlug: 'luat-thuong-mai-2005',
    toSlug: 'luat-doanh-nghiep-vbhn-2025',
    relationType: 'RELATED',
    description: 'Cùng điều chỉnh hoạt động thương mại của doanh nghiệp',
  },
  {
    fromSlug: 'luat-so-huu-tri-tue-2005',
    toSlug: 'luat-doanh-nghiep-2020',
    relationType: 'RELATED',
    description: 'Bảo vệ quyền sở hữu trí tuệ trong hoạt động kinh doanh',
  },
  {
    fromSlug: 'bo-luat-lao-dong-2019',
    toSlug: 'luat-doanh-nghiep-2020',
    relationType: 'RELATED',
    description: 'Điều chỉnh quan hệ lao động trong doanh nghiệp',
  },
  {
    fromSlug: 'bo-luat-lao-dong-2019',
    toSlug: 'luat-doanh-nghiep-vbhn-2025',
    relationType: 'RELATED',
    description: 'Điều chỉnh quan hệ lao động trong doanh nghiệp',
  },
];

async function createRelations() {
  console.log('🔗 Creating document relations...\n');

  // Get all documents by slug
  const documents = await prisma.document.findMany({
    select: { id: true, titleSlug: true, title: true },
  });

  const docBySlug = new Map(documents.map(d => [d.titleSlug, d]));

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const rel of RELATIONS) {
    const fromDoc = docBySlug.get(rel.fromSlug);
    const toDoc = docBySlug.get(rel.toSlug);

    if (!fromDoc) {
      console.log(`   ⚠ Document not found: ${rel.fromSlug}`);
      errors++;
      continue;
    }
    if (!toDoc) {
      console.log(`   ⚠ Document not found: ${rel.toSlug}`);
      errors++;
      continue;
    }

    // Check if relation already exists
    const existing = await prisma.documentRelation.findFirst({
      where: {
        fromDocumentId: fromDoc.id,
        toDocumentId: toDoc.id,
        relationType: rel.relationType,
      },
    });

    if (existing) {
      console.log(`   ⏭ Already exists: ${fromDoc.title} → ${toDoc.title}`);
      skipped++;
      continue;
    }

    // Create the relation
    await prisma.documentRelation.create({
      data: {
        fromDocumentId: fromDoc.id,
        toDocumentId: toDoc.id,
        relationType: rel.relationType,
        description: rel.description,
      },
    });

    const relationLabel = {
      IMPLEMENTS: '→ hướng dẫn →',
      AMENDS: '→ sửa đổi →',
      SUPPLEMENTS: '→ bổ sung →',
      REPLACES: '→ thay thế →',
      REFERENCES: '→ dẫn chiếu →',
      RELATED: '↔ liên quan ↔',
    }[rel.relationType];

    console.log(`   ✓ ${fromDoc.title} ${relationLabel} ${toDoc.title}`);
    created++;
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ RELATIONS CREATED!');
  console.log('='.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped (already exist): ${skipped}`);
  console.log(`   Errors: ${errors}`);

  // Show all relations
  const allRelations = await prisma.documentRelation.findMany({
    include: {
      fromDocument: { select: { title: true } },
      toDocument: { select: { title: true } },
    },
  });

  console.log(`\n📋 Total relations in database: ${allRelations.length}`);
}

createRelations()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
