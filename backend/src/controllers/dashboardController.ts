import { Response } from 'express';
import { query, getOne, getAll } from '../db';
import { AuthRequest } from '../middleware/auth';

// Date Helpers for accurate curriculum calendar calculations
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

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;

    // 1. Fetch user information for Start Date calculation
    const user = await getOne(`SELECT start_date FROM users WHERE id = $1`, [userId]);
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const startDateStr = user?.start_date || toIsoDateStr(todayUtc);
    const startDate = parseDateOnly(startDateStr);

    // Exact calendar days difference from start date
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((todayUtc.getTime() - startDate.getTime()) / msPerDay);
    
    // Day 1 corresponds to diffDays === 0
    const rawDayNumber = diffDays + 1;
    const isStarted = rawDayNumber >= 1;
    const isFinished = rawDayNumber > 200;

    // Curriculum current day and week indices
    const currentDayNumber = Math.max(1, Math.min(200, rawDayNumber));
    const currentWeekNumber = Math.min(30, Math.floor((currentDayNumber - 1) / 7) + 1);

    // Curriculum dates mapping
    const targetEndDate = addDays(startDate, 199);
    const todayCalendarDate = formatReadableDate(todayUtc);
    const formattedStartDate = formatReadableDate(startDate);
    const formattedTargetEndDate = formatReadableDate(targetEndDate);

    // 2. Day & Task completion metrics
    const totalDays = 200;
    const completedDaysRow = await getOne(
      `SELECT COUNT(DISTINCT day_id) as count FROM day_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    );
    const completedDays = parseInt(completedDaysRow?.count || '0', 10);
    const pendingDays = totalDays - completedDays;
    const progressPercentage = Math.round((completedDays / totalDays) * 100);

    const totalTasksRow = await getOne(`SELECT COUNT(*) as count FROM study_tasks`);
    const totalTasks = parseInt(totalTasksRow?.count || '1000', 10);

    const completedTasksRow = await getOne(
      `SELECT COUNT(*) as count FROM study_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    );
    const completedTasks = parseInt(completedTasksRow?.count || '0', 10);

    // 3. Pending Until Today (Overdue) calculation - DO NOT penalize future days
    const expectedDaysUpToToday = isStarted ? Math.min(200, rawDayNumber) : 0;
    const completedUntilTodayRow = await getOne(
      `SELECT COUNT(DISTINCT dp.day_id) as count
       FROM day_progress dp
       JOIN study_days sd ON dp.day_id = sd.id
       WHERE dp.user_id = $1 AND dp.status = 'COMPLETED' AND sd.day_number <= $2`,
      [userId, expectedDaysUpToToday]
    );
    const completedScheduledUpToToday = parseInt(completedUntilTodayRow?.count || '0', 10);
    const pendingUntilToday = isStarted
      ? Math.max(0, expectedDaysUpToToday - completedScheduledUpToToday)
      : 0;

    // Schedule Pace: comparing actual completed days vs expected day by calendar
    const scheduleDiff = completedDays - expectedDaysUpToToday;
    let scheduleStatus: 'AHEAD' | 'ON_TRACK' | 'BEHIND' | 'UPCOMING' = 'ON_TRACK';
    let paceMessage = 'Perfectly on schedule with calendar pace';

    if (!isStarted) {
      scheduleStatus = 'UPCOMING';
      paceMessage = `Curriculum starts in ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} on ${formattedStartDate}`;
    } else if (scheduleDiff > 0) {
      scheduleStatus = 'AHEAD';
      paceMessage = `${scheduleDiff} day${scheduleDiff > 1 ? 's' : ''} ahead of calendar pace`;
    } else if (scheduleDiff < 0) {
      scheduleStatus = 'BEHIND';
      paceMessage = `${Math.abs(scheduleDiff)} day${Math.abs(scheduleDiff) > 1 ? 's' : ''} behind calendar pace`;
    }

    // Earliest incomplete day
    const nextIncompleteDayRow = await getOne(
      `SELECT sd.day_number
       FROM study_days sd
       LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1 AND dp.status = 'COMPLETED'
       WHERE dp.id IS NULL
       ORDER BY sd.day_number ASC
       LIMIT 1`,
      [userId]
    );
    const nextIncompleteDayNumber = nextIncompleteDayRow ? nextIncompleteDayRow.day_number : (isFinished ? 200 : currentDayNumber);


    // 4. Topic-level metrics
    const allTopics = await getAll(`SELECT DISTINCT topic FROM study_days`);
    const totalTopicsCount = allTopics.length;

    // A topic is considered completed if all days within that topic are completed
    const completedTopicsList = await getAll(
      `SELECT sd.topic
       FROM study_days sd
       LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1 AND dp.status = 'COMPLETED'
       GROUP BY sd.topic
       HAVING COUNT(sd.id) = COUNT(dp.id)`,
      [userId]
    );
    const completedTopicsCount = completedTopicsList.length;
    const pendingTopicsCount = totalTopicsCount - completedTopicsCount;

    // 5. Week-level metrics
    const totalWeeks = 30;
    const completedWeeksList = await getAll(
      `SELECT w.id
       FROM weeks w
       JOIN study_days sd ON sd.week_id = w.id
       LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1 AND dp.status = 'COMPLETED'
       GROUP BY w.id
       HAVING COUNT(sd.id) = COUNT(dp.id)`,
      [userId]
    );
    const completedWeeksCount = completedWeeksList.length;
    const pendingWeeksCount = totalWeeks - completedWeeksCount;

    // 6. Today's Learning information & Next Actionable Day
    const todayDay = await getOne(
      `SELECT sd.id, sd.day_number, sd.week_id, sd.track_id, sd.title, sd.topic, sd.overview, sd.estimated_minutes,
              COALESCE(dp.status, 'PENDING') as status
       FROM study_days sd
       LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1
       WHERE sd.day_number = $2`,
      [userId, currentDayNumber]
    );
    if (todayDay) {
      const dDate = addDays(startDate, todayDay.day_number - 1);
      todayDay.scheduledDate = toIsoDateStr(dDate);
      todayDay.formattedDate = formatReadableDate(dDate);

      // Fetch today's study tasks and their progress
      const todayTasks = await getAll(
        `SELECT st.id, st.day_id, st.task_number, st.title, st.estimated_minutes,
                COALESCE(sp.status, 'PENDING') as status,
                COALESCE(sp.revision_status, 'NOT_REVIEWED') as revision_status
         FROM study_tasks st
         LEFT JOIN study_progress sp ON st.id = sp.task_id AND sp.user_id = $1
         WHERE st.day_id = $2
         ORDER BY st.task_number ASC`,
        [userId, todayDay.id]
      );
      const todayCompletedTasks = todayTasks.filter((t) => t.status === 'COMPLETED').length;
      todayDay.tasks = todayTasks;
      todayDay.totalTasks = todayTasks.length;
      todayDay.completedTasks = todayCompletedTasks;
      todayDay.progress = todayTasks.length > 0 ? Math.round((todayCompletedTasks / todayTasks.length) * 100) : 0;
      if (todayTasks.length > 0 && todayCompletedTasks === todayTasks.length && todayDay.status !== 'COMPLETED') {
        todayDay.status = 'COMPLETED';
      }
    }

    const nextDay = await getOne(
      `SELECT sd.id, sd.day_number, sd.week_id, sd.track_id, sd.title, sd.topic, sd.overview, sd.estimated_minutes,
              COALESCE(dp.status, 'PENDING') as status
       FROM study_days sd
       LEFT JOIN day_progress dp ON sd.id = dp.day_id AND dp.user_id = $1
       WHERE sd.day_number = $2`,
      [userId, nextIncompleteDayNumber]
    );
    if (nextDay) {
      const nDate = addDays(startDate, nextDay.day_number - 1);
      nextDay.scheduledDate = toIsoDateStr(nDate);
      nextDay.formattedDate = formatReadableDate(nDate);

      const nextTasks = await getAll(
        `SELECT st.id, st.day_id, st.task_number, st.title, st.estimated_minutes,
                COALESCE(sp.status, 'PENDING') as status,
                COALESCE(sp.revision_status, 'NOT_REVIEWED') as revision_status
         FROM study_tasks st
         LEFT JOIN study_progress sp ON st.id = sp.task_id AND sp.user_id = $1
         WHERE st.day_id = $2
         ORDER BY st.task_number ASC`,
        [userId, nextDay.id]
      );
      const nextCompletedTasks = nextTasks.filter((t) => t.status === 'COMPLETED').length;
      nextDay.tasks = nextTasks;
      nextDay.totalTasks = nextTasks.length;
      nextDay.completedTasks = nextCompletedTasks;
      nextDay.progress = nextTasks.length > 0 ? Math.round((nextCompletedTasks / nextTasks.length) * 100) : 0;
    }


    // 7. Track progress breakdown
    const tracks = await getAll(`SELECT * FROM tracks`);
    const trackProgress = await Promise.all(
      tracks.map(async (t) => {
        const totalDaysInTrack = await getOne(
          `SELECT COUNT(*) as count FROM study_days WHERE track_id = $1`,
          [t.id]
        );
        const completedDaysInTrack = await getOne(
          `SELECT COUNT(DISTINCT dp.day_id) as count
           FROM day_progress dp
           JOIN study_days sd ON dp.day_id = sd.id
           WHERE dp.user_id = $1 AND dp.status = 'COMPLETED' AND sd.track_id = $2`,
          [userId, t.id]
        );

        const tot = parseInt(totalDaysInTrack?.count || '0', 10);
        const comp = parseInt(completedDaysInTrack?.count || '0', 10);
        const pend = tot - comp;
        const pct = tot > 0 ? Math.round((comp / tot) * 100) : 0;

        return {
          id: t.id,
          name: t.name,
          color: t.color,
          icon: t.icon,
          total: tot,
          completed: comp,
          pending: pend,
          progress: pct,
        };
      })
    );

    // 8. Weekly progress list
    const weeks = await getAll(`SELECT * FROM weeks ORDER BY week_number ASC`);
    const weekProgress = await Promise.all(
      weeks.map(async (w) => {
        const totalDaysInWeek = await getOne(
          `SELECT COUNT(*) as count FROM study_days WHERE week_id = $1`,
          [w.id]
        );
        const completedDaysInWeek = await getOne(
          `SELECT COUNT(DISTINCT dp.day_id) as count
           FROM day_progress dp
           JOIN study_days sd ON dp.day_id = sd.id
           WHERE dp.user_id = $1 AND dp.status = 'COMPLETED' AND sd.week_id = $2`,
          [userId, w.id]
        );

        const tot = parseInt(totalDaysInWeek?.count || '0', 10);
        const comp = parseInt(completedDaysInWeek?.count || '0', 10);
        const pct = tot > 0 ? Math.round((comp / tot) * 100) : 0;
        const status = comp === tot && tot > 0 ? 'COMPLETED' : comp > 0 ? 'IN_PROGRESS' : 'PENDING';

        return {
          id: w.id,
          week_number: w.week_number,
          title: w.title,
          track_id: w.track_id,
          total: tot,
          completed: comp,
          percentage: pct,
          status,
        };
      })
    );

    // 9. Streak calculation from actual completions
    const completedDates = await getAll(
      `SELECT DISTINCT date(completed_at) as cdate
       FROM day_progress
       WHERE user_id = $1 AND status = 'COMPLETED' AND completed_at IS NOT NULL
       ORDER BY cdate DESC`,
      [userId]
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (completedDates.length > 0) {
      const dates = completedDates.map((d) => new Date(d.cdate));
      // Calculate current streak
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const latest = new Date(dates[0]);
      latest.setHours(0, 0, 0, 0);

      const diffFromToday = Math.round((now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24));

      if (diffFromToday <= 1) {
        currentStreak = 1;
        for (let i = 0; i < dates.length - 1; i++) {
          const d1 = new Date(dates[i]);
          const d2 = new Date(dates[i + 1]);
          const dayGap = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
          if (dayGap === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      tempStreak = 1;
      longestStreak = 1;
      for (let i = 0; i < dates.length - 1; i++) {
        const d1 = new Date(dates[i]);
        const d2 = new Date(dates[i + 1]);
        const dayGap = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
        if (dayGap === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    // 10. LeetCode progress summary
    const totalLeetCodeRow = await getOne(`SELECT COUNT(*) as count FROM leetcode_problems`);
    const totalLeetcode = parseInt(totalLeetCodeRow?.count || '0', 10);

    const completedLeetCodeRow = await getOne(
      `SELECT COUNT(*) as count FROM leetcode_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    );
    const completedLeetcode = parseInt(completedLeetCodeRow?.count || '0', 10);
    const pendingLeetcode = totalLeetcode - completedLeetcode;
    const leetcodePercentage = totalLeetcode > 0 ? Math.round((completedLeetcode / totalLeetcode) * 100) : 0;

    const easyCompletedRow = await getOne(
      `SELECT COUNT(*) as count FROM leetcode_progress lp
       JOIN leetcode_problems p ON lp.problem_id = p.id
       WHERE lp.user_id = $1 AND lp.status = 'COMPLETED' AND p.difficulty = 'Easy'`,
      [userId]
    );
    const mediumCompletedRow = await getOne(
      `SELECT COUNT(*) as count FROM leetcode_progress lp
       JOIN leetcode_problems p ON lp.problem_id = p.id
       WHERE lp.user_id = $1 AND lp.status = 'COMPLETED' AND p.difficulty = 'Medium'`,
      [userId]
    );
    const hardCompletedRow = await getOne(
      `SELECT COUNT(*) as count FROM leetcode_progress lp
       JOIN leetcode_problems p ON lp.problem_id = p.id
       WHERE lp.user_id = $1 AND lp.status = 'COMPLETED' AND p.difficulty = 'Hard'`,
      [userId]
    );

    // 11. Revision counts
    const needsRevisionRow = await getOne(
      `SELECT COUNT(*) as count FROM study_progress WHERE user_id = $1 AND revision_status = 'NEEDS_REVISION'`,
      [userId]
    );
    const masteredRow = await getOne(
      `SELECT COUNT(*) as count FROM study_progress WHERE user_id = $1 AND revision_status = 'MASTERED'`,
      [userId]
    );

    return res.json({
      startDate: startDateStr,
      formattedStartDate,
      targetEndDate: toIsoDateStr(targetEndDate),
      formattedTargetEndDate,
      todayCalendarDate,
      daysSinceStart: diffDays,
      isStarted,
      scheduleStatus,
      scheduleDifference: scheduleDiff,
      paceMessage,
      totalDays,
      completedDays,
      pendingDays,
      progressPercentage,
      totalTasks,
      completedTasks,
      currentDay: currentDayNumber,
      currentWeek: currentWeekNumber,
      nextIncompleteDay: nextIncompleteDayNumber,
      pendingUntilToday, // Exact required overdue counter
      overallPendingDays: pendingDays,
      totalTopicsCount,
      completedTopicsCount,
      pendingTopicsCount,
      totalWeeks,
      completedWeeksCount,
      pendingWeeksCount,
      today: todayDay,
      nextDay,
      trackProgress,
      weekProgress,

      streak: {
        current: currentStreak,
        longest: longestStreak,
      },
      leetcode: {
        total: totalLeetcode,
        completed: completedLeetcode,
        pending: pendingLeetcode,
        percentage: leetcodePercentage,
        easyCompleted: parseInt(easyCompletedRow?.count || '0', 10),
        mediumCompleted: parseInt(mediumCompletedRow?.count || '0', 10),
        hardCompleted: parseInt(hardCompletedRow?.count || '0', 10),
      },
      revision: {
        needsRevision: parseInt(needsRevisionRow?.count || '0', 10),
        mastered: parseInt(masteredRow?.count || '0', 10),
      },
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to calculate dashboard statistics.' });
  }
}
