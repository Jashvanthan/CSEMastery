import { Response } from 'express';
import { query, getOne, getAll } from '../db';
import { AuthRequest } from '../middleware/auth';

function parseDateOnly(dateStr?: string | null): Date {
  if (!dateStr) {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
  }
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function toIsoDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatReadableDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export async function getTaskDetail(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const taskId = parseInt(req.params.taskId as string, 10);

    const task = await getOne(
      `SELECT st.*,
              sd.day_number, sd.title as day_title, sd.topic as day_topic,
              w.id as week_id, w.week_number, w.title as week_title,
              t.name as track_name, t.color as track_color,
              COALESCE(sp.status, 'PENDING') as status,
              COALESCE(sp.revision_status, 'NOT_REVIEWED') as revision_status,
              sp.completed_at,
              (SELECT sn.content FROM study_notes sn WHERE sn.task_id = st.id AND sn.user_id = $1 ORDER BY sn.id DESC LIMIT 1) as user_notes
       FROM study_tasks st
       JOIN study_days sd ON st.day_id = sd.id
       JOIN weeks w ON sd.week_id = w.id
       JOIN tracks t ON sd.track_id = t.id
       LEFT JOIN study_progress sp ON st.id = sp.task_id AND sp.user_id = $1
       WHERE st.id = $2`,
      [userId, taskId]
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    try {
      task.checklist = typeof task.checklist === 'string' ? JSON.parse(task.checklist) : task.checklist;
    } catch (e) {
      // ignore
    }

    const user = await getOne(`SELECT start_date FROM users WHERE id = $1`, [userId]);
    const startDate = parseDateOnly(user?.start_date);
    const dayDate = addDays(startDate, task.day_number - 1);
    task.scheduledDate = toIsoDateStr(dayDate);
    task.formattedDate = formatReadableDate(dayDate);

    // Previous Task and Next Task for sequential task navigation
    const prevTask = await getOne(
      `SELECT id, task_number, title FROM study_tasks
       WHERE (day_id = $1 AND task_number < $2) OR (day_id < $1)
       ORDER BY day_id DESC, task_number DESC
       LIMIT 1`,
      [task.day_id, task.task_number]
    );

    const nextTask = await getOne(
      `SELECT id, task_number, title FROM study_tasks
       WHERE (day_id = $1 AND task_number > $2) OR (day_id > $1)
       ORDER BY day_id ASC, task_number ASC
       LIMIT 1`,
      [task.day_id, task.task_number]
    );

    // Parent day progress (e.g. 3/5 tasks completed)
    const allDayTasks = await getAll(
      `SELECT st.id, st.task_number, st.title, COALESCE(sp.status, 'PENDING') as status
       FROM study_tasks st
       LEFT JOIN study_progress sp ON st.id = sp.task_id AND sp.user_id = $1
       WHERE st.day_id = $2
       ORDER BY st.task_number ASC`,
      [userId, task.day_id]
    );

    const completedDayTasks = allDayTasks.filter((t) => t.status === 'COMPLETED').length;

    // Related LeetCode problems
    const relatedLeetCode = await getAll(
      `SELECT lp.*, COALESCE(lkp.status, 'PENDING') as status
       FROM leetcode_problems lp
       LEFT JOIN leetcode_progress lkp ON lp.id = lkp.problem_id AND lkp.user_id = $1
       WHERE lp.related_task_id = $2 OR lp.week_id = $3
       LIMIT 5`,
      [userId, taskId, task.week_id]
    );

    return res.json({
      task,
      navigation: {
        prevTask,
        nextTask,
        dayId: task.day_id,
        dayNumber: task.day_number,
      },
      dayProgress: {
        totalTasks: allDayTasks.length,
        completedTasks: completedDayTasks,
        progress: allDayTasks.length > 0 ? Math.round((completedDayTasks / allDayTasks.length) * 100) : 0,
        tasks: allDayTasks,
      },
      relatedLeetCode,
    });
  } catch (error: any) {
    console.error('getTaskDetail error:', error);
    return res.status(500).json({ error: 'Failed to fetch task study details.' });
  }
}

export async function updateTaskStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const taskId = parseInt(req.params.taskId as string, 10);
    const { status, revisionStatus, notes } = req.body; // 'COMPLETED' or 'PENDING'

    const targetStatus = status || 'COMPLETED';

    await query(
      `INSERT INTO study_progress (user_id, task_id, status, revision_status, notes, completed_at, updated_at)
       VALUES ($1, $2, $3, COALESCE($4, 'NOT_REVIEWED'), $5,
               CASE WHEN $3 = 'COMPLETED' THEN datetime('now') ELSE NULL END, datetime('now'))
       ON CONFLICT (user_id, task_id) DO UPDATE SET
         status = EXCLUDED.status,
         revision_status = COALESCE(EXCLUDED.revision_status, study_progress.revision_status),
         notes = COALESCE(EXCLUDED.notes, study_progress.notes),
         completed_at = CASE WHEN EXCLUDED.status = 'COMPLETED' THEN datetime('now') ELSE NULL END,
         updated_at = datetime('now')`,
      [userId, taskId, targetStatus, revisionStatus || null, notes || null]
    );

    // Save notes if provided
    if (notes !== undefined) {
      await query(
        `INSERT INTO study_notes (user_id, task_id, content, updated_at)
         VALUES ($1, $2, $3, datetime('now'))`,
        [userId, taskId, notes]
      );
    }

    // Check if all mandatory tasks of the parent day are now completed
    const taskInfo = await getOne(`SELECT day_id FROM study_tasks WHERE id = $1`, [taskId]);
    if (taskInfo) {
      const dayTasks = await getAll(
        `SELECT st.id, COALESCE(sp.status, 'PENDING') as status
         FROM study_tasks st
         LEFT JOIN study_progress sp ON st.id = sp.task_id AND sp.user_id = $1
         WHERE st.day_id = $2`,
        [userId, taskInfo.day_id]
      );

      const allCompleted = dayTasks.every((t) => t.status === 'COMPLETED');
      if (allCompleted) {
        await query(
          `INSERT INTO day_progress (user_id, day_id, status, completed_at, updated_at)
           VALUES ($1, $2, 'COMPLETED', datetime('now'), datetime('now'))
           ON CONFLICT (user_id, day_id) DO UPDATE SET
             status = 'COMPLETED',
             completed_at = datetime('now'),
             updated_at = datetime('now')`,
          [userId, taskInfo.day_id]
        );
      } else {
        await query(
          `UPDATE day_progress
           SET status = 'PENDING', completed_at = NULL, updated_at = datetime('now')
           WHERE user_id = $1 AND day_id = $2 AND status = 'COMPLETED'`,
          [userId, taskInfo.day_id]
        );
      }
    }

    return res.json({
      message: `Task marked as ${targetStatus}`,
      taskId,
      status: targetStatus,
    });
  } catch (error: any) {
    console.error('updateTaskStatus error:', error);
    return res.status(500).json({ error: 'Failed to update task status.' });
  }
}

export async function updateRevisionStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const taskId = parseInt(req.params.taskId as string, 10);
    const { revisionStatus } = req.body; // 'NOT_REVIEWED', 'NEEDS_REVISION', 'MASTERED'

    await query(
      `INSERT INTO study_progress (user_id, task_id, revision_status, updated_at)
       VALUES ($1, $2, $3, datetime('now'))
       ON CONFLICT (user_id, task_id) DO UPDATE SET
         revision_status = $3,
         updated_at = datetime('now')`,
      [userId, taskId, revisionStatus]
    );

    return res.json({ message: 'Revision status updated', taskId, revisionStatus });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update revision status.' });
  }
}
