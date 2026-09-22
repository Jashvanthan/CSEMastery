// Comprehensive End-to-End Business Logic Verification Suite for CSEMastery
import { query, getOne, getAll } from './src/db';

const API_BASE = 'http://127.0.0.1:5000/api';

async function runOverallBusinessLogicTests() {
  console.log('======================================================================');
  console.log('🧪 COMPREHENSIVE BUSINESS LOGIC VALIDATION SUITE — CSE MASTERY HUB');
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

  // =========================================================================
  // 1. AUTHENTICATION, DEFAULT ACCOUNT & SECURITY
  // =========================================================================
  console.log('--- 1. AUTHENTICATION & ACCESS SECURITY ---');

  // 1.1 Unauthenticated requests are rejected with 401
  const unauthRes = await fetch(`${API_BASE}/dashboard`);
  assert(unauthRes.status === 401, 'Unauthenticated request to /api/dashboard returns 401 Unauthorized');

  // 1.2 Default Demo Scholar Account
  const demoUsers = await fetch(`${API_BASE}/auth/demo-users`).then((r) => r.json());
  assert(demoUsers && demoUsers.length === 1, `Exactly 1 default demo account provided (Count: ${demoUsers?.length})`);
  assert(demoUsers[0].name === 'Mastery Scholar', `Default demo account name is 'Mastery Scholar'`);

  // 1.3 Demo Login generates valid JWT
  const demoLoginRes = await fetch(`${API_BASE}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 1 }),
  }).then((r) => r.json());
  assert(demoLoginRes.token && demoLoginRes.user.id === 1, '1-Click Demo Login returns valid JWT token for Mastery Scholar');

  const demoToken = demoLoginRes.token;

  // 1.4 Register two unique test users
  const rand = Math.floor(Math.random() * 100000);
  const user1Email = `scholar_biz_1_${rand}@test.com`;
  const user2Email = `scholar_biz_2_${rand}@test.com`;

  const regUser1 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Business Tester 1', email: user1Email, password: 'Password123!' }),
  }).then((r) => r.json());

  const regUser2 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Business Tester 2', email: user2Email, password: 'Password123!' }),
  }).then((r) => r.json());

  assert(regUser1.token && regUser1.user.email === user1Email, 'User 1 registered and received authenticated token');
  assert(regUser2.token && regUser2.user.email === user2Email, 'User 2 registered and received authenticated token');

  const token1 = regUser1.token;
  const token2 = regUser2.token;

  // =========================================================================
  // 2. 200-DAY CURRICULUM INTEGRITY & CONTENT COMPLETENESS
  // =========================================================================
  console.log('\n--- 2. 200-DAY CURRICULUM INTEGRITY & CONTENT ---');

  const daysRes = await fetch(`${API_BASE}/days?limit=200`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());

  assert(daysRes.days && daysRes.days.length === 200, `Complete 200 days exist in database (Count: ${daysRes.days?.length})`);

  // Verify sequential day ordering
  let isStrictDaySequence = true;
  for (let i = 0; i < daysRes.days.length; i++) {
    if (daysRes.days[i].day_number !== i + 1) {
      isStrictDaySequence = false;
      break;
    }
  }
  assert(isStrictDaySequence, 'All days are strictly numbered 1 through 200 with zero missing days');

  // Verify 30 Weeks
  const weeksRes = await fetch(`${API_BASE}/weeks`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());
  assert(weeksRes.length === 30, `Curriculum is structured across exactly 30 weeks (Count: ${weeksRes.length})`);

  // Verify Day 1 Details
  const day1Detail = await fetch(`${API_BASE}/days/1`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());
  assert(day1Detail.day && day1Detail.tasks.length === 5, 'Day 1 contains 5 dedicated subtopic study tasks');
  assert(day1Detail.tasks[0].code_examples.length > 20, 'Day 1 Task 1 includes executable code examples');
  assert(day1Detail.tasks[0].interview_questions.length > 20, 'Day 1 Task 1 includes technical interview Q&A');

  // =========================================================================
  // 3. PROGRESSIVE GATING: WEEK + 10 HORIZON & DOMAIN LOCKING
  // =========================================================================
  console.log('\n--- 3. PROGRESSIVE GATING & UNLOCK HORIZON ---');

  // 3.1 Week + 10 Horizon for new user: Weeks 1-11 unlocked, Weeks 12-30 locked
  const week1 = weeksRes.find((w: any) => w.week_number === 1);
  const week11 = weeksRes.find((w: any) => w.week_number === 11);
  const week12 = weeksRes.find((w: any) => w.week_number === 12);
  const week30 = weeksRes.find((w: any) => w.week_number === 30);

  assert(week1.is_locked === false, 'Week 1 is unlocked by default');
  assert(week11.is_locked === false, 'Week 11 (Week 1 + 10) is accessible in active unlock horizon');
  assert(week12.is_locked === true, 'Week 12 is locked (beyond initial Week 1 + 10 horizon)');
  assert(week30.is_locked === true, 'Week 30 is locked');

  // 3.2 Security Guard: Attempting to complete a task in locked Week 12 returns 403 Forbidden
  const taskInWeek12 = await getOne(
    `SELECT st.id FROM study_tasks st
     JOIN study_days sd ON st.day_id = sd.id
     WHERE sd.week_id = 12
     LIMIT 1`
  );
  if (taskInWeek12) {
    const lockedTaskRes = await fetch(`${API_BASE}/tasks/${taskInWeek12.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    assert(lockedTaskRes.status === 403, 'Security: Direct API attempt to complete task in locked Week 12 returns 403 Forbidden');
  }

  // 3.3 Domain Locking: 1 Domain at a time
  const tracksRes = await fetch(`${API_BASE}/tracks`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());

  assert(tracksRes[0].is_locked === false, `Initial domain (${tracksRes[0].name}) is unlocked`);
  assert(tracksRes[1].is_locked === true, `Subsequent domain (${tracksRes[1].name}) is locked until active domain completes`);
  assert(tracksRes[1].lock_reason && tracksRes[1].lock_reason.includes('Complete'), 'Locked domain provides clear lock reason');

  // =========================================================================
  // 4. DAY & TASK CASCADE COMPLETION & AUTO-SYNC
  // =========================================================================
  console.log('\n--- 4. DAY & TASK CASCADE & AUTO-SYNC ---');

  // Fetch Day 1 tasks for User 1
  const day1Tasks = day1Detail.tasks;
  assert(day1Tasks.length === 5, 'Day 1 has 5 tasks to complete');

  // Complete tasks 1, 2, 3, 4, 5 for User 1
  for (const t of day1Tasks) {
    await fetch(`${API_BASE}/tasks/${t.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ status: 'COMPLETED', revisionStatus: 'MASTERED' }),
    });
  }

  // Check Day 1 status for User 1
  const updatedDay1User1 = await fetch(`${API_BASE}/days/1`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());

  assert(updatedDay1User1.day.status === 'COMPLETED', 'Completing all 5 tasks automatically marks Day 1 as COMPLETED');
  assert(updatedDay1User1.completedTasks === 5, 'Day 1 reports 5/5 tasks completed (100% progress)');

  // Check that User 2's Day 1 is STILL PENDING (Zero contamination)
  const day1User2 = await fetch(`${API_BASE}/days/1`, {
    headers: { Authorization: `Bearer ${token2}` },
  }).then((r) => r.json());
  assert(day1User2.day.status === 'PENDING', 'User 2 Day 1 remains PENDING (Multi-tenant progress isolated)');
  assert(day1User2.completedTasks === 0, 'User 2 has 0/5 tasks completed on Day 1');

  // =========================================================================
  // 5. DAILY STREAK MATHEMATICS & HIGHEST STREAK PERSISTENCE
  // =========================================================================
  console.log('\n--- 5. DAILY STREAK MATHEMATICS & BEST RECORD ---');

  const dashUser1 = await fetch(`${API_BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());

  assert(dashUser1.streak.current >= 1, `User 1 current streak is active (${dashUser1.streak.current} day)`);
  assert(dashUser1.streak.highest >= 1 || dashUser1.streak.longest >= 1, 'User 1 highest streak is recorded');
  assert(dashUser1.completedDays === 1, 'User 1 dashboard shows 1 completed day');
  assert(dashUser1.completedTasks === 5, 'User 1 dashboard shows 5 completed tasks');

  // =========================================================================
  // 6. LEETCODE GATING & DIFFICULTY TRACKING
  // =========================================================================
  console.log('\n--- 6. LEETCODE TOPIC GATING & PRACTICE HUB ---');

  const leetcodeList = await fetch(`${API_BASE}/leetcode`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());

  const lcWeek1 = leetcodeList.find((p: any) => p.week_id === 1);
  const lcWeek25 = leetcodeList.find((p: any) => p.week_id >= 25);

  assert(lcWeek1 && lcWeek1.is_locked === false, 'LeetCode problem in Week 1 is unlocked');
  if (lcWeek25) {
    assert(lcWeek25.is_locked === true, 'LeetCode problem in Week 25 is locked');

    // Attempting to complete locked problem returns 403
    const toggleLockedLc = await fetch(`${API_BASE}/leetcode/${lcWeek25.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    assert(toggleLockedLc.status === 403, 'Security: Completing a locked LeetCode question returns 403 Forbidden');
  }

  // Complete unlocked Week 1 problem
  if (lcWeek1) {
    const completeLcRes = await fetch(`${API_BASE}/leetcode/${lcWeek1.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ status: 'COMPLETED', notes: 'Optimal two-pointer approach applied.' }),
    });
    assert(completeLcRes.status === 200, 'Unlocked LeetCode question completed successfully with notes');
  }

  // =========================================================================
  // 7. COMMUNITY LEADERBOARD & SCHOLAR RANKINGS
  // =========================================================================
  console.log('\n--- 7. COMMUNITY LEADERBOARD & SCHOLAR RANKINGS ---');

  const leaderboardRes = await fetch(`${API_BASE}/community/leaderboard`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());

  assert(leaderboardRes.leaderboard && leaderboardRes.leaderboard.length > 0, `Leaderboard populated with scholars`);
  assert(leaderboardRes.topScholar && leaderboardRes.topScholar.rank === 1, 'Top scholar identified at rank #1');

  const user1InLeaderboard = leaderboardRes.leaderboard.find((e: any) => e.email === user1Email);
  const user2InLeaderboard = leaderboardRes.leaderboard.find((e: any) => e.email === user2Email);

  assert(user1InLeaderboard && user1InLeaderboard.isCurrentUser === true, 'isCurrentUser is TRUE for requesting user (User 1)');
  assert(user2InLeaderboard && user2InLeaderboard.isCurrentUser === false, 'isCurrentUser is FALSE for other users (User 2)');
  assert(user1InLeaderboard.completedDays === 1, 'User 1 completedDays reflected accurately on live leaderboard');

  console.log('\n======================================================================');
  console.log(`📊 BUSINESS LOGIC TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runOverallBusinessLogicTests().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
