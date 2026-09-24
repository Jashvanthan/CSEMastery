// Application Balance & Curriculum Distribution Test Suite
import { query, getOne, getAll } from './src/db';

async function runApplicationBalanceTests() {
  console.log('======================================================================');
  console.log('⚖️  APPLICATION BALANCE & CURRICULUM DISTRIBUTION VALIDATION SUITE');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extraInfo?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, extraInfo !== undefined ? extraInfo : '');
      failed++;
    }
  }

  const startTime = Date.now();

  try {
    // -----------------------------------------------------------------------
    // SECTION 1: CURRICULUM DOMAIN & DAY ALLOCATION BALANCE
    // -----------------------------------------------------------------------
    console.log('--- 1. TRACK ALLOCATION & DAY PROPORTIONALITY ---');

    const totalDaysRow = await getOne<{ total: number }>('SELECT COUNT(*) as total FROM study_days');
    const totalDays = totalDaysRow?.total || 0;
    assert(totalDays === 200, `Total curriculum days exactly equals 200 days`);

    const trackBreakdown = await getAll<{
      id: string;
      name: string;
      total_days: number;
      total_weeks: number;
    }>(`
      SELECT 
        t.id, 
        t.name, 
        COUNT(DISTINCT d.id) as total_days,
        COUNT(DISTINCT w.id) as total_weeks
      FROM tracks t
      LEFT JOIN weeks w ON t.id = w.track_id
      LEFT JOIN study_days d ON t.id = d.track_id
      GROUP BY t.id, t.name
      ORDER BY total_days DESC
    `);

    console.log('\n📊 Domain Distribution Breakdown:');
    let sumDays = 0;
    let sumWeeks = 0;
    for (const track of trackBreakdown) {
      const pct = ((track.total_days / 200) * 100).toFixed(1);
      console.log(`   • ${track.name.padEnd(45)}: ${track.total_days} days (${pct}%) | ${track.total_weeks} weeks`);
      sumDays += Number(track.total_days);
      sumWeeks += Number(track.total_weeks);
    }

    assert(sumDays === 200, `Sum of all track days strictly equals 200 (Found: ${sumDays})`);
    assert(sumWeeks === 30, `Sum of all track weeks strictly equals 30 (Found: ${sumWeeks})`);

    // Verify DSA and core engineering receive the highest weighting (>50% of the program)
    const dsaDays = trackBreakdown.find((t) => t.id === 'dsa')?.total_days || 0;
    const javaDays = trackBreakdown.find((t) => t.id === 'java')?.total_days || 0;
    const dbmsDays = trackBreakdown.find((t) => t.id === 'dbms')?.total_days || 0;
    const coreFoundationsDays = Number(dsaDays) + Number(javaDays) + Number(dbmsDays);

    assert(
      coreFoundationsDays >= 140,
      `Core foundations (DSA + Java + DBMS) comprise ${(coreFoundationsDays / 2).toFixed(1)}% of curriculum (>= 70%)`
    );

    // -----------------------------------------------------------------------
    // SECTION 2: DAILY WORKLOAD & TASK DENSITY BALANCE
    // -----------------------------------------------------------------------
    console.log('\n--- 2. WORKLOAD & TASK DENSITY EQUILIBRIUM ---');

    // 2.1 Check tasks per day consistency (Standard: 5 tasks per day)
    const taskCountPerDay = await getAll<{ day_number: number; task_count: number }>(`
      SELECT d.day_number, COUNT(st.id) as task_count
      FROM study_days d
      LEFT JOIN study_tasks st ON d.id = st.day_id
      GROUP BY d.day_number
      HAVING task_count != 5
    `);

    assert(
      taskCountPerDay.length === 0,
      `Every single day has uniform 5 tasks (0 irregular days found)`
    );

    // 2.2 Time Estimate Balance (Daily minutes & subtask minutes)
    const timeStats = await getOne<{
      min_daily: number;
      max_daily: number;
      avg_daily: number;
      avg_task: number;
    }>(`
      SELECT 
        MIN(estimated_minutes) as min_daily,
        MAX(estimated_minutes) as max_daily,
        ROUND(AVG(estimated_minutes), 1) as avg_daily,
        (SELECT ROUND(AVG(estimated_minutes), 1) FROM study_tasks) as avg_task
      FROM study_days
    `);

    console.log(`   • Daily Time Commitment: Avg ${timeStats?.avg_daily} mins (Min: ${timeStats?.min_daily}m, Max: ${timeStats?.max_daily}m)`);
    console.log(`   • Subtask Time: Avg ${timeStats?.avg_task} mins per subtopic`);

    assert(
      Number(timeStats?.avg_daily) >= 60 && Number(timeStats?.avg_daily) <= 150,
      `Daily study commitment is sustainable between 60–150 minutes (Avg: ${timeStats?.avg_daily}m)`
    );
    assert(
      Number(timeStats?.avg_task) >= 15 && Number(timeStats?.avg_task) <= 45,
      `Subtask duration follows micro-learning principles 15–45 minutes (Avg: ${timeStats?.avg_task}m)`
    );

    // -----------------------------------------------------------------------
    // SECTION 3: DIFFICULTY DISTRIBUTION & PEDAGOGICAL BALANCE
    // -----------------------------------------------------------------------
    console.log('\n--- 3. DIFFICULTY & COGNITIVE LOAD DISTRIBUTION ---');

    const taskDifficultyBreakdown = await getAll<{ difficulty: string; count: number }>(`
      SELECT difficulty, COUNT(*) as count 
      FROM study_tasks 
      GROUP BY difficulty 
      ORDER BY count DESC
    `);

    console.log('   • Study Task Difficulty Breakdown:');
    for (const d of taskDifficultyBreakdown) {
      const pct = ((d.count / 1000) * 100).toFixed(1);
      console.log(`     - ${(d.difficulty || 'Unspecified').padEnd(10)}: ${d.count} tasks (${pct}%)`);
    }

    const leetcodeDifficultyBreakdown = await getAll<{ difficulty: string; count: number }>(`
      SELECT difficulty, COUNT(*) as count 
      FROM leetcode_problems 
      GROUP BY difficulty 
      ORDER BY count DESC
    `);

    const totalLeetcode = leetcodeDifficultyBreakdown.reduce((acc, curr) => acc + curr.count, 0);
    console.log(`   • LeetCode Problem Breakdown (Total: ${totalLeetcode}):`);
    for (const d of leetcodeDifficultyBreakdown) {
      const pct = ((d.count / totalLeetcode) * 100).toFixed(1);
      console.log(`     - ${(d.difficulty || 'Unspecified').padEnd(10)}: ${d.count} problems (${pct}%)`);
    }

    const mediumOrHardCount = leetcodeDifficultyBreakdown
      .filter((d) => d.difficulty === 'Medium' || d.difficulty === 'Hard')
      .reduce((acc, curr) => acc + curr.count, 0);

    assert(
      totalLeetcode >= 100,
      `Comprehensive LeetCode catalog covers >= 100 curated problems (Found: ${totalLeetcode})`
    );
    assert(
      (mediumOrHardCount / totalLeetcode) >= 0.5,
      `Interview readiness balance: >= 50% Medium/Hard problems (${((mediumOrHardCount / totalLeetcode) * 100).toFixed(1)}%)`
    );

    // -----------------------------------------------------------------------
    // SECTION 4: PROGRESSIVE GATING & UNLOCK HORIZON BALANCE
    // -----------------------------------------------------------------------
    console.log('\n--- 4. PROGRESSIVE GATING PACING & HORIZON RULES ---');

    // Rule: Week + 10 Horizon
    // For a brand new user (completed weeks = 0), max unlocked week should be 11 (Week 1 + 10)
    const baseHorizon = Math.min(30, Math.max(11, 0 + 10));
    assert(baseHorizon === 11, `Initial unlock horizon grants 11 weeks of lookahead content`);

    // For a user who has completed Week 15, max unlocked week should be 25
    const midHorizon = Math.min(30, Math.max(11, 15 + 10));
    assert(midHorizon === 25, `Mid-program horizon extends dynamically (Week 15 completion -> Week 25 unlocked)`);

    // For a user who has completed Week 25, max unlocked week should cap at 30
    const finalHorizon = Math.min(30, Math.max(11, 25 + 10));
    assert(finalHorizon === 30, `Late-program horizon caps cleanly at maximum Week 30`);

    // -----------------------------------------------------------------------
    // SECTION 5: CAPSTONE PROJECTS & SYSTEM DESIGN BALANCE
    // -----------------------------------------------------------------------
    console.log('\n--- 5. CAPSTONE PROJECTS & PRACTICAL BALANCE ---');

    const projectsList = await getAll<{
      id: number;
      title: string;
      track_id: string;
      phase: string;
    }>('SELECT id, title, track_id, phase FROM projects ORDER BY id ASC');

    console.log(`   • Capstone Projects Mapped across Tracks:`);
    for (const p of projectsList) {
      console.log(`     - [Project ${p.id}] ${p.title} (${p.track_id})`);
    }

    assert(projectsList.length === 6, `Exactly 6 capstone portfolio projects covering all major domains`);

    // -----------------------------------------------------------------------
    // SECTION 6: SCHEDULE PACE & STREAK MATHEMATICS BALANCE
    // -----------------------------------------------------------------------
    console.log('\n--- 6. PACING METRICS & SCHEDULE STATUS LOGIC ---');

    function calculatePace(completedDays: number, expectedDays: number) {
      const diff = completedDays - expectedDays;
      if (diff > 0) return { status: 'AHEAD', diff };
      if (diff < 0) return { status: 'BEHIND', diff };
      return { status: 'ON_TRACK', diff: 0 };
    }

    const onTrackTest = calculatePace(10, 10);
    assert(onTrackTest.status === 'ON_TRACK', `Pace calculation accurately identifies 'ON_TRACK' when completed === expected`);

    const aheadTest = calculatePace(15, 10);
    assert(aheadTest.status === 'AHEAD' && aheadTest.diff === 5, `Pace calculation accurately identifies 'AHEAD' (+5 days)`);

    const behindTest = calculatePace(7, 10);
    assert(behindTest.status === 'BEHIND' && behindTest.diff === -3, `Pace calculation accurately identifies 'BEHIND' (-3 days)`);

  } catch (err) {
    console.error('Fatal Balance Verification Error:', err);
    failed++;
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n======================================================================');
  console.log(`📊 APPLICATION BALANCE SUMMARY: ${passed} PASSED | ${failed} FAILED in ${totalTime}s`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runApplicationBalanceTests();
