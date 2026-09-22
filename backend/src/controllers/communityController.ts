import { Request, Response } from 'express';
import { query, getOne, getAll } from '../db';
import { AuthRequest } from '../middleware/auth';

export async function getLeaderboard(req: AuthRequest, res: Response) {
  try {
    const currentUserId = req.user?.id || 1;

    // Fetch all users
    const users = await getAll(`SELECT id, email, name, start_date, created_at FROM users ORDER BY id ASC`);

    const leaderboard = await Promise.all(
      users.map(async (u) => {
        // Completed days
        const completedDaysRow = await getOne(
          `SELECT COUNT(DISTINCT day_id) as count FROM day_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
          [u.id]
        );
        const completedDays = parseInt(completedDaysRow?.count || '0', 10);

        // Completed tasks
        const completedTasksRow = await getOne(
          `SELECT COUNT(DISTINCT task_id) as count FROM study_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
          [u.id]
        );
        const completedTasks = parseInt(completedTasksRow?.count || '0', 10);

        // Mastered revision tasks
        const masteredTasksRow = await getOne(
          `SELECT COUNT(DISTINCT task_id) as count FROM study_progress WHERE user_id = $1 AND revision_status = 'MASTERED'`,
          [u.id]
        );
        const masteredTasks = parseInt(masteredTasksRow?.count || '0', 10);

        // Solved LeetCode
        const solvedLeetCodeRow = await getOne(
          `SELECT COUNT(DISTINCT problem_id) as count FROM leetcode_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
          [u.id]
        );
        const solvedLeetCode = parseInt(solvedLeetCodeRow?.count || '0', 10);

        // Notes written
        const notesRow = await getOne(
          `SELECT COUNT(*) as count FROM study_notes WHERE user_id = $1`,
          [u.id]
        );
        const notesCount = parseInt(notesRow?.count || '0', 10);

        // Calculate progress percentage over 200 days
        const progressPercentage = Math.round((completedDays / 200) * 100);

        // Calculate streak approximation
        const streak = Math.max(1, Math.min(60, Math.floor(completedDays * 1.2)));

        // Determine primary badge
        let badge = 'Novice Scholar';
        if (completedDays >= 75) badge = 'Grandmaster Scholar';
        else if (completedDays >= 35) badge = 'Senior Engineer';
        else if (completedDays >= 15) badge = 'Advanced Practitioner';
        else if (completedDays >= 5) badge = 'Dedicated Apprentice';

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          start_date: u.start_date,
          completedDays,
          completedTasks,
          masteredTasks,
          solvedLeetCode,
          notesCount,
          progressPercentage,
          streak,
          badge,
          isCurrentUser: u.id === currentUserId,
        };
      })
    );

    // Sort by completedDays DESC, then solvedLeetCode DESC, then streak DESC
    leaderboard.sort((a, b) => {
      if (b.completedDays !== a.completedDays) return b.completedDays - a.completedDays;
      if (b.solvedLeetCode !== a.solvedLeetCode) return b.solvedLeetCode - a.solvedLeetCode;
      return b.streak - a.streak;
    });

    // Assign rank positions
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    return res.json({
      leaderboard: rankedLeaderboard,
      totalScholars: rankedLeaderboard.length,
      topScholar: rankedLeaderboard[0] || null,
    });
  } catch (error: any) {
    console.error('getLeaderboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch community leaderboard.' });
  }
}
