// Dedicated Database Fetching & Query Integrity Test Suite
import { query, getOne, getAll } from './src/db';

async function runDatabaseFetchingTests() {
  console.log('======================================================================');
  console.log('🗄️  DATABASE DATA FETCHING & QUERY INTEGRITY TEST SUITE');
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
    // SECTION 1: DATABASE CONNECTION & SCHEMA VALIDATION
    // -----------------------------------------------------------------------
    console.log('--- 1. DATABASE CONNECTIVITY & TABLE PRESENCE ---');

    const rawTables = await getAll<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    const tableNames = rawTables.map((t) => t.name);

    assert(tableNames.length >= 10, `Database has all core system tables (Found: ${tableNames.length})`);
    
    const requiredTables = [
      'users',
      'tracks',
      'weeks',
      'study_days',
      'study_tasks',
      'leetcode_problems',
      'projects',
      'study_notes',
      'day_progress',
      'study_progress',
      'week_progress',
      'leetcode_progress',
    ];

    for (const table of requiredTables) {
      assert(tableNames.includes(table), `Table '${table}' exists in database schema`);
    }

    // -----------------------------------------------------------------------
    // SECTION 2: ROW COUNTS & ENTITY COMPLETENESS
    // -----------------------------------------------------------------------
    console.log('\n--- 2. CORE ENTITY ROW COUNTS & POPULATION ---');

    const trackCount = (await getOne<{ count: number }>('SELECT COUNT(*) as count FROM tracks'))?.count || 0;
    assert(trackCount === 6, `Tracks table has exactly 6 curriculum domains (Found: ${trackCount})`);

    const weekCount = (await getOne<{ count: number }>('SELECT COUNT(*) as count FROM weeks'))?.count || 0;
    assert(weekCount === 30, `Weeks table has exactly 30 weeks (Found: ${weekCount})`);

    const dayCount = (await getOne<{ count: number }>('SELECT COUNT(*) as count FROM study_days'))?.count || 0;
    assert(dayCount === 200, `Study Days table has exactly 200 days (Found: ${dayCount})`);

    const taskCount = (await getOne<{ count: number }>('SELECT COUNT(*) as count FROM study_tasks'))?.count || 0;
    assert(taskCount === 1000, `Study Tasks table has exactly 1000 subtopic tasks [5 per day] (Found: ${taskCount})`);

    const leetcodeCount = (await getOne<{ count: number }>('SELECT COUNT(*) as count FROM leetcode_problems'))?.count || 0;
    assert(leetcodeCount > 0, `LeetCode problems populated in database (Found: ${leetcodeCount})`);

    const projectCount = (await getOne<{ count: number }>('SELECT COUNT(*) as count FROM projects'))?.count || 0;
    assert(projectCount > 0, `Projects table populated in database (Found: ${projectCount})`);

    // -----------------------------------------------------------------------
    // SECTION 3: DEEP DATA FETCHING & RECORD STRUCTURE
    // -----------------------------------------------------------------------
    console.log('\n--- 3. DATA INTEGRITY & FIELD STRUCTURE ---');

    // 3.1 Fetch Track detail
    const javaTrack = await getOne<any>('SELECT * FROM tracks WHERE id = $1', ['java']);
    assert(javaTrack && javaTrack.name.includes('Java'), `Fetch track by ID ('java'): "${javaTrack?.name}"`);

    // 3.2 Fetch Day with boundary ranges
    const minMaxDays = await getOne<{ min_day: number; max_day: number }>(
      'SELECT MIN(day_number) as min_day, MAX(day_number) as max_day FROM study_days'
    );
    assert(minMaxDays?.min_day === 1 && minMaxDays?.max_day === 200, `Day numbers strictly span 1 to 200`);

    // 3.3 Fetch Day 50 content
    const day50 = await getOne<any>('SELECT * FROM study_days WHERE day_number = $1', [50]);
    assert(day50 && day50.title && day50.topic, `Fetch Day 50 record: "${day50?.title}" [Topic: ${day50?.topic}]`);

    // 3.4 Fetch 5 Tasks for Day 50
    const day50Tasks = await getAll<any>('SELECT * FROM study_tasks WHERE day_id = $1 ORDER BY task_number ASC', [day50.id]);
    assert(day50Tasks.length === 5, `Day 50 has exactly 5 child tasks (Found: ${day50Tasks.length})`);
    assert(!!day50Tasks[0].code_examples, `Day 50 Task 1 includes code examples`);
    assert(!!day50Tasks[0].interview_questions, `Day 50 Task 1 includes interview questions`);

    // -----------------------------------------------------------------------
    // SECTION 4: COMPLEX RELATIONAL JOINS & AGGREGATIONS
    // -----------------------------------------------------------------------
    console.log('\n--- 4. RELATIONAL JOINS & AGGREGATIONS ---');

    // 4.1 Join study_days -> weeks -> tracks
    const dayWithHierarchy = await getOne<any>(`
      SELECT 
        d.day_number, 
        d.title AS day_title, 
        w.week_number, 
        w.title AS week_title, 
        t.name AS track_name
      FROM study_days d
      JOIN weeks w ON d.week_id = w.id
      JOIN tracks t ON d.track_id = t.id
      WHERE d.day_number = $1
    `, [100]);

    assert(
      dayWithHierarchy && dayWithHierarchy.week_number && dayWithHierarchy.track_name,
      `3-Table Join (Day 100 -> Week ${dayWithHierarchy?.week_number} -> ${dayWithHierarchy?.track_name}) succeeded`
    );

    // 4.2 Group days by track and count
    const daysPerTrack = await getAll<{ track_id: string; total_days: number }>(`
      SELECT track_id, COUNT(*) as total_days 
      FROM study_days 
      GROUP BY track_id 
      ORDER BY total_days DESC
    `);
    assert(daysPerTrack.length === 6, `Aggregate GROUP BY across all 6 tracks returned count breakdown`);

    // 4.3 Join User Progress with Study Tasks
    const userProgressJoin = await getAll<any>(`
      SELECT 
        u.name,
        d.day_number,
        COUNT(tp.id) as completed_tasks
      FROM users u
      LEFT JOIN study_progress tp ON u.id = tp.user_id AND tp.status = 'COMPLETED'
      LEFT JOIN study_tasks st ON tp.task_id = st.id
      LEFT JOIN study_days d ON st.day_id = d.id
      WHERE u.id = 1
      GROUP BY u.name, d.day_number
    `);
    assert(Array.isArray(userProgressJoin), `Multi-table User Progress join query executed successfully`);

    // -----------------------------------------------------------------------
    // SECTION 5: QUERY PERFORMANCE & BENCHMARKING
    // -----------------------------------------------------------------------
    console.log('\n--- 5. FETCH QUERY PERFORMANCE & LATENCY ---');

    const benchStart = performance.now();
    const all200Days = await getAll<any>(`
      SELECT d.*, w.week_number, t.name as track_name
      FROM study_days d
      JOIN weeks w ON d.week_id = w.id
      JOIN tracks t ON d.track_id = t.id
      ORDER BY d.day_number ASC
    `);
    const benchEnd = performance.now();
    const durationMs = (benchEnd - benchStart).toFixed(2);

    assert(all200Days.length === 200, `Fetched full 200-day joined curriculum (Retrieved: ${all200Days.length} rows)`);
    assert(parseFloat(durationMs) < 100, `Query execution is blazing fast (< 100ms): ${durationMs}ms`);

    // -----------------------------------------------------------------------
    // SECTION 6: PARAMETERIZED BOUNDARY & ERROR HANDLING
    // -----------------------------------------------------------------------
    console.log('\n--- 6. PARAMETERIZED BOUNDARY & EDGE CASES ---');

    // 6.1 Non-existent day
    const nonExistentDay = await getOne<any>('SELECT * FROM study_days WHERE day_number = $1', [999]);
    assert(nonExistentDay === null || nonExistentDay === undefined, `Query for non-existent Day 999 safely returns null`);

    // 6.2 Filter tasks by non-existent day_id
    const emptyTasks = await getAll<any>('SELECT * FROM study_tasks WHERE day_id = $1', ['non_existent_uuid']);
    assert(Array.isArray(emptyTasks) && emptyTasks.length === 0, `Query for non-existent day_id safely returns empty array []`);

    // 6.3 Repeated parameters ($1 used multiple times)
    const repeatedParamsResult = await getAll<any>(
      'SELECT id, day_number FROM study_days WHERE day_number >= $1 AND day_number <= $2',
      [10, 15]
    );
    assert(repeatedParamsResult.length === 6, `Parameterized range query [$1, $2] returned exact 6 days (Days 10–15)`);

  } catch (err) {
    console.error('Fatal Database Error during test execution:', err);
    failed++;
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n======================================================================');
  console.log(`📊 DATABASE FETCH TEST SUMMARY: ${passed} PASSED | ${failed} FAILED in ${totalTime}s`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDatabaseFetchingTests();
