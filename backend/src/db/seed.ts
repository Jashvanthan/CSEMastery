import { initSchema, query } from './index';
import { generateFullCurriculum } from './curriculumBuilder';
import bcrypt from 'bcrypt';

export async function runSeed(): Promise<void> {
  console.log('[SEED] Initializing database schema...');
  await initSchema();

  console.log('[SEED] Generating 200-day curriculum dataset...');
  const { tracks, weeks, days, leetcodeProblems, projects } = generateFullCurriculum();

  // 1. Seed Tracks
  console.log(`[SEED] Seeding ${tracks.length} tracks...`);
  for (const t of tracks) {
    await query(
      `INSERT INTO tracks (id, name, description, icon, color)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         color = EXCLUDED.color`,
      [t.id, t.name, t.description, t.icon, t.color]
    );
  }

  // 2. Seed Weeks
  console.log(`[SEED] Seeding ${weeks.length} weeks...`);
  await query(`DELETE FROM weeks WHERE id > 30`);
  for (const w of weeks) {
    await query(
      `INSERT INTO weeks (id, week_number, title, description, track_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         week_number = EXCLUDED.week_number,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         track_id = EXCLUDED.track_id`,
      [w.id, w.week_number, w.title, w.description, w.track_id]
    );
  }

  // 3. Seed Study Days and Study Tasks
  console.log(`[SEED] Seeding ${days.length} study days and all subtopic study tasks...`);
  let totalTasks = 0;
  for (const d of days) {
    await query(
      `INSERT INTO study_days (id, day_number, week_id, track_id, title, topic, overview, learning_objectives, estimated_minutes, practical_task, checklist)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         day_number = EXCLUDED.day_number,
         week_id = EXCLUDED.week_id,
         track_id = EXCLUDED.track_id,
         title = EXCLUDED.title,
         topic = EXCLUDED.topic,
         overview = EXCLUDED.overview,
         learning_objectives = EXCLUDED.learning_objectives,
         estimated_minutes = EXCLUDED.estimated_minutes,
         practical_task = EXCLUDED.practical_task,
         checklist = EXCLUDED.checklist`,
      [
        d.day_number,
        d.day_number,
        d.week_id,
        d.track_id,
        d.title,
        d.topic,
        d.overview,
        JSON.stringify(d.learning_objectives),
        d.estimated_minutes,
        d.practical_task,
        JSON.stringify(d.checklist),
      ]
    );

    for (const t of d.tasks) {
      totalTasks++;
      const taskId = d.day_number * 100 + t.task_number;
      await query(
        `INSERT INTO study_tasks (id, day_id, task_number, title, slug, subtopic, track, topic, description, content, examples, code_examples, interview_questions, common_mistakes, practical_exercise, checklist, estimated_minutes, difficulty, is_mandatory, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (id) DO UPDATE SET
           day_id = EXCLUDED.day_id,
           task_number = EXCLUDED.task_number,
           title = EXCLUDED.title,
           slug = EXCLUDED.slug,
           subtopic = EXCLUDED.subtopic,
           track = EXCLUDED.track,
           topic = EXCLUDED.topic,
           description = EXCLUDED.description,
           content = EXCLUDED.content,
           code_examples = EXCLUDED.code_examples,
           interview_questions = EXCLUDED.interview_questions,
           common_mistakes = EXCLUDED.common_mistakes,
           practical_exercise = EXCLUDED.practical_exercise,
           checklist = EXCLUDED.checklist,
           estimated_minutes = EXCLUDED.estimated_minutes,
           difficulty = EXCLUDED.difficulty,
           is_mandatory = EXCLUDED.is_mandatory,
           sort_order = EXCLUDED.sort_order`,
        [
          taskId,
          d.day_number,
          t.task_number,
          t.title,
          t.slug,
          t.subtopic,
          d.track_id,
          d.topic,
          t.description,
          t.content,
          '',
          t.code_examples || '',
          t.interview_questions || '',
          t.common_mistakes || '',
          t.practical_exercise || '',
          JSON.stringify(t.checklist || []),
          t.estimated_minutes || 25,
          t.difficulty || 'Medium',
          1,
          t.task_number,
        ]
      );
    }
  }

  // 4. Seed LeetCode Problems
  console.log(`[SEED] Seeding ${leetcodeProblems.length} LeetCode problems...`);
  for (const lp of leetcodeProblems) {
    const existing = await query(`SELECT id FROM leetcode_problems WHERE leetcode_number = $1`, [lp.leetcode_number]);
    if (!existing.rows || existing.rows.length === 0) {
      await query(
        `INSERT INTO leetcode_problems (leetcode_number, title, difficulty, topic, subtopic, week_id, url, solution_approach, time_complexity, space_complexity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [lp.leetcode_number, lp.title, lp.difficulty, lp.topic, lp.subtopic, lp.week_id, lp.url, lp.solution_approach, lp.time_complexity, lp.space_complexity]
      );
    }
  }

  // 5. Seed Projects
  console.log(`[SEED] Seeding ${projects.length} capstone & topic projects...`);
  for (const p of projects) {
    const existing = await query(`SELECT id FROM projects WHERE title = $1`, [p.title]);
    if (!existing.rows || existing.rows.length === 0) {
      await query(
        `INSERT INTO projects (title, description, phase, track_id, tech_stack, requirements)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.title, p.description, p.phase, p.track_id, p.tech_stack, p.requirements]
      );
    }
  }

  // 6. Seed Multi-User Demo Scholars
  console.log('[SEED] Seeding multi-user demo scholars with realistic historical progress...');
  const demoUsersConfig = [
    {
      id: 1,
      email: 'student@csemastery.hub',
      name: 'Mastery Scholar',
      daysOffset: 10,
      completedDaysCount: 5,
      leetcodeCount: 5,
      notes: 'Mastering Java Foundations and JVM memory layout. On track for 200 days!'
    },
    {
      id: 2,
      email: 'sarah.chen@stanford.edu',
      name: 'Sarah Chen',
      daysOffset: 24,
      completedDaysCount: 18,
      leetcodeCount: 16,
      notes: 'Deep diving into Java Generics, Reflection, and Collections Internals.'
    },
    {
      id: 3,
      email: 'alex.rivera@berkeley.edu',
      name: 'Alex Rivera',
      daysOffset: 54,
      completedDaysCount: 42,
      leetcodeCount: 38,
      notes: 'Finished Java Concurrency and now solving Trees and Graph algorithms.'
    },
    {
      id: 4,
      email: 'priya.sharma@iitd.ac.in',
      name: 'Priya Sharma',
      daysOffset: 109,
      completedDaysCount: 85,
      leetcodeCount: 64,
      notes: 'Mastered Relational Algebra and Normalization. Building PostgreSQL schemas.'
    },
  ];

  const defaultPasswordHash = await bcrypt.hash('Mastery200!', 10);

  for (const u of demoUsersConfig) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - u.daysOffset);
    const startDateStr = startDate.toISOString().split('T')[0];

    const existing = await query(`SELECT id FROM users WHERE email = $1`, [u.email]);
    let userId = u.id;

    if (!existing.rows || existing.rows.length === 0) {
      const userRes = await query(
        `INSERT INTO users (id, email, password_hash, name, start_date)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           start_date = EXCLUDED.start_date`,
        [u.id, u.email, defaultPasswordHash, u.name, startDateStr]
      );
      userId = u.id;
    }

    // Seed completed days & tasks for each user
    for (let dayNum = 1; dayNum <= u.completedDaysCount; dayNum++) {
      await query(
        `INSERT INTO day_progress (user_id, day_id, status, completed_at)
         VALUES ($1, $2, 'COMPLETED', datetime('now'))
         ON CONFLICT (user_id, day_id) DO UPDATE SET status = 'COMPLETED'`,
        [userId, dayNum]
      );

      for (let tNum = 1; tNum <= 5; tNum++) {
        const tId = dayNum * 100 + tNum;
        await query(
          `INSERT INTO study_progress (user_id, task_id, status, revision_status, completed_at)
           VALUES ($1, $2, 'COMPLETED', 'MASTERED', datetime('now'))
           ON CONFLICT (user_id, task_id) DO UPDATE SET status = 'COMPLETED'`,
          [userId, tId]
        );
      }
    }

    // Seed LeetCode progress
    const allProblems = await query(`SELECT id FROM leetcode_problems ORDER BY id ASC LIMIT $1`, [u.leetcodeCount]);
    if (allProblems.rows) {
      for (const p of allProblems.rows) {
        await query(
          `INSERT INTO leetcode_progress (user_id, problem_id, status, notes, completed_at)
           VALUES ($1, $2, 'COMPLETED', 'Solved with optimal asymptotic bounds.', datetime('now'))
           ON CONFLICT (user_id, problem_id) DO UPDATE SET status = 'COMPLETED'`,
          [userId, p.id]
        );
      }
    }

    // Seed user note
    await query(
      `INSERT INTO study_notes (user_id, day_id, task_id, content)
       VALUES ($1, $2, $3, $4)`,
      [userId, 1, 101, u.notes]
    );
  }

  console.log('====================================================');
  console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log(`   - Tracks: ${tracks.length}`);
  console.log(`   - Weeks: ${weeks.length}`);
  console.log(`   - Days: ${days.length} (Day 1 -> Day 200)`);
  console.log(`   - Study Tasks: ${totalTasks} dedicated study pages`);
  console.log(`   - LeetCode Problems: ${leetcodeProblems.length}`);
  console.log(`   - Projects: ${projects.length}`);
  console.log(`   - Multi-User Demo Scholars: ${demoUsersConfig.length}`);
  console.log('====================================================');
}

// Execute if run directly
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[SEED ERROR]:', err);
      process.exit(1);
    });
}
