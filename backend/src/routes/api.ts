import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as authCtrl from '../controllers/authController';
import * as dashboardCtrl from '../controllers/dashboardController';
import * as planCtrl from '../controllers/planController';
import * as taskCtrl from '../controllers/taskController';
import * as leetcodeCtrl from '../controllers/leetcodeController';
import * as notesCtrl from '../controllers/notesController';
import * as projectsCtrl from '../controllers/projectsController';
import * as communityCtrl from '../controllers/communityController';

const router = Router();

// Auth routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/demo-users', authCtrl.getDemoUsers);
router.post('/auth/demo-login', authCtrl.demoLogin);
router.get('/auth/me', authMiddleware, authCtrl.getMe);
router.patch('/auth/profile', authMiddleware, authCtrl.updateProfile);

// Community & Leaderboard routes
router.get('/community/leaderboard', authMiddleware, communityCtrl.getLeaderboard);

// Dashboard routes
router.get('/dashboard', authMiddleware, dashboardCtrl.getDashboardStats);

// Plan & Tracks routes
router.get('/tracks', authMiddleware, planCtrl.getTracks);
router.get('/weeks', authMiddleware, planCtrl.getWeeks);
router.get('/weeks/:weekId', authMiddleware, planCtrl.getWeekDetail);
router.patch('/weeks/:weekId/status', authMiddleware, planCtrl.toggleWeekStatus);

// Study Days routes
router.get('/days', authMiddleware, planCtrl.getDays);
router.get('/days/:dayNumber', authMiddleware, planCtrl.getDayDetail);
router.patch('/days/:id/status', authMiddleware, planCtrl.toggleDayStatus);
router.post('/days/:id/reflection', authMiddleware, planCtrl.saveDayReflection);
router.get('/revision', authMiddleware, planCtrl.getRevisionItems);

// Dedicated Task Study Pages routes
router.get('/tasks/:taskId', authMiddleware, taskCtrl.getTaskDetail);
router.patch('/tasks/:taskId/status', authMiddleware, taskCtrl.updateTaskStatus);
router.patch('/tasks/:taskId/revision', authMiddleware, taskCtrl.updateRevisionStatus);

// LeetCode Tracker routes
router.get('/leetcode', authMiddleware, leetcodeCtrl.getLeetcodeList);
router.get('/leetcode/stats', authMiddleware, leetcodeCtrl.getLeetcodeStats);
router.post('/leetcode', authMiddleware, leetcodeCtrl.addLeetcodeProblem);
router.patch('/leetcode/:id/status', authMiddleware, leetcodeCtrl.toggleLeetcodeStatus);

// Notes routes
router.get('/notes', authMiddleware, notesCtrl.getNotes);
router.post('/notes', authMiddleware, notesCtrl.saveNote);
router.patch('/notes/:id', authMiddleware, notesCtrl.updateNote);
router.delete('/notes/:id', authMiddleware, notesCtrl.deleteNote);

// Projects routes
router.get('/projects', authMiddleware, projectsCtrl.getProjects);
router.patch('/projects/:id', authMiddleware, projectsCtrl.updateProjectProgress);

export default router;
