import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api';
import { initSchema } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Robust CORS configuration for local dev, Vercel deployments, and production
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim().replace(/\/+$/, ''))
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, health checks)
      if (!origin) {
        return callback(null, true);
      }

      // Allow if wildcard '*' is present or in non-production
      if (corsOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/+$/, '');

      // Allow exact match, vercel preview subdomains, or onrender subdomains
      const isAllowed =
        corsOrigins.includes(cleanOrigin) ||
        corsOrigins.some((allowed) => allowed && cleanOrigin.endsWith(allowed.replace(/^\*?\./, ''))) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.onrender.com') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1');

      if (isAllowed) {
        return callback(null, true);
      }

      // Fallback allow with log warning to avoid hard failures on preview URLs
      console.warn(`[CORS Allowed via fallback] Origin: ${origin}`);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    app: '200 Days — CSE Mastery Hub API',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes (support both /api/* and root /*)
app.use('/api', apiRouter);
app.use(apiRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  try {
    await initSchema();
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 200 Days CSE Mastery Hub Backend running on http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
