import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  Code2,
  HelpCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  Save,
  Check,
  ChevronLeft,
  Sparkles,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { StudyTask, LeetCodeProblem } from '../types';

export const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState<{
    task: StudyTask;
    navigation: {
      prevTask?: { id: number; task_number: number; title: string };
      nextTask?: { id: number; task_number: number; title: string };
      dayId: number;
      dayNumber: number;
    };
    dayProgress: {
      totalTasks: number;
      completedTasks: number;
      progress: number;
      tasks: { id: number; task_number: number; title: string; status: string }[];
    };
    relatedLeetCode: LeetCodeProblem[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (taskId) {
      fetchTask(parseInt(taskId, 10));
    }
  }, [taskId]);

  const fetchTask = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTaskDetail(id);
      setTaskData(res);
      setNoteContent(res.task.user_notes || '');
      // Initialize checklist state
      const cl = Array.isArray(res.task.checklist) ? res.task.checklist : [];
      const initChecks: { [key: number]: boolean } = {};
      cl.forEach((_, idx) => {
        initChecks[idx] = res.task.status === 'COMPLETED';
      });
      setCheckedItems(initChecks);
    } catch (err: any) {
      setError(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async () => {
    if (!taskData) return;
    const newStatus = taskData.task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.updateTaskStatus(taskData.task.id, newStatus, taskData.task.revision_status, noteContent);
      setTaskData((prev) =>
        prev
          ? {
              ...prev,
              task: { ...prev.task, status: newStatus },
              dayProgress: {
                ...prev.dayProgress,
                completedTasks:
                  newStatus === 'COMPLETED'
                    ? prev.dayProgress.completedTasks + 1
                    : Math.max(0, prev.dayProgress.completedTasks - 1),
                progress: Math.round(
                  ((newStatus === 'COMPLETED'
                    ? prev.dayProgress.completedTasks + 1
                    : Math.max(0, prev.dayProgress.completedTasks - 1)) /
                    prev.dayProgress.totalTasks) *
                    100
                ),
              },
            }
          : null
      );
    } catch (err: any) {
      alert('Failed to update task status');
    }
  };

  const handleRevisionChange = async (newRevision: 'NOT_REVIEWED' | 'NEEDS_REVISION' | 'MASTERED') => {
    if (!taskData) return;
    try {
      await api.updateTaskRevision(taskData.task.id, newRevision);
      setTaskData((prev) =>
        prev
          ? {
              ...prev,
              task: { ...prev.task, revision_status: newRevision },
            }
          : null
      );
    } catch (err: any) {
      alert('Failed to update revision status');
    }
  };

  const handleSaveNote = async () => {
    if (!taskData) return;
    try {
      setSavingNote(true);
      await api.saveNote({ taskId: taskData.task.id, content: noteContent });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (err: any) {
      alert('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono text-slate-400">Loading dedicated study task...</span>
        </div>
      </div>
    );
  }

  if (error || !taskData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <p className="text-red-400 mb-4">{error || 'Task not found'}</p>
        <Link to="/plan" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-mono text-sm">
          Return to Study Plan
        </Link>
      </div>
    );
  }

  const { task, navigation, dayProgress, relatedLeetCode } = taskData;
  const checklistItems = Array.isArray(task.checklist) ? task.checklist : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Clickable Breadcrumbs Hierarchy */}
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 overflow-x-auto py-1">
        <Link to="/" className="hover:text-slate-200">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/plan" className="hover:text-slate-200">
          200-Day Plan
        </Link>
        <span>/</span>
        <Link to={`/week/${task.day_id}`} className="hover:text-slate-200">
          Week
        </Link>
        <span>/</span>
        <Link to={`/day/${navigation.dayNumber}`} className="text-blue-400 hover:underline">
          Day {navigation.dayNumber}
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold truncate">Task {task.task_number}</span>
      </nav>

      {/* Lock Warning Banner if task is locked */}
      {task.is_locked && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-3 text-xs font-mono">
          <span className="text-base">🔒</span>
          <div>
            <strong>Task Locked:</strong> {task.lock_reason || `This task belongs to a locked week. Unlocks when you reach Week ${task.week_number ? task.week_number - 10 : 1} (Week + 10 Learning Horizon).`}
          </div>
        </div>
      )}

      {/* Header Banner & Status Controls */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-semibold">
                TASK 0{task.task_number}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#161c2b] border border-[#232e42] text-slate-300">
                DAY {navigation.dayNumber}
              </span>
              {task.is_locked && (
                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-semibold text-[10px]">
                  🔒 LOCKED
                </span>
              )}
              {task.formattedDate && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#161c2b] border border-[#232e42] text-blue-300">
                  📅 {task.formattedDate}
                </span>
              )}
              <span className="text-slate-400 uppercase">{task.track}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {task.estimated_minutes} mins
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">{task.title}</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">{task.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Revision status selector */}
            <select
              value={task.revision_status}
              disabled={task.is_locked}
              onChange={(e) => handleRevisionChange(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#161c2b] border border-[#232e42] text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="NOT_REVIEWED">Not Reviewed</option>
              <option value="NEEDS_REVISION">⚠️ Needs Revision</option>
              <option value="MASTERED">⭐ Mastered</option>
            </select>

            {/* Mark Complete Button */}
            <button
              onClick={handleToggleTaskStatus}
              disabled={task.is_locked}
              className={`px-5 py-2 rounded-xl font-semibold text-xs font-mono flex items-center gap-2 transition-all shadow-md ${
                task.is_locked
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : task.status === 'COMPLETED'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                  : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{task.is_locked ? 'Task Locked 🔒' : task.status === 'COMPLETED' ? 'Completed ✓' : 'Mark Task Complete'}</span>
            </button>
          </div>
        </div>

        {/* Parent Day Task Progress bar */}
        <div className="mt-6 pt-4 border-t border-[#232e42] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>
              Day {navigation.dayNumber} Progress:{' '}
              <strong className="text-slate-200">
                {dayProgress.completedTasks} / {dayProgress.totalTasks} tasks completed
              </strong>
            </span>
          </div>

          <div className="w-full sm:w-48 bg-[#1c2438] h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${dayProgress.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Study Content Tabs/Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Detailed Educational Material */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Content */}
          <section className="p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-slate-100">Study Material & Core Concepts</h3>
            </div>
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-3">
              <p>{task.content}</p>
            </div>
          </section>

          {/* Code Example */}
          {task.code_examples && (
            <section className="p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-slate-100">Implementation & Code Snippet</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Production Syntax</span>
              </div>
              <pre className="p-4 rounded-xl bg-[#090d16] border border-[#232e42] overflow-x-auto text-xs font-mono text-blue-300 leading-relaxed">
                <code>{task.code_examples}</code>
              </pre>
            </section>
          )}

          {/* Interview Questions & Common Mistakes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#121824] border border-[#232e42]">
              <div className="flex items-center gap-2 mb-3 text-purple-400">
                <HelpCircle className="w-4 h-4" />
                <h4 className="text-sm font-bold text-slate-100">Interview Relevance</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {task.interview_questions}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121824] border border-[#232e42]">
              <div className="flex items-center gap-2 mb-3 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-sm font-bold text-slate-100">Common Pitfalls</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {task.common_mistakes}
              </p>
            </div>
          </div>

          {/* Practical Exercise */}
          {task.practical_exercise && (
            <section className="p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
              <h4 className="text-sm font-bold text-slate-100 mb-2">Practical Exercise</h4>
              <p className="text-xs text-slate-300">{task.practical_exercise}</p>
            </section>
          )}
        </div>

        {/* Right Column (1 Col): Checklist, Notes & Related LeetCode */}
        <div className="space-y-6">
          {/* Task Checklist */}
          <section className="p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Task Checklist</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {Object.values(checkedItems).filter(Boolean).length} / {checklistItems.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {checklistItems.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-[#161c2b] border border-[#232e42] hover:border-slate-600 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!checkedItems[idx]}
                    onChange={() =>
                      setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className="mt-0.5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span
                    className={`text-xs ${
                      checkedItems[idx] ? 'line-through text-slate-500' : 'text-slate-300'
                    }`}
                  >
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Related LeetCode Problems */}
          {relatedLeetCode.length > 0 && (
            <section className="p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-bold text-slate-100">Related LeetCode</h3>
                </div>
                <Link to="/leetcode" className="text-[11px] font-mono text-blue-400 hover:underline">
                  All Problems
                </Link>
              </div>

              <div className="space-y-2">
                {relatedLeetCode.map((lc) => (
                  <div
                    key={lc.id}
                    className="p-3 rounded-xl bg-[#161c2b] border border-[#232e42] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-blue-400 font-bold">
                          #{lc.leetcode_number}
                        </span>
                        <span className="text-xs font-medium text-slate-200">{lc.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono ${
                          lc.difficulty === 'Easy'
                            ? 'text-emerald-400'
                            : lc.difficulty === 'Medium'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {lc.difficulty}
                      </span>
                    </div>

                    <a
                      href={lc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#121824] border border-[#232e42] text-slate-400 hover:text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Personal Task Notes Section (Persisted to PostgreSQL) */}
          <section className="p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100">My Study Notes</h3>
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                {noteSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                <span>{noteSaved ? 'Saved!' : 'Save Note'}</span>
              </button>
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Record code explanations, edge cases, personal insights..."
              rows={4}
              className="w-full p-3 rounded-xl bg-[#090d16] border border-[#232e42] text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </section>
        </div>
      </div>

      {/* Sequential Navigation Bar (Previous Task, Back to Day, Next Task) */}
      <div className="pt-6 border-t border-[#232e42] flex items-center justify-between gap-4">
        {navigation.prevTask ? (
          <button
            onClick={() => navigate(`/task/${navigation.prevTask?.id}`)}
            className="px-4 py-2 rounded-xl bg-[#121824] border border-[#232e42] hover:border-slate-600 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              Previous Task: {navigation.prevTask.title}
            </span>
          </button>
        ) : (
          <div />
        )}

        <Link
          to={`/day/${navigation.dayNumber}`}
          className="px-4 py-2 rounded-xl bg-[#161c2b] border border-[#232e42] hover:border-blue-500/40 text-blue-400 text-xs font-mono transition-colors"
        >
          Back to Day {navigation.dayNumber} Overview
        </Link>

        {navigation.nextTask ? (
          <button
            onClick={() => navigate(`/task/${navigation.nextTask?.id}`)}
            className="px-4 py-2 rounded-xl bg-[#121824] border border-[#232e42] hover:border-slate-600 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all"
          >
            <span>
              Next Task: {navigation.nextTask.title}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
