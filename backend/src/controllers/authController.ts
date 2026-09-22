import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query, getOne, getAll } from '../db';
import { generateToken, AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, startDate, targetTrack } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    const existing = await getOne(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const chosenStartDate = startDate || new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO users (email, password_hash, name, start_date)
       VALUES ($1, $2, $3, $4)`,
      [email.toLowerCase().trim(), passwordHash, name.trim(), chosenStartDate]
    );

    const userRecord = await getOne(
      `SELECT id, email, name, start_date, created_at FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    const token = generateToken({ id: userRecord.id, email: userRecord.email, name: userRecord.name });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: userRecord,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await getOne(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        start_date: user.start_date,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to log in.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const user = await getOne(`SELECT id, email, name, start_date, created_at FROM users WHERE id = $1`, [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Enrich with quick progress stats
    const completedDaysRow = await getOne(
      `SELECT COUNT(DISTINCT day_id) as count FROM day_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    );
    const completedTasksRow = await getOne(
      `SELECT COUNT(DISTINCT task_id) as count FROM study_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    );
    const solvedLeetCodeRow = await getOne(
      `SELECT COUNT(DISTINCT problem_id) as count FROM leetcode_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    );

    return res.json({
      ...user,
      completed_days: parseInt(completedDaysRow?.count || '0', 10),
      completed_tasks: parseInt(completedTasksRow?.count || '0', 10),
      solved_leetcode: parseInt(solvedLeetCodeRow?.count || '0', 10),
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 1;
    const { name, start_date } = req.body;

    await query(
      `UPDATE users SET
         name = COALESCE($1, name),
         start_date = COALESCE($2, start_date),
         updated_at = datetime('now')
       WHERE id = $3`,
      [name, start_date, userId]
    );

    const updated = await getOne(`SELECT id, email, name, start_date, created_at FROM users WHERE id = $1`, [userId]);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
}

// Get the single public default demo scholar
export async function getDemoUsers(req: Request, res: Response) {
  try {
    // Only return the single official default demo account (id: 1 or student@csemastery.hub)
    const user = await getOne(
      `SELECT id, email, name, start_date, created_at FROM users WHERE id = 1 OR email = 'student@csemastery.hub' ORDER BY id ASC LIMIT 1`
    );

    if (!user) {
      return res.json([]);
    }

    const completedDays = await getOne(
      `SELECT COUNT(DISTINCT day_id) as count FROM day_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [user.id]
    );
    const completedTasks = await getOne(
      `SELECT COUNT(DISTINCT task_id) as count FROM study_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [user.id]
    );
    const solvedLeetCode = await getOne(
      `SELECT COUNT(DISTINCT problem_id) as count FROM leetcode_progress WHERE user_id = $1 AND status = 'COMPLETED'`,
      [user.id]
    );

    return res.json([
      {
        id: user.id,
        name: user.name,
        email: user.email,
        start_date: user.start_date,
        completedDays: parseInt(completedDays?.count || '0', 10),
        completedTasks: parseInt(completedTasks?.count || '0', 10),
        solvedLeetCode: parseInt(solvedLeetCode?.count || '0', 10),
      },
    ]);
  } catch (error: any) {
    console.error('getDemoUsers error:', error);
    return res.status(500).json({ error: 'Failed to fetch demo users.' });
  }
}

// Instant Demo Login (strictly restricted to the single default demo account)
export async function demoLogin(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    // Find the default demo user
    const defaultDemoUser = await getOne(
      `SELECT id, email, name, start_date, created_at FROM users WHERE id = 1 OR email = 'student@csemastery.hub' ORDER BY id ASC LIMIT 1`
    );

    if (!defaultDemoUser) {
      return res.status(404).json({ error: 'Default demo account not found.' });
    }

    // Security Check: Only allow logging into the default demo user without password
    if (userId && parseInt(userId, 10) !== defaultDemoUser.id) {
      return res.status(403).json({
        error: 'Unauthorized. Password authentication is strictly required to access other user accounts.',
      });
    }

    const token = generateToken({ id: defaultDemoUser.id, email: defaultDemoUser.email, name: defaultDemoUser.name });
    return res.json({
      message: 'Demo login successful',
      token,
      user: defaultDemoUser,
    });
  } catch (error: any) {
    console.error('demoLogin error:', error);
    return res.status(500).json({ error: 'Failed to perform demo login.' });
  }
}

