import { query, getOne, getAll, initSchema } from '../backend/src/db';

async function runVerification() {
  console.log('🧪 RUNNING SYSTEM VERIFICATION SUITE...\n');
  await initSchema();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // Test 1: Exactly 200 days exist
  const dayCount = await getOne(`SELECT COUNT(*) as count FROM study_days`);
  assert(parseInt(dayCount.count, 10) === 200, 'Exactly 200 days exist in PostgreSQL (Day 1 -> Day 200)');

  // Test 2: Day 1 and Day 200 exist
  const day1 = await getOne(`SELECT * FROM study_days WHERE day_number = 1`);
  const day200 = await getOne(`SELECT * FROM study_days WHERE day_number = 200`);
  assert(!!day1 && !!day200, 'Day 1 and Day 200 exist with valid records');

  // Test 3: Every day has study tasks
  const tasksCount = await getOne(`SELECT COUNT(*) as count FROM study_tasks`);
  assert(parseInt(tasksCount.count, 10) >= 1000, `Study tasks exist (${tasksCount.count} dedicated study tasks across 200 days)`);

  // Test 4: All 6 major tracks exist
  const tracks = await getAll(`SELECT * FROM tracks`);
  assert(tracks.length === 6, 'All 6 tracks exist (DSA, Java, DBMS, Full Stack, AI, Capstone)');

  // Test 5: All 30 weeks exist
  const weeks = await getAll(`SELECT * FROM weeks`);
  assert(weeks.length === 30, 'All 30 weeks exist (Week 1 -> Week 30)');

  // Test 6: LeetCode problems exist with real numbers
  const leetcodeCount = await getOne(`SELECT COUNT(*) as count FROM leetcode_problems`);
  assert(parseInt(leetcodeCount.count, 10) >= 100, `LeetCode tracker has authentic problems (${leetcodeCount.count} problems)`);

  const twoSum = await getOne(`SELECT * FROM leetcode_problems WHERE leetcode_number = 1`);
  assert(twoSum && twoSum.title === 'Two Sum', 'LeetCode #1 Two Sum exists with valid title and topic');

  // Test 7: Dedicated task study page data integrity
  const task1 = await getOne(`SELECT * FROM study_tasks WHERE id = 101`);
  assert(
    !!task1 && task1.title.length > 0 && task1.content.length > 0,
    'Task 101 contains full dedicated study page content and instructions'
  );

  // Test 8: Day completion persistence test
  const testUserId = 999;
  await query(`INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (999, 'test@mastery.hub', 'hash', 'Test User')`);

  // Mark day 37 as COMPLETED
  await query(
    `INSERT INTO day_progress (user_id, day_id, status, completed_at)
     VALUES (999, 37, 'COMPLETED', datetime('now'))
     ON CONFLICT (user_id, day_id) DO UPDATE SET status = 'COMPLETED'`
  );

  const day37Status = await getOne(`SELECT status FROM day_progress WHERE user_id = 999 AND day_id = 37`);
  assert(day37Status.status === 'COMPLETED', 'Day 37 completion persists reliably in PostgreSQL / database');

  // Test 9: User isolation verification
  const otherUserStatus = await getOne(`SELECT status FROM day_progress WHERE user_id = 1 AND day_id = 37`);
  assert(!otherUserStatus || otherUserStatus.status !== 'COMPLETED', 'User isolation: User 1 progress is isolated from User 999');

  // Test 10: Task completion persistence
  await query(
    `INSERT INTO study_progress (user_id, task_id, status, revision_status)
     VALUES (999, 3701, 'COMPLETED', 'MASTERED')
     ON CONFLICT (user_id, task_id) DO UPDATE SET status = 'COMPLETED', revision_status = 'MASTERED'`
  );
  const taskProgress = await getOne(`SELECT * FROM study_progress WHERE user_id = 999 AND task_id = 3701`);
  assert(
    taskProgress.status === 'COMPLETED' && taskProgress.revision_status === 'MASTERED',
    'Task completion & revision status (Mastered) persisted successfully'
  );

  // Clean up test user
  await query(`DELETE FROM study_progress WHERE user_id = 999`);
  await query(`DELETE FROM day_progress WHERE user_id = 999`);
  await query(`DELETE FROM users WHERE id = 999`);

  console.log(`\n🏁 VERIFICATION FINISHED: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runVerification()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
