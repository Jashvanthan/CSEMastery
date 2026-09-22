// Fresh Database Reset & Clean Seed Script
import { query, initSchema } from './src/db';
import { runSeed } from './src/db/seed';

async function resetCleanDatabase() {
  console.log('====================================================');
  console.log('🧹 CLEARING TESTED DATA & INITIALIZING CLEAN DATABASE');
  console.log('====================================================\n');

  try {
    // 1. Clear all progress and dynamic user activity
    console.log('[1/4] Clearing progress and note records...');
    await query('DELETE FROM study_progress');
    await query('DELETE FROM day_progress');
    await query('DELETE FROM week_progress');
    await query('DELETE FROM topic_progress');
    await query('DELETE FROM leetcode_progress');
    await query('DELETE FROM study_notes');

    // 2. Clear all test users (leaving clean slate for seed)
    console.log('[2/4] Removing test user accounts...');
    await query('DELETE FROM users');

    // 3. Re-run fresh seed
    console.log('[3/4] Re-seeding clean curriculum and default scholars...');
    await runSeed();

    console.log('[4/4] Verifying clean database state...');
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const dayCount = await query('SELECT COUNT(*) as count FROM study_days');
    const taskCount = await query('SELECT COUNT(*) as count FROM study_tasks');
    
    console.log(`   - Users count: ${userCount.rows[0].count}`);
    console.log(`   - Curriculum Days: ${dayCount.rows[0].count}`);
    console.log(`   - Curriculum Tasks: ${taskCount.rows[0].count}`);

    console.log('\n✨ Database is now 100% clean and freshly initialized!');
  } catch (err) {
    console.error('❌ Error resetting database:', err);
    process.exit(1);
  }
}

resetCleanDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
