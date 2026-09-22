import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mastery-secret-token-key-200days-cse';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default fallback to demo user (id: 1) if no token for instant browsing/dev convenience
    req.user = { id: 1, email: 'student@csemastery.hub', name: 'Mastery Scholar' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; name: string };
    req.user = decoded;
    next();
  } catch (err) {
    // If token invalid, fall back to guest/demo user
    req.user = { id: 1, email: 'student@csemastery.hub', name: 'Mastery Scholar' };
    next();
  }
}

export function generateToken(user: { id: number; email: string; name: string }): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
}
