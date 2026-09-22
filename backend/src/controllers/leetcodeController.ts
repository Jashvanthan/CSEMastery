import { Response } from 'express';
import { query, getOne, getAll } from '../db';
import { AuthRequest } from '../middleware/auth';

export async function getLeetcodeList(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const { topic, week, difficulty, status, search } = req.query;

    let sql = `SELECT lp.*, COALESCE(lkp.status, 'PENDING') as status, lkp.notes as user_notes, lkp.completed_at
               FROM leetcode_problems lp
               LEFT JOIN leetcode_progress lkp ON lp.id = lkp.problem_id AND lkp.user_id = $1
               WHERE 1=1`;
    const params: any[] = [userId];

    if (topic && topic !== 'All') {
      params.push(topic);
      sql += ` AND lp.topic = $${params.length}`;
    }

    if (week && week !== 'All') {
      params.push(parseInt(week as string, 10));
      sql += ` AND lp.week_id = $${params.length}`;
    }

    if (difficulty && difficulty !== 'All') {
      params.push(difficulty);
      sql += ` AND lp.difficulty = $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND COALESCE(lkp.status, 'PENDING') = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (lp.title LIKE $${params.length} OR CAST(lp.leetcode_number AS TEXT) LIKE $${params.length} OR lp.subtopic LIKE $${params.length})`;
    }

    sql += ` ORDER BY lp.leetcode_number ASC`;

    const problems = await getAll(sql, params);

    // Compute max unlocked week
    const completedWeekRows = await getAll(
      `SELECT w.week_number
       FROM weeks w
       JOIN study_days sd ON sd.week_id = w.id
       LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1 AND dp.status = 'COMPLETED'
       GROUP BY w.id, w.week_number
       HAVING COUNT(sd.id) = COUNT(dp.id)
       ORDER BY w.week_number DESC`,
      [userId]
    );
    const highestCompletedWeek = completedWeekRows.length > 0 ? completedWeekRows[0].week_number : 0;
    const maxUnlockedWeek = Math.min(30, Math.max(11, highestCompletedWeek + 10));

    const enrichedProblems = problems.map((p: any) => {
      const isLocked = p.week_id > maxUnlockedWeek;
      return {
        ...p,
        is_locked: isLocked,
        lock_reason: isLocked ? `Unlocks when you reach Week ${p.week_id - 10} (Week + 10 Learning Horizon)` : undefined,
      };
    });

    return res.json(enrichedProblems);
  } catch (error: any) {
    console.error('getLeetcodeList error:', error);
    return res.status(500).json({ error: 'Failed to fetch LeetCode problems.' });
  }
}

export async function getLeetcodeStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;

    const totalProblemsRow = await getOne(`SELECT COUNT(*) as count FROM leetcode_problems`);
    const total = parseInt(totalProblemsRow?.count || '0', 10);

    const completedRow = await getOne(
      `SELECT COUNT(*) as count FROM leetcode_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    );
    const completed = parseInt(completedRow?.count || '0', 10);
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const easyCompleted = await getOne(
      `SELECT COUNT(*) as count FROM leetcode_progress lp JOIN leetcode_problems p ON lp.problem_id = p.id WHERE lp.user_id = $1 AND lp.status = 'COMPLETED' AND p.difficulty = 'Easy'`,
      [userId]
    );
    const easyTotal = await getOne(`SELECT COUNT(*) as count FROM leetcode_problems WHERE difficulty = 'Easy'`);

    const mediumCompleted = await getOne(
      `SELECT COUNT(*) as count FROM leetcode_progress lp JOIN leetcode_problems p ON lp.problem_id = p.id WHERE lp.user_id = $1 AND lp.status = 'COMPLETED' AND p.difficulty = 'Medium'`,
      [userId]
    );
    const mediumTotal = await getOne(`SELECT COUNT(*) as count FROM leetcode_problems WHERE difficulty = 'Medium'`);

    const hardCompleted = await getOne(
      `SELECT COUNT(*) as count FROM leetcode_progress lp JOIN leetcode_problems p ON lp.problem_id = p.id WHERE lp.user_id = $1 AND lp.status = 'COMPLETED' AND p.difficulty = 'Hard'`,
      [userId]
    );
    const hardTotal = await getOne(`SELECT COUNT(*) as count FROM leetcode_problems WHERE difficulty = 'Hard'`);

    // Topic-level breakdown
    const topics = await getAll(`SELECT DISTINCT topic FROM leetcode_problems ORDER BY topic ASC`);
    const topicBreakdown = await Promise.all(
      topics.map(async (t) => {
        const tTotal = await getOne(`SELECT COUNT(*) as count FROM leetcode_problems WHERE topic = $1`, [t.topic]);
        const tCompleted = await getOne(
          `SELECT COUNT(*) as count FROM leetcode_progress lp JOIN leetcode_problems p ON lp.problem_id = p.id WHERE lp.user_id = $1 AND lp.status = 'COMPLETED' AND p.topic = $2`,
          [userId, t.topic]
        );
        const tot = parseInt(tTotal?.count || '0', 10);
        const comp = parseInt(tCompleted?.count || '0', 10);
        return {
          topic: t.topic,
          total: tot,
          completed: comp,
          percentage: tot > 0 ? Math.round((comp / tot) * 100) : 0,
        };
      })
    );

    return res.json({
      total,
      completed,
      pending,
      percentage,
      difficulty: {
        easy: { completed: parseInt(easyCompleted?.count || '0', 10), total: parseInt(easyTotal?.count || '0', 10) },
        medium: { completed: parseInt(mediumCompleted?.count || '0', 10), total: parseInt(mediumTotal?.count || '0', 10) },
        hard: { completed: parseInt(hardCompleted?.count || '0', 10), total: parseInt(hardTotal?.count || '0', 10) },
      },
      topicBreakdown,
    });
  } catch (error: any) {
    console.error('getLeetcodeStats error:', error);
    return res.status(500).json({ error: 'Failed to calculate LeetCode stats.' });
  }
}

export async function addLeetcodeProblem(req: AuthRequest, res: Response) {
  try {
    const {
      leetcode_number,
      title,
      difficulty,
      topic,
      subtopic,
      week_id,
      related_day_id,
      url,
      solution_approach,
      time_complexity,
      space_complexity,
      notes,
    } = req.body;

    if (!leetcode_number || !title || !difficulty || !topic) {
      return res.status(400).json({ error: 'Number, title, difficulty, and topic are required.' });
    }

    const existing = await getOne(`SELECT id FROM leetcode_problems WHERE leetcode_number = $1`, [leetcode_number]);
    if (existing) {
      return res.status(400).json({ error: `LeetCode #${leetcode_number} already exists.` });
    }

    const result = await query(
      `INSERT INTO leetcode_problems (leetcode_number, title, difficulty, topic, subtopic, week_id, related_day_id, url, solution_approach, time_complexity, space_complexity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        leetcode_number,
        title,
        difficulty,
        topic,
        subtopic || '',
        week_id || 1,
        related_day_id || null,
        url || `https://leetcode.com/problems/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
        solution_approach || '',
        time_complexity || 'O(N)',
        space_complexity || 'O(1)',
      ]
    );

    const insertedId = result.rows && result.rows[0]?.id ? result.rows[0].id : result.lastInsertRowid;
    const inserted = await getOne(`SELECT * FROM leetcode_problems WHERE id = $1`, [insertedId]);

    return res.status(201).json(inserted);
  } catch (error: any) {
    console.error('addLeetcodeProblem error:', error);
    return res.status(500).json({ error: 'Failed to add LeetCode problem.' });
  }
}

export async function toggleLeetcodeStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const problemId = parseInt(req.params.id as string, 10);
    const { status, notes } = req.body; // 'COMPLETED' or 'PENDING'

    const problem = await getOne(`SELECT * FROM leetcode_problems WHERE id = $1`, [problemId]);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Check if problem is locked
    const completedWeekRows = await getAll(
      `SELECT w.week_number
       FROM weeks w
       JOIN study_days sd ON sd.week_id = w.id
       LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1 AND dp.status = 'COMPLETED'
       GROUP BY w.id, w.week_number
       HAVING COUNT(sd.id) = COUNT(dp.id)
       ORDER BY w.week_number DESC`,
      [userId]
    );
    const highestCompletedWeek = completedWeekRows.length > 0 ? completedWeekRows[0].week_number : 0;
    const maxUnlockedWeek = Math.min(30, Math.max(11, highestCompletedWeek + 10));

    if (problem.week_id > maxUnlockedWeek) {
      return res.status(403).json({
        error: `This problem is locked. Unlocks when you reach Week ${problem.week_id - 10} (Week + 10 Learning Horizon).`,
        locked: true,
      });
    }

    const targetStatus = status || 'COMPLETED';

    await query(
      `INSERT INTO leetcode_progress (user_id, problem_id, status, notes, completed_at, updated_at)
       VALUES ($1, $2, $3, $4, CASE WHEN $3 = 'COMPLETED' THEN datetime('now') ELSE NULL END, datetime('now'))
       ON CONFLICT (user_id, problem_id) DO UPDATE SET
         status = EXCLUDED.status,
         notes = COALESCE(EXCLUDED.notes, leetcode_progress.notes),
         completed_at = CASE WHEN EXCLUDED.status = 'COMPLETED' THEN datetime('now') ELSE NULL END,
         updated_at = datetime('now')`,
      [userId, problemId, targetStatus, notes || null]
    );

    return res.json({
      message: `LeetCode problem marked as ${targetStatus}`,
      problemId,
      status: targetStatus,
    });
  } catch (error: any) {
    console.error('toggleLeetcodeStatus error:', error);
    return res.status(500).json({ error: 'Failed to update problem status.' });
  }
}
