// Comprehensive Multi-User & Curriculum Verification Test Suite
import { query, getOne, getAll } from './src/db';

const API_BASE = 'http://127.0.0.1:5000/api';

async function runTestSuite() {
  console.log('===============================================================');
  console.log('🧪 RUNNING FULL SYSTEM VALIDATION: DAYS, USERS & LEADERBOARD');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extraInfo?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, extraInfo || '');
      failed++;
    }
  }

  // =========================================================================
  // TEST SECTION 1: DAY & CURRICULUM FETCHING FROM DB
  // =========================================================================
  console.log('--- TEST 1: DAY & CURRICULUM FETCHING FROM DB ---');

  // 1.1 Fetch all 200 Days from DB via API
  const daysRes = await fetch(`${API_BASE}/days?limit=200`).then((r) => r.json());
  assert(daysRes.days && daysRes.days.length === 200, `API /days returns exact 200 days (Received: ${daysRes.days?.length})`);

  // 1.2 Verify Track Day counts
  const javaDays = daysRes.days.filter((d: any) => d.track_id === 'java');
  const dsaDays = daysRes.days.filter((d: any) => d.track_id === 'dsa');
  const dbmsDays = daysRes.days.filter((d: any) => d.track_id === 'dbms');
  const fullstackDays = daysRes.days.filter((d: any) => d.track_id === 'fullstack');
  const aiDays = daysRes.days.filter((d: any) => d.track_id === 'ai');
  const capstoneDays = daysRes.days.filter((d: any) => d.track_id === 'capstone');

  assert(javaDays.length === 42, `Java track has 42 days (Received: ${javaDays.length})`);
  assert(dsaDays.length === 56, `DSA track has 56 days (Received: ${dsaDays.length})`);
  assert(dbmsDays.length === 54, `DBMS track has 54 days (Received: ${dbmsDays.length})`);
  assert(fullstackDays.length === 30, `Full Stack track has 30 days (Received: ${fullstackDays.length})`);
  assert(aiDays.length === 12, `AI track has 12 days (Received: ${aiDays.length})`);
  assert(capstoneDays.length === 6, `Capstone track has 6 days (Received: ${capstoneDays.length})`);

  // 1.3 Verify Day 1 Details (Java Foundations)
  const day1Res = await fetch(`${API_BASE}/days/1`).then((r) => r.json());
  assert(day1Res.day && day1Res.day.day_number === 1, `Day 1 day_number is 1`);
  assert(day1Res.day.track_id === 'java', `Day 1 track is 'java'`);
  assert(day1Res.tasks && day1Res.tasks.length === 5, `Day 1 has 5 dedicated study tasks (Received: ${day1Res.tasks?.length})`);
  assert(day1Res.tasks[0].code_examples && day1Res.tasks[0].code_examples.includes('class'), `Day 1 Task 1 contains Java code examples`);
  assert(day1Res.tasks[0].interview_questions && day1Res.tasks[0].interview_questions.includes('Q:'), `Day 1 Task 1 contains interview Q&A`);

  // 1.4 Verify Day 99 Details (DBMS Relational Model)
  const day99Res = await fetch(`${API_BASE}/days/99`).then((r) => r.json());
  assert(day99Res.day && day99Res.day.day_number === 99, `Day 99 day_number is 99`);
  assert(day99Res.day.track_id === 'dbms', `Day 99 track is 'dbms'`);
  assert(day99Res.tasks && day99Res.tasks.length === 5, `Day 99 has 5 dedicated DBMS tasks`);
  assert(day99Res.tasks[0].code_examples && day99Res.tasks[0].code_examples.includes('EXPLAIN'), `Day 99 Task contains SQL EXPLAIN buffers code`);

  // 1.5 Verify Weeks API by track
  const javaWeeksRes = await fetch(`${API_BASE}/weeks?trackId=java`).then((r) => r.json());
  const dbmsWeeksRes = await fetch(`${API_BASE}/weeks?trackId=dbms`).then((r) => r.json());
  assert(javaWeeksRes.length === 6, `Java track has 6 weeks (Received: ${javaWeeksRes.length})`);
  assert(dbmsWeeksRes.length === 8, `DBMS track has 8 weeks (Received: ${dbmsWeeksRes.length})`);

  console.log('\n--- TEST 2: MULTI-USER DATA SEPARATION & ISOLATION ---');

  // =========================================================================
  // TEST SECTION 2: MULTI-USER DATA SEPARATION & ISOLATION
  // =========================================================================

  // 2.1 Register User Alpha
  const timestamp = Date.now();
  const userAlphaEmail = `user_alpha_${timestamp}@test.com`;
  const userBetaEmail = `user_beta_${timestamp}@test.com`;

  const regAlpha = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'User Alpha',
      email: userAlphaEmail,
      password: 'Password123!',
      startDate: '2026-09-01',
    }),
  }).then((r) => r.json());

  assert(!!regAlpha.token, `User Alpha registered successfully (Token: ${!!regAlpha.token})`);
  const tokenAlpha = regAlpha.token;

  // 2.2 Register User Beta
  const regBeta = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'User Beta',
      email: userBetaEmail,
      password: 'Password123!',
      startDate: '2026-09-15',
    }),
  }).then((r) => r.json());

  assert(!!regBeta.token, `User Beta registered successfully (Token: ${!!regBeta.token})`);
  const tokenBeta = regBeta.token;

  // 2.3 User Alpha completes Day 1 and Tasks 101, 102
  await fetch(`${API_BASE}/days/1/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({ status: 'COMPLETED' }),
  });

  await fetch(`${API_BASE}/tasks/101/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({ status: 'COMPLETED' }),
  });

  await fetch(`${API_BASE}/tasks/102/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({ status: 'COMPLETED' }),
  });

  // User Alpha adds a private note to task 101
  const noteAlpha = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({
      day_id: 1,
      task_id: 101,
      content: 'ALPHA PRIVATE NOTE: Mastered JVM ClassLoader Subsystem.',
    }),
  }).then((r) => r.json());

  // 2.4 User Beta completes Day 99 (DBMS) and Task 9901
  await fetch(`${API_BASE}/days/99/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({ status: 'COMPLETED' }),
  });

  await fetch(`${API_BASE}/tasks/9901/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({ status: 'COMPLETED' }),
  });

  // User Beta adds a private note to task 9901
  const noteBeta = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({
      day_id: 99,
      task_id: 9901,
      content: 'BETA PRIVATE NOTE: Buffer pool clock-sweep eviction understood.',
    }),
  }).then((r) => r.json());

  // 2.5 Verify Dashboard Data Isolation
  const dashAlpha = await fetch(`${API_BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${tokenAlpha}` },
  }).then((r) => r.json());

  const dashBeta = await fetch(`${API_BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${tokenBeta}` },
  }).then((r) => r.json());

  assert(dashAlpha.completedDays === 1, `User Alpha has exactly 1 completed day (Received: ${dashAlpha.completedDays})`);
  assert(dashAlpha.completedTasks === 5, `User Alpha has exactly 5 completed tasks for Day 1 (Received: ${dashAlpha.completedTasks})`);
  assert(dashBeta.completedDays === 1, `User Beta has exactly 1 completed day (Received: ${dashBeta.completedDays})`);
  assert(dashBeta.completedTasks === 5, `User Beta has exactly 5 completed tasks for Day 99 (Received: ${dashBeta.completedTasks})`);

  // 2.6 Verify Day Status Isolation
  const day1ForAlpha = await fetch(`${API_BASE}/days/1`, {
    headers: { Authorization: `Bearer ${tokenAlpha}` },
  }).then((r) => r.json());

  const day1ForBeta = await fetch(`${API_BASE}/days/1`, {
    headers: { Authorization: `Bearer ${tokenBeta}` },
  }).then((r) => r.json());

  assert(day1ForAlpha.day.status === 'COMPLETED', `Day 1 is 'COMPLETED' for User Alpha`);
  assert(day1ForBeta.day.status === 'PENDING', `Day 1 is 'PENDING' for User Beta (isolated correctly!)`);

  const day99ForAlpha = await fetch(`${API_BASE}/days/99`, {
    headers: { Authorization: `Bearer ${tokenAlpha}` },
  }).then((r) => r.json());

  const day99ForBeta = await fetch(`${API_BASE}/days/99`, {
    headers: { Authorization: `Bearer ${tokenBeta}` },
  }).then((r) => r.json());

  assert(day99ForAlpha.day.status === 'PENDING', `Day 99 is 'PENDING' for User Alpha`);
  assert(day99ForBeta.day.status === 'COMPLETED', `Day 99 is 'COMPLETED' for User Beta`);

  // 2.7 Verify Notes Isolation
  const notesForAlpha = await fetch(`${API_BASE}/notes`, {
    headers: { Authorization: `Bearer ${tokenAlpha}` },
  }).then((r) => r.json());

  const notesForBeta = await fetch(`${API_BASE}/notes`, {
    headers: { Authorization: `Bearer ${tokenBeta}` },
  }).then((r) => r.json());

  assert(notesForAlpha.length === 1 && notesForAlpha[0].content.includes('ALPHA PRIVATE NOTE'), `User Alpha sees only their own note`);
  assert(notesForBeta.length === 1 && notesForBeta[0].content.includes('BETA PRIVATE NOTE'), `User Beta sees only their own note`);

  console.log('\n--- TEST 3: COMMUNITY LEADERBOARD ACCURACY & RANKINGS ---');

  // =========================================================================
  // TEST SECTION 3: COMMUNITY LEADERBOARD ACCURACY & RANKINGS
  // =========================================================================

  const leaderboardRes = await fetch(`${API_BASE}/community/leaderboard`, {
    headers: { Authorization: `Bearer ${tokenAlpha}` },
  }).then((r) => r.json());

  assert(leaderboardRes.leaderboard && leaderboardRes.leaderboard.length >= 6, `Leaderboard contains all registered scholars (Count: ${leaderboardRes.leaderboard.length})`);
  assert(leaderboardRes.topScholar && leaderboardRes.topScholar.rank === 1, `Leaderboard identifies Top Scholar at rank #1`);

  // Verify rank ordering
  let isStrictlyOrdered = true;
  for (let i = 0; i < leaderboardRes.leaderboard.length - 1; i++) {
    const curr = leaderboardRes.leaderboard[i];
    const next = leaderboardRes.leaderboard[i + 1];
    if (curr.completedDays < next.completedDays) {
      isStrictlyOrdered = false;
      break;
    }
  }
  assert(isStrictlyOrdered, `Leaderboard is strictly sorted in descending order of completed days`);

  // Verify isCurrentUser flag
  const alphaInLeaderboard = leaderboardRes.leaderboard.find((entry: any) => entry.email === userAlphaEmail);
  const betaInLeaderboard = leaderboardRes.leaderboard.find((entry: any) => entry.email === userBetaEmail);

  assert(alphaInLeaderboard && alphaInLeaderboard.isCurrentUser === true, `isCurrentUser is TRUE for requesting user (Alpha)`);
  assert(betaInLeaderboard && betaInLeaderboard.isCurrentUser === false, `isCurrentUser is FALSE for other users (Beta)`);
  assert(alphaInLeaderboard.completedDays === 1, `Alpha completedDays in leaderboard matches database (1 day)`);

  console.log('\n--- TEST 4: PROGRESSIVE GATING (WEEK+10, DOMAIN LOCKING, STREAKS) ---');

  // =========================================================================
  // TEST SECTION 4: PROGRESSIVE GATING (WEEK+10, DOMAIN LOCKING, STREAKS)
  // =========================================================================

  // 4.1 Verify Domain Locking on Tracks endpoint
  const tracksForAlpha = await fetch(`${API_BASE}/tracks`, {
    headers: { Authorization: `Bearer ${tokenAlpha}` },
  }).then((r) => r.json());

  assert(tracksForAlpha.length === 6, `API /tracks returns 6 curriculum domains`);
  assert(tracksForAlpha[0].is_locked === false, `First track (${tracksForAlpha[0].name}) is unlocked by default`);
  assert(tracksForAlpha[1].is_locked === true, `Second track (${tracksForAlpha[1].name}) is locked until first track completes`);
  assert(tracksForAlpha[1].lock_reason && tracksForAlpha[1].lock_reason.includes('Complete'), `Locked track provides clear unlock requirement message`);

  // 4.2 Verify Week + 10 Learning Horizon
  const weeksForAlpha = await fetch(`${API_BASE}/weeks`, {
    headers: { Authorization: `Bearer ${tokenAlpha}` },
  }).then((r) => r.json());

  const week1 = weeksForAlpha.find((w: any) => w.week_number === 1);
  const week11 = weeksForAlpha.find((w: any) => w.week_number === 11);
  const week15 = weeksForAlpha.find((w: any) => w.week_number === 15);

  assert(week1 && week1.is_locked === false, `Week 1 is unlocked`);
  assert(week11 && week11.is_locked === false, `Week 11 (Week 1 + 10 horizon) is unlocked for starter`);
  assert(week15 && week15.is_locked === true, `Week 15 (beyond Week + 10 horizon) is locked`);
  assert(week15 && week15.lock_reason.includes('Week 5'), `Week 15 states it unlocks when user reaches Week 5`);

  // 4.3 Verify LeetCode Locking by Week Horizon
  const leetcodeForAlpha = await fetch(`${API_BASE}/leetcode`, {
    headers: { Authorization: `Bearer ${tokenAlpha}` },
  }).then((r) => r.json());

  const leetcodeWeek1 = leetcodeForAlpha.find((p: any) => p.week_id === 1);
  const leetcodeWeek20 = leetcodeForAlpha.find((p: any) => p.week_id >= 20);

  assert(leetcodeWeek1 && leetcodeWeek1.is_locked === false, `LeetCode problem in Week 1 is unlocked`);
  if (leetcodeWeek20) {
    assert(leetcodeWeek20.is_locked === true, `LeetCode problem in Week >= 20 is locked`);
    assert(leetcodeWeek20.lock_reason && leetcodeWeek20.lock_reason.includes('Week'), `Locked LeetCode problem provides week unlock horizon message`);
  }

  // 4.4 Verify Dashboard Streak Tracking
  const dashStatsForAlpha = await fetch(`${API_BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${tokenAlpha}` },
  }).then((r) => r.json());

  assert(dashStatsForAlpha.streak !== undefined, `Dashboard returns streak metrics`);
  assert(dashStatsForAlpha.streak.current >= 1, `Alpha current streak is updated upon completing Day 1 task`);
  assert(dashStatsForAlpha.maxUnlockedWeek >= 11, `Dashboard reports maxUnlockedWeek >= 11`);

  console.log('\n===============================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
