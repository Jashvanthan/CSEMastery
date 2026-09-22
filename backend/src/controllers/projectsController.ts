import { Response } from 'express';
import { query, getOne, getAll } from '../db';
import { AuthRequest } from '../middleware/auth';

export async function getProjects(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const projects = await getAll(
      `SELECT p.*, COALESCE(pp.status, 'PENDING') as status,
              pp.repo_url, pp.demo_url, pp.notes as user_notes, pp.updated_at as user_updated_at
       FROM projects p
       LEFT JOIN project_progress pp ON p.id = pp.project_id AND pp.user_id = $1
       ORDER BY p.id ASC`,
      [userId]
    );

    return res.json(projects);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch projects.' });
  }
}

export async function updateProjectProgress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const projectId = parseInt(req.params.id as string, 10);
    const { status, repoUrl, demoUrl, notes } = req.body;

    const targetStatus = status || 'IN_PROGRESS';

    await query(
      `INSERT INTO project_progress (user_id, project_id, status, repo_url, demo_url, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, datetime('now'))
       ON CONFLICT (user_id, project_id) DO UPDATE SET
         status = EXCLUDED.status,
         repo_url = COALESCE(EXCLUDED.repo_url, project_progress.repo_url),
         demo_url = COALESCE(EXCLUDED.demo_url, project_progress.demo_url),
         notes = COALESCE(EXCLUDED.notes, project_progress.notes),
         updated_at = datetime('now')`,
      [userId, projectId, targetStatus, repoUrl || null, demoUrl || null, notes || null]
    );

    return res.json({ message: 'Project progress updated successfully.', projectId, status: targetStatus });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update project progress.' });
  }
}
