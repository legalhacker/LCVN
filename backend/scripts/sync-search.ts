import {
  initializeSearchIndexes,
  syncDocumentsToSearch,
  syncArticlesToSearch,
} from '../src/services/search.js';

async function main() {
  console.log('🔍 Syncing search indexes...\n');

  try {
    console.log('1. Initializing search indexes with Vietnamese synonyms...');
    await initializeSearchIndexes();
    console.log('   ✓ Search indexes initialized\n');

    console.log('2. Syncing documents to Meilisearch...');
    await syncDocumentsToSearch();
    console.log('   ✓ Documents synced\n');

    console.log('3. Syncing articles to Meilisearch...');
    await syncArticlesToSearch();
    console.log('   ✓ Articles synced\n');

    console.log('✅ Search sync completed successfully!');
    console.log('\n📊 You can now search for:');
    console.log('   - "thu hồi đất" (land acquisition)');
    console.log('   - "hợp đồng lao động" (labor contract)');
    console.log('   - "bồi thường" (compensation)');
    console.log('   - "công ty TNHH" (limited liability company)');
  } catch (error) {
    console.error('❌ Search sync failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
