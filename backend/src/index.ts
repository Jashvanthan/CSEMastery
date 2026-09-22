import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api';
import { initSchema } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for local dev and production
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps or curl) or matched origins
      if (!origin || corsOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
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
