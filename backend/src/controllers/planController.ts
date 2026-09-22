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


export async function getTracks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const tracks = await getAll(`SELECT * FROM tracks ORDER BY id ASC`);

    let previousTracksCompleted = true;
    let activeDomainId = tracks.length > 0 ? tracks[0].id : 'dsa';

    const enrichedTracks = await Promise.all(
      tracks.map(async (t, index) => {
        const totalDaysRow = await getOne(`SELECT COUNT(*) as count FROM study_days WHERE track_id = $1`, [t.id]);
        const completedDaysRow = await getOne(
          `SELECT COUNT(DISTINCT dp.day_id) as count
           FROM day_progress dp
           JOIN study_days sd ON dp.day_id = sd.id
           WHERE dp.user_id = $1 AND dp.status = 'COMPLETED' AND sd.track_id = $2`,
          [userId, t.id]
        );

        const totalWeeksRow = await getOne(`SELECT COUNT(*) as count FROM weeks WHERE track_id = $1`, [t.id]);
        const completedWeeksRow = await getOne(
          `SELECT COUNT(DISTINCT wp.week_id) as count
           FROM week_progress wp
           JOIN weeks w ON wp.week_id = w.id
           WHERE wp.user_id = $1 AND wp.status = 'COMPLETED' AND w.track_id = $2`,
          [userId, t.id]
        );

        const total = parseInt(totalDaysRow?.count || '0', 10);
        const completed = parseInt(completedDaysRow?.count || '0', 10);
        const pending = total - completed;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        const totalWeeks = parseInt(totalWeeksRow?.count || '0', 10);
        const completedWeeks = parseInt(completedWeeksRow?.count || '0', 10);
        const pendingWeeks = totalWeeks - completedWeeks;

        // Domain Lock Rule: Track is unlocked if index === 0 OR previous tracks were 100% completed
        const isLocked = index > 0 && !previousTracksCompleted;
        const lockReason = isLocked
          ? `Complete ${tracks[index - 1].name} (100%) to unlock this domain`
          : undefined;

        if (pct < 100 && previousTracksCompleted && activeDomainId === tracks[0].id && index > 0) {
          activeDomainId = t.id;
        }

        if (pct < 100) {
          previousTracksCompleted = false;
        }

        return {
          ...t,
          totalDays: total,
          completedDays: completed,
          pendingDays: pending,
          progress: pct,
          totalWeeks,
          completedWeeks,
          pendingWeeks,
          is_locked: isLocked,
          lock_reason: lockReason,
          is_active: t.id === activeDomainId,
        };
      })
    );

    return res.json(enrichedTracks);
  } catch (error: any) {
    console.error('getTracks error:', error);
    return res.status(500).json({ error: 'Failed to fetch tracks.' });
  }
}

export async function getWeeks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const { trackId } = req.query;

    let sql = `SELECT w.*, t.name as track_name, t.color as track_color, t.icon as track_icon
               FROM weeks w
               JOIN tracks t ON w.track_id = t.id`;
    const params: any[] = [];

    if (trackId) {
      sql += ` WHERE w.track_id = $1`;
      params.push(trackId);
    }
    sql += ` ORDER BY w.week_number ASC`;

    const weeks = await getAll(sql, params);

    const user = await getOne(`SELECT start_date FROM users WHERE id = $1`, [userId]);
    const startDate = parseDateOnly(user?.start_date);

    // Compute highest completed week and max unlocked week (Week + 10 Rule)
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

    const enriched = await Promise.all(
      weeks.map(async (w) => {
        const totalDaysRow = await getOne(`SELECT COUNT(*) as count FROM study_days WHERE week_id = $1`, [w.id]);
        const completedDaysRow = await getOne(
          `SELECT COUNT(DISTINCT dp.day_id) as count
           FROM day_progress dp
           JOIN study_days sd ON dp.day_id = sd.id
           WHERE dp.user_id = $1 AND dp.status = 'COMPLETED' AND sd.week_id = $2`,
          [userId, w.id]
        );

        const customWeekProgress = await getOne(
          `SELECT status FROM week_progress WHERE user_id = $1 AND week_id = $2`,
          [userId, w.id]
        );

        const total = parseInt(totalDaysRow?.count || '0', 10);
        const completed = parseInt(completedDaysRow?.count || '0', 10);
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const status = customWeekProgress?.status || (completed === total && total > 0 ? 'COMPLETED' : 'PENDING');

        // Calculate calendar dates for week
        const minDayRow = await getOne(`SELECT MIN(day_number) as min_day, MAX(day_number) as max_day FROM study_days WHERE week_id = $1`, [w.id]);
        const minDay = minDayRow?.min_day || ((w.week_number - 1) * 7 + 1);
        const maxDay = minDayRow?.max_day || Math.min(200, (w.week_number - 1) * 7 + total);
        const weekStartDate = addDays(startDate, minDay - 1);
        const weekEndDate = addDays(startDate, maxDay - 1);

        const isLocked = w.week_number > maxUnlockedWeek;
        const lockReason = isLocked
          ? `Unlocks when you reach Week ${w.week_number - 10} (Week + 10 Learning Horizon)`
          : undefined;

        return {
          ...w,
          totalDays: total,
          completedDays: completed,
          percentage: pct,
          status,
          startDate: toIsoDateStr(weekStartDate),
          endDate: toIsoDateStr(weekEndDate),
          formattedDateRange: `${formatReadableDate(weekStartDate)} – ${formatReadableDate(weekEndDate)}`,
          is_locked: isLocked,
          lock_reason: lockReason,
          max_unlocked_week: maxUnlockedWeek,
        };
      })
    );

    return res.json(enriched);
  } catch (error: any) {
    console.error('getWeeks error:', error);
    return res.status(500).json({ error: 'Failed to fetch weeks.' });
  }
}

export async function getWeekDetail(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const weekId = parseInt(req.params.weekId as string, 10);

    const week = await getOne(
      `SELECT w.*, t.name as track_name, t.color as track_color
       FROM weeks w
       JOIN tracks t ON w.track_id = t.id
       WHERE w.id = $1`,
      [weekId]
    );

    if (!week) {
      return res.status(404).json({ error: 'Week not found' });
    }

    const user = await getOne(`SELECT start_date FROM users WHERE id = $1`, [userId]);
    const startDate = parseDateOnly(user?.start_date);

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
    const isWeekLocked = week.week_number > maxUnlockedWeek;

    const days = await getAll(
      `SELECT sd.*, COALESCE(dp.status, 'PENDING') as status, dp.completed_at
       FROM study_days sd
       LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1
       WHERE sd.week_id = $2
       ORDER BY sd.day_number ASC`,
      [userId, weekId]
    );

    const enrichedDays = await Promise.all(
      days.map(async (d) => {
        const totalTasksRow = await getOne(`SELECT COUNT(*) as count FROM study_tasks WHERE day_id = $1`, [d.id]);
        const completedTasksRow = await getOne(
          `SELECT COUNT(*) as count
           FROM study_progress sp
           JOIN study_tasks st ON sp.task_id = st.id
           WHERE sp.user_id = $1 AND sp.status = 'COMPLETED' AND st.day_id = $2`,
          [userId, d.id]
        );

        const totalTasks = parseInt(totalTasksRow?.count || '0', 10);
        const completedTasks = parseInt(completedTasksRow?.count || '0', 10);
        const dayDate = addDays(startDate, d.day_number - 1);

        return {
          ...d,
          totalTasks,
          completedTasks,
          progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          scheduledDate: toIsoDateStr(dayDate),
          formattedDate: formatReadableDate(dayDate),
          is_locked: isWeekLocked,
        };
      })
    );

    const totalDays = enrichedDays.length;
    const completedDays = enrichedDays.filter((d) => d.status === 'COMPLETED').length;
    const weekStatus = completedDays === totalDays && totalDays > 0 ? 'COMPLETED' : 'PENDING';

    const minDay = enrichedDays.length > 0 ? enrichedDays[0].day_number : 1;
    const maxDay = enrichedDays.length > 0 ? enrichedDays[enrichedDays.length - 1].day_number : 7;
    const weekStartDate = addDays(startDate, minDay - 1);
    const weekEndDate = addDays(startDate, maxDay - 1);

    return res.json({
      week: {
        ...week,
        totalDays,
        completedDays,
        progress: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
        status: weekStatus,
        startDate: toIsoDateStr(weekStartDate),
        endDate: toIsoDateStr(weekEndDate),
        formattedDateRange: `${formatReadableDate(weekStartDate)} – ${formatReadableDate(weekEndDate)}`,
        is_locked: isWeekLocked,
        lock_reason: isWeekLocked ? `Unlocks when you reach Week ${week.week_number - 10}` : undefined,
        max_unlocked_week: maxUnlockedWeek,
      },
      days: enrichedDays,
    });
  } catch (error: any) {
    console.error('getWeekDetail error:', error);
    return res.status(500).json({ error: 'Failed to fetch week details.' });
  }
}

export async function getDays(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const { trackId, weekId, status, search, page = 1, limit = 50 } = req.query;

    let sql = `SELECT sd.*, t.name as track_name, t.color as track_color,
                      w.week_number, COALESCE(dp.status, 'PENDING') as status, dp.completed_at
               FROM study_days sd
               JOIN tracks t ON sd.track_id = t.id
               JOIN weeks w ON sd.week_id = w.id
               LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1
               WHERE 1=1`;
    const params: any[] = [userId];

    if (trackId) {
      params.push(trackId);
      sql += ` AND sd.track_id = $${params.length}`;
    }
    if (weekId) {
      params.push(weekId);
      sql += ` AND sd.week_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND COALESCE(dp.status, 'PENDING') = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (sd.title LIKE $${params.length} OR sd.topic LIKE $${params.length} OR sd.overview LIKE $${params.length})`;
    }

    sql += ` ORDER BY sd.day_number ASC`;

    const allMatching = await getAll(sql, params);
    const total = allMatching.length;
    const p = Math.max(1, parseInt(page as string, 10) || 1);
    const l = Math.max(1, parseInt(limit as string, 10) || 50);
    const paginated = allMatching.slice((p - 1) * l, p * l);

    const user = await getOne(`SELECT start_date FROM users WHERE id = $1`, [userId]);
    const startDate = parseDateOnly(user?.start_date);

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

    const enrichedDays = paginated.map((d: any) => {
      const dayDate = addDays(startDate, d.day_number - 1);
      const isDayLocked = d.week_number > maxUnlockedWeek;
      return {
        ...d,
        scheduledDate: toIsoDateStr(dayDate),
        formattedDate: formatReadableDate(dayDate),
        is_locked: isDayLocked,
        lock_reason: isDayLocked ? `Unlocks when you reach Week ${d.week_number - 10}` : undefined,
      };
    });

    return res.json({
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
      days: enrichedDays,
    });

  } catch (error: any) {
    console.error('getDays error:', error);
    return res.status(500).json({ error: 'Failed to fetch study days.' });
  }
}

export async function getDayDetail(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const dayNumber = parseInt(req.params.dayNumber as string, 10);

    const day = await getOne(
      `SELECT sd.*, t.name as track_name, t.color as track_color, t.icon as track_icon,
              w.week_number, w.title as week_title,
              COALESCE(dp.status, 'PENDING') as status, dp.completed_at, dp.reflection
       FROM study_days sd
       JOIN tracks t ON sd.track_id = t.id
       JOIN weeks w ON sd.week_id = w.id
       LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1
       WHERE sd.day_number = $2`,
      [userId, dayNumber]
    );

    if (!day) {
      return res.status(404).json({ error: 'Study day not found' });
    }

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
    const isDayLocked = day.week_number > maxUnlockedWeek;
    day.is_locked = isDayLocked;
    if (isDayLocked) {
      day.lock_reason = `Unlocks when you reach Week ${day.week_number - 10} (Week + 10 Learning Horizon)`;
    }

    // Parse JSON fields
    try {
      day.learning_objectives = typeof day.learning_objectives === 'string' ? JSON.parse(day.learning_objectives) : day.learning_objectives;
      day.checklist = typeof day.checklist === 'string' ? JSON.parse(day.checklist) : day.checklist;
      day.reflection = typeof day.reflection === 'string' ? JSON.parse(day.reflection) : day.reflection;
    } catch (e) {
      // Keep as is if already parsed
    }

    // Enrich day with exact calendar date based on user start_date
    const user = await getOne(`SELECT start_date FROM users WHERE id = $1`, [userId]);
    const startDate = parseDateOnly(user?.start_date);
    const dayDate = addDays(startDate, day.day_number - 1);
    day.scheduledDate = toIsoDateStr(dayDate);
    day.formattedDate = formatReadableDate(dayDate);

    // Fetch all dedicated tasks for this day with their completion and revision states

    const tasks = await getAll(
      `SELECT st.*,
              COALESCE(sp.status, 'PENDING') as status,
              COALESCE(sp.revision_status, 'NOT_REVIEWED') as revision_status,
              sp.completed_at,
              (SELECT sn.content FROM study_notes sn WHERE sn.task_id = st.id AND sn.user_id = $1 ORDER BY sn.id DESC LIMIT 1) as user_notes
       FROM study_tasks st
       LEFT JOIN study_progress sp ON st.id = sp.task_id AND sp.user_id = $1
       WHERE st.day_id = $2
       ORDER BY st.task_number ASC`,
      [userId, day.id]
    );

    // Fetch related LeetCode problems
    const relatedLeetCode = await getAll(
      `SELECT lp.*, COALESCE(lkp.status, 'PENDING') as status, lkp.notes as user_notes
       FROM leetcode_problems lp
       LEFT JOIN leetcode_progress lkp ON lp.id = lkp.problem_id AND lkp.user_id = $1
       WHERE lp.week_id = $2 OR lp.related_day_id = $3
       ORDER BY lp.leetcode_number ASC`,
      [userId, day.week_id, day.id]
    );

    const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
    
    // Auto-sync status if all tasks are completed
    if (tasks.length > 0 && completedTasksCount === tasks.length && day.status !== 'COMPLETED') {
      day.status = 'COMPLETED';
    }

    return res.json({
      day,
      tasks,
      relatedLeetCode,
      totalTasks: tasks.length,
      completedTasks: completedTasksCount,
      progress,
    });
  } catch (error: any) {
    console.error('getDayDetail error:', error);
    return res.status(500).json({ error: 'Failed to fetch day details.' });
  }
}

export async function toggleDayStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const dayId = parseInt(req.params.id as string, 10);
    const { status } = req.body; // 'COMPLETED' or 'PENDING'

    // Check if day belongs to a locked week
    const dayInfo = await getOne(
      `SELECT sd.id, sd.week_id, w.week_number
       FROM study_days sd
       JOIN weeks w ON sd.week_id = w.id
       WHERE sd.id = $1`,
      [dayId]
    );

    if (!dayInfo) {
      return res.status(404).json({ error: 'Day not found' });
    }

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

    if (dayInfo.week_number > maxUnlockedWeek) {
      return res.status(403).json({
        error: `Cannot complete a locked day. Unlocks when you reach Week ${dayInfo.week_number - 10}.`,
        locked: true,
      });
    }

    const targetStatus = status || 'COMPLETED';

    await query(
      `INSERT INTO day_progress (user_id, day_id, status, completed_at, updated_at)
       VALUES ($1, $2, $3, CASE WHEN $3 = 'COMPLETED' THEN datetime('now') ELSE NULL END, datetime('now'))
       ON CONFLICT (user_id, day_id) DO UPDATE SET
         status = EXCLUDED.status,
         completed_at = EXCLUDED.completed_at,
         updated_at = datetime('now')`,
      [userId, dayId, targetStatus]
    );

    // Keep all child tasks in sync with the day status
    const dayTasks = await getAll(`SELECT id FROM study_tasks WHERE day_id = $1`, [dayId]);
    for (const t of dayTasks) {
      await query(
        `INSERT INTO study_progress (user_id, task_id, status, completed_at, updated_at)
         VALUES ($1, $2, $3, CASE WHEN $3 = 'COMPLETED' THEN datetime('now') ELSE NULL END, datetime('now'))
         ON CONFLICT (user_id, task_id) DO UPDATE SET
           status = EXCLUDED.status,
           completed_at = EXCLUDED.completed_at,
           updated_at = datetime('now')`,
        [userId, t.id, targetStatus]
      );
    }

    return res.json({
      message: `Day marked as ${targetStatus}`,
      dayId,
      status: targetStatus,
    });
  } catch (error: any) {
    console.error('toggleDayStatus error:', error);
    return res.status(500).json({ error: 'Failed to update day status.' });
  }
}


export async function toggleWeekStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const weekId = parseInt(req.params.weekId as string, 10);
    const { status } = req.body;

    const weekInfo = await getOne(`SELECT * FROM weeks WHERE id = $1`, [weekId]);
    if (!weekInfo) {
      return res.status(404).json({ error: 'Week not found' });
    }

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

    if (weekInfo.week_number > maxUnlockedWeek) {
      return res.status(403).json({
        error: `Cannot complete a locked week. Unlocks when you reach Week ${weekInfo.week_number - 10}.`,
        locked: true,
      });
    }

    const targetStatus = status || 'COMPLETED';

    await query(
      `INSERT INTO week_progress (user_id, week_id, status, updated_at)
       VALUES ($1, $2, $3, datetime('now'))
       ON CONFLICT (user_id, week_id) DO UPDATE SET
         status = EXCLUDED.status,
         updated_at = datetime('now')`,
      [userId, weekId, targetStatus]
    );

    return res.json({ message: `Week marked as ${targetStatus}`, weekId, status: targetStatus });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update week status.' });
  }
}

export async function saveDayReflection(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const dayId = parseInt(req.params.id as string, 10);
    const { reflection } = req.body;

    await query(
      `INSERT INTO day_progress (user_id, day_id, reflection, updated_at)
       VALUES ($1, $2, $3, datetime('now'))
       ON CONFLICT (user_id, day_id) DO UPDATE SET
         reflection = EXCLUDED.reflection,
         updated_at = datetime('now')`,
      [userId, dayId, JSON.stringify(reflection)]
    );

    return res.json({ message: 'Reflection saved successfully', dayId, reflection });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to save reflection.' });
  }
}

export async function getRevisionItems(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const { status } = req.query; // 'ALL', 'NEEDS_REVISION', 'MASTERED'

    let sql = `SELECT st.id as task_id, st.task_number, st.title as task_title, st.difficulty,
                      sd.id as day_id, sd.day_number, sd.title as day_title, sd.topic, sd.track_id,
                      t.name as track_name, t.color as track_color,
                      COALESCE(sp.revision_status, 'NOT_REVIEWED') as revision_status,
                      COALESCE(sp.status, 'PENDING') as task_status,
                      sp.notes as user_notes,
                      sp.updated_at
               FROM study_progress sp
               JOIN study_tasks st ON sp.task_id = st.id
               JOIN study_days sd ON st.day_id = sd.id
               JOIN tracks t ON sd.track_id = t.id
               WHERE sp.user_id = $1`;
    const params: any[] = [userId];

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND sp.revision_status = $${params.length}`;
    } else {
      sql += ` AND (sp.revision_status IN ('NEEDS_REVISION', 'MASTERED') OR sp.status = 'COMPLETED')`;
    }

    sql += ` ORDER BY sp.updated_at DESC`;

    const items = await getAll(sql, params);
    return res.json(items);
  } catch (error: any) {
    console.error('getRevisionItems error:', error);
    return res.status(500).json({ error: 'Failed to fetch revision items.' });
  }
}

