import { Response } from 'express';
import { query, getOne, getAll } from '../db';
import { AuthRequest } from '../middleware/auth';

export async function getNotes(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const { taskId, dayId } = req.query;

    let sql = `SELECT sn.*, st.title as task_title, sd.day_number, sd.title as day_title
               FROM study_notes sn
               LEFT JOIN study_tasks st ON sn.task_id = st.id
               LEFT JOIN study_days sd ON sn.day_id = sd.id OR st.day_id = sd.id
               WHERE sn.user_id = $1`;
    const params: any[] = [userId];

    if (taskId) {
      params.push(taskId);
      sql += ` AND sn.task_id = $${params.length}`;
    }
    if (dayId) {
      params.push(dayId);
      sql += ` AND (sn.day_id = $${params.length} OR st.day_id = $${params.length})`;
    }

    sql += ` ORDER BY sn.updated_at DESC`;

    const notes = await getAll(sql, params);
    return res.json(notes);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch notes.' });
  }
}

export async function saveNote(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const { taskId, dayId, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const result = await query(
      `INSERT INTO study_notes (user_id, task_id, day_id, content, updated_at)
       VALUES ($1, $2, $3, $4, datetime('now'))`,
      [userId, taskId || null, dayId || null, content]
    );

    const newId = result.rows && result.rows[0]?.id ? result.rows[0].id : result.lastInsertRowid;
    const saved = await getOne(`SELECT * FROM study_notes WHERE id = $1`, [newId]);

    return res.status(201).json(saved);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to save note.' });
  }
}

export async function updateNote(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const noteId = parseInt(req.params.id as string, 10);
    const { content } = req.body;

    await query(
      `UPDATE study_notes SET content = $1, updated_at = datetime('now')
       WHERE id = $2 AND user_id = $3`,
      [content, noteId, userId]
    );

    const updated = await getOne(`SELECT * FROM study_notes WHERE id = $1`, [noteId]);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update note.' });
  }
}

export async function deleteNote(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const noteId = parseInt(req.params.id as string, 10);

    await query(`DELETE FROM study_notes WHERE id = $1 AND user_id = $2`, [noteId, userId]);
    return res.json({ message: 'Note deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete note.' });
  }
}
