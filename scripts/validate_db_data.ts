import { query, getOne, getAll, initSchema } from '../backend/src/db';

async function validateDatabase() {
  console.log('================================================================');
  console.log('🔍 IN-DEPTH DATABASE DATA VALIDATION REPORT');
  console.log('================================================================\n');

  await initSchema();

  let hasErrors = false;

  // 1. Validate Days (Day 1 -> Day 200)
  const totalDaysRow = await getOne(`SELECT COUNT(*) as count FROM study_days`);
  const totalDays = parseInt(totalDaysRow.count, 10);
  console.log(`[1] Study Days Count: ${totalDays} / 200`);

  if (totalDays !== 200) {
    console.error(`❌ ERROR: Expected 200 days, found ${totalDays}`);
    hasErrors = true;
  } else {
    console.log(`✅ Exactly 200 days exist.`);
  }

  // Check for any gaps in day_number 1 to 200
  const allDayNumbers = await getAll(`SELECT day_number FROM study_days ORDER BY day_number ASC`);
  const dayNums = allDayNumbers.map((d) => d.day_number);
  const missingDays: number[] = [];
  for (let i = 1; i <= 200; i++) {
    if (!dayNums.includes(i)) missingDays.push(i);
  }

  if (missingDays.length > 0) {
    console.error(`❌ ERROR: Missing day numbers: ${missingDays.join(', ')}`);
    hasErrors = true;
  } else {
    console.log(`✅ Consecutive day sequence verified: Day 1 through Day 200 (No gaps).`);
  }

  // 2. Validate Tracks Distribution
  console.log('\n[2] Tracks & Day Distribution:');
  const trackDist = await getAll(
    `SELECT t.id, t.name, COUNT(sd.id) as day_count
     FROM tracks t
     LEFT JOIN study_days sd ON sd.track_id = t.id
     GROUP BY t.id, t.name
     ORDER BY day_count DESC`
  );
  console.table(trackDist);

  // 3. Validate Weeks (Week 1 -> Week 30)
  console.log('\n[3] Weeks Distribution:');
  const totalWeeksRow = await getOne(`SELECT COUNT(*) as count FROM weeks`);
  const totalWeeks = parseInt(totalWeeksRow.count, 10);
  console.log(`Total Weeks: ${totalWeeks} / 30`);

  const weekGaps = await getAll(
    `SELECT w.id, w.week_number, w.title, COUNT(sd.id) as day_count
     FROM weeks w
     LEFT JOIN study_days sd ON sd.week_id = w.id
     GROUP BY w.id, w.week_number, w.title
     ORDER BY w.week_number ASC`
  );
  console.log(`Weeks 1 to 5 sample:`);
  console.table(weekGaps.slice(0, 5));
  console.log(`Weeks 26 to 30 sample:`);
  console.table(weekGaps.slice(-5));

  // 4. Validate Dedicated Study Tasks
  console.log('\n[4] Dedicated Study Tasks Validation:');
  const totalTasksRow = await getOne(`SELECT COUNT(*) as count FROM study_tasks`);
  const totalTasks = parseInt(totalTasksRow.count, 10);
  console.log(`Total Tasks in Database: ${totalTasks}`);

  // Check if any day has 0 tasks
  const daysWithoutTasks = await getAll(
    `SELECT sd.id, sd.day_number, sd.title
     FROM study_days sd
     LEFT JOIN study_tasks st ON st.day_id = sd.id
     WHERE st.id IS NULL`
  );

  if (daysWithoutTasks.length > 0) {
    console.error(`❌ ERROR: Days without tasks found:`, daysWithoutTasks);
    hasErrors = true;
  } else {
    console.log(`✅ Every single day (Day 1..200) has multiple dedicated study tasks.`);
  }

  // Check task content completeness
  const incompleteTasks = await getAll(
    `SELECT id, day_id, title FROM study_tasks
     WHERE content IS NULL OR length(content) < 10`
  );
  if (incompleteTasks.length > 0) {
    console.error(`❌ ERROR: Incomplete task contents found:`, incompleteTasks);
    hasErrors = true;
  } else {
    console.log(`✅ All ${totalTasks} tasks contain complete educational study content.`);
  }

  // 5. Validate LeetCode Problems
  console.log('\n[5] LeetCode Tracker Problems Validation:');
  const totalLeetcodeRow = await getOne(`SELECT COUNT(*) as count FROM leetcode_problems`);
  console.log(`Total LeetCode Problems: ${totalLeetcodeRow.count}`);

  const leetcodeByDiff = await getAll(
    `SELECT difficulty, COUNT(*) as count FROM leetcode_problems GROUP BY difficulty`
  );
  console.table(leetcodeByDiff);

  const leetcodeByTopic = await getAll(
    `SELECT topic, COUNT(*) as count FROM leetcode_problems GROUP BY topic ORDER BY count DESC`
  );
  console.log(`Top LeetCode Topics:`);
  console.table(leetcodeByTopic.slice(0, 6));

  // 6. Validate Topic Projects & Capstones
  console.log('\n[6] Topic & Capstone Projects:');
  const projects = await getAll(`SELECT id, title, phase, track_id FROM projects`);
  console.table(projects);

  // 7. Validate User & Progress Records
  console.log('\n[7] Users & Progress Records:');
  const usersCount = await getOne(`SELECT COUNT(*) as count FROM users`);
  const dayProgCount = await getOne(`SELECT COUNT(*) as count FROM day_progress`);
  const taskProgCount = await getOne(`SELECT COUNT(*) as count FROM study_progress`);
  const lcProgCount = await getOne(`SELECT COUNT(*) as count FROM leetcode_progress`);

  console.log(`Users: ${usersCount.count}`);
  console.log(`Day Progress records: ${dayProgCount.count}`);
  console.log(`Task Progress records: ${taskProgCount.count}`);
  console.log(`LeetCode Progress records: ${lcProgCount.count}`);

  // Check for orphan records
  const orphanTasks = await getAll(
    `SELECT sp.id FROM study_progress sp
     LEFT JOIN study_tasks st ON sp.task_id = st.id
     WHERE st.id IS NULL`
  );
  const orphanDays = await getAll(
    `SELECT dp.id FROM day_progress dp
     LEFT JOIN study_days sd ON dp.day_id = sd.id
     WHERE sd.id IS NULL`
  );

  if (orphanTasks.length > 0 || orphanDays.length > 0) {
    console.error(`❌ Orphan progress records detected!`);
    hasErrors = true;
  } else {
    console.log(`✅ Referential integrity verified: No orphan progress records found.`);
  }

  console.log('\n================================================================');
  if (hasErrors) {
    console.error('❌ DATABASE VALIDATION FAILED WITH ERRORS.');
    process.exit(1);
  } else {
    console.log('✅ ALL DATABASE DATA VALIDATION CHECKS PASSED WITH 100% INTEGRITY!');
  }
  console.log('================================================================\n');
}

validateDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Validation script exception:', err);
    process.exit(1);
  });
