import { Request, Response } from 'express';
import { query, getOne, getAll } from '../db';
import { AuthRequest } from '../middleware/auth';

export async function getLeaderboard(req: AuthRequest, res: Response) {
  try {
    const currentUserId = req.user?.id || 1;

    // Fetch all users with pre-aggregated counts in a single efficient SQL query
    const rows = await getAll(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.start_date, 
        u.created_at,
        (SELECT COUNT(DISTINCT day_id) FROM day_progress WHERE user_id = u.id AND status = 'COMPLETED') as completed_days,
        (SELECT COUNT(DISTINCT task_id) FROM study_progress WHERE user_id = u.id AND status = 'COMPLETED') as completed_tasks,
        (SELECT COUNT(DISTINCT task_id) FROM study_progress WHERE user_id = u.id AND revision_status = 'MASTERED') as mastered_tasks,
        (SELECT COUNT(DISTINCT problem_id) FROM leetcode_progress WHERE user_id = u.id AND status = 'COMPLETED') as solved_leetcode,
        (SELECT COUNT(*) FROM study_notes WHERE user_id = u.id) as notes_count
      FROM users u
      ORDER BY id ASC
    `);

    const leaderboard = rows.map((u: any) => {
      const completedDays = Number(u.completed_days || 0);
      const completedTasks = Number(u.completed_tasks || 0);
      const masteredTasks = Number(u.mastered_tasks || 0);
      const solvedLeetCode = Number(u.solved_leetcode || 0);
      const notesCount = Number(u.notes_count || 0);

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
    });

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

