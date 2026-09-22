import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  BookOpen,
  Calendar,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { StudyDay, StudyTask, LeetCodeProblem } from '../types';

export const DayDetailPage: React.FC = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();

  const [dayData, setDayData] = useState<{
    day: StudyDay;
    tasks: StudyTask[];
    relatedLeetCode: LeetCodeProblem[];
    totalTasks: number;
    completedTasks: number;
    progress: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reflection state
  const [whatLearned, setWhatLearned] = useState('');
  const [difficult, setDifficult] = useState('');
  const [toRevise, setToRevise] = useState('');
  const [completedPractical, setCompletedPractical] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [togglingDay, setTogglingDay] = useState(false);

  useEffect(() => {
    if (dayNumber) {
      fetchDay(parseInt(dayNumber, 10));
    }
  }, [dayNumber]);

  const fetchDay = async (num: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDayDetail(num);
      setDayData(res);
      if (res.day.reflection) {
        setWhatLearned(res.day.reflection.whatLearned || '');
        setDifficult(res.day.reflection.difficult || '');
        setToRevise(res.day.reflection.toRevise || '');
        setCompletedPractical(!!res.day.reflection.completedPractical);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load day details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = async () => {
    if (!dayData || togglingDay) return;
    const newStatus = dayData.day.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      setTogglingDay(true);
      await api.toggleDayStatus(dayData.day.id, newStatus);
      setDayData((prev) =>
        prev
          ? {
              ...prev,
              day: { ...prev.day, status: newStatus },
              completedTasks: newStatus === 'COMPLETED' ? prev.totalTasks : 0,
              progress: newStatus === 'COMPLETED' ? 100 : 0,
              tasks: prev.tasks.map((t) => ({
                ...t,
                status: newStatus,
              })),
            }
          : null
      );
    } catch (err: any) {
      alert('Failed to update day status');
    } finally {
      setTogglingDay(false);
    }
  };


  const handleSaveReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayData) return;
    try {
      setSavingReflection(true);
      await api.saveDayReflection(dayData.day.id, {
        whatLearned,
        difficult,
        toRevise,
        completedPractical,
      });
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 2500);
    } catch (err: any) {
      alert('Failed to save reflection');
    } finally {
      setSavingReflection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono text-slate-400">Loading Day Module...</span>
        </div>
      </div>
    );
  }

  if (error || !dayData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <p className="text-red-400 mb-4">{error || 'Day not found'}</p>
        <Link to="/plan" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-mono text-sm">
          Return to Study Plan
        </Link>
      </div>
    );
  }

  const { day, tasks, relatedLeetCode, totalTasks, completedTasks, progress } = dayData;
  const currentNum = day.day_number;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-slate-200">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/plan" className="hover:text-slate-200">
          200-Day Plan
        </Link>
        <span>/</span>
        <Link to={`/week/${day.week_id}`} className="hover:text-slate-200">
          Week {day.week_id}
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Day {day.day_number}</span>
      </nav>

      {/* Main Day Header Card */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-semibold">
                DAY {day.day_number} / 200
              </span>
              <span className="text-slate-400 uppercase">WEEK {day.week_id}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 uppercase font-semibold text-purple-400">
                {day.track_name || day.track_id}
              </span>
              {day.formattedDate && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 bg-[#161c2b] px-2 py-0.5 rounded border border-[#232e42]">
                    📅 {day.formattedDate}
                  </span>
                </>
              )}
            </div>


            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">{day.title}</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {day.overview}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleDay}
              disabled={togglingDay}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs font-mono flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60 ${
                day.status === 'COMPLETED'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {togglingDay ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>
                {togglingDay
                  ? 'Updating...'
                  : day.status === 'COMPLETED'
                  ? 'Day Completed ✓'
                  : 'Mark Day Complete'}
              </span>
            </button>
          </div>

        </div>

        {/* Task Progress Bar */}
        <div className="mt-6 pt-6 border-t border-[#232e42]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Study Tasks Progress: {completedTasks} / {totalTasks} Tasks Completed
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">{progress}%</span>
          </div>

          <div className="w-full bg-[#1c2438] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* DEDICATED TASKS LIST (Every Task has its own page!) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Daily Study Tasks & Subtopics</h2>
            <p className="text-xs text-slate-400">
              Click any task below to open its dedicated study page with concepts, code, and exercises.
            </p>
          </div>
          {tasks.length > 0 && (
            <Link
              to={`/task/${tasks[0].id}`}
              className="px-4 py-2 rounded-xl bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 text-blue-400 text-xs font-mono font-semibold flex items-center gap-2 transition-all"
            >
              <span>Start Task 1</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {tasks.map((task) => (
            <Link
              key={task.id}
              to={`/task/${task.id}`}
              className="p-4 rounded-xl bg-[#121824] border border-[#232e42] hover:border-blue-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#161c2b] text-slate-400 border border-[#232e42]'
                  }`}
                >
                  {task.status === 'COMPLETED' ? '✓' : `0${task.task_number}`}
                </span>

                <div>
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {task.estimated_minutes} mins
                    </span>
                    <span>•</span>
                    <span
                      className={`uppercase ${
                        task.revision_status === 'MASTERED'
                          ? 'text-emerald-400 font-semibold'
                          : task.revision_status === 'NEEDS_REVISION'
                          ? 'text-amber-400 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {task.revision_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Practical Task Card */}
      {day.practical_task && (
        <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-2">
            Practical Application Task
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-[#090d16] p-4 rounded-xl border border-[#232e42]">
            {day.practical_task}
          </p>
        </div>
      )}

      {/* Related LeetCode Problems for Day */}
      {relatedLeetCode.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">Related LeetCode Problems</h3>
            </div>
            <Link to="/leetcode" className="text-xs font-mono text-blue-400 hover:underline">
              View LeetCode Tracker →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedLeetCode.map((lc) => (
              <div
                key={lc.id}
                className="p-4 rounded-xl bg-[#161c2b] border border-[#232e42] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-400 font-bold">
                      #{lc.leetcode_number}
                    </span>
                    <span className="text-xs font-medium text-slate-200">{lc.title}</span>
                  </div>
                  <span
                    className={`text-[11px] font-mono ${
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
                  className="px-3 py-1.5 rounded-lg bg-[#121824] border border-[#232e42] hover:border-blue-500/40 text-slate-300 hover:text-blue-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <span>Solve</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAILY REFLECTION / CHECK-IN (Section 31) */}
      <form onSubmit={handleSaveReflection} className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Today's Reflection & Check-In</h3>
            <p className="text-xs text-slate-400">
              Daily engineering metacognition: record what worked, friction points, and review areas.
            </p>
          </div>
          <button
            type="submit"
            disabled={savingReflection}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            {reflectionSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{reflectionSaved ? 'Reflection Saved!' : 'Save Reflection'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-mono text-slate-400 mb-1 block">What did I learn today?</label>
            <textarea
              value={whatLearned}
              onChange={(e) => setWhatLearned(e.target.value)}
              placeholder="Key concepts, architectural patterns, algorithmic breakthroughs..."
              rows={3}
              className="w-full p-3 rounded-xl bg-[#090d16] border border-[#232e42] text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 mb-1 block">What was difficult or tricky?</label>
            <textarea
              value={difficult}
              onChange={(e) => setDifficult(e.target.value)}
              placeholder="Edge cases, concurrency race conditions, recursion bases..."
              rows={3}
              className="w-full p-3 rounded-xl bg-[#090d16] border border-[#232e42] text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 mb-1 block">What should I revise later?</label>
            <textarea
              value={toRevise}
              onChange={(e) => setToRevise(e.target.value)}
              placeholder="Specific lemmas, proofs, syntax quirks, system design trade-offs..."
              rows={2}
              className="w-full p-3 rounded-xl bg-[#090d16] border border-[#232e42] text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-3 p-4 rounded-xl bg-[#161c2b] border border-[#232e42] cursor-pointer hover:border-slate-600 transition-colors">
              <input
                type="checkbox"
                checked={completedPractical}
                onChange={(e) => setCompletedPractical(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-300">
                Did I successfully complete today's practical coding exercise?
              </span>
            </label>
          </div>
        </div>
      </form>

      {/* Day Navigation Footer */}
      <div className="pt-6 border-t border-[#232e42] flex items-center justify-between">
        {currentNum > 1 ? (
          <button
            onClick={() => navigate(`/day/${currentNum - 1}`)}
            className="px-4 py-2 rounded-xl bg-[#121824] border border-[#232e42] hover:border-slate-600 text-slate-300 text-xs font-mono flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Day {currentNum - 1}</span>
          </button>
        ) : (
          <div />
        )}

        <Link
          to="/plan"
          className="px-4 py-2 rounded-xl bg-[#161c2b] text-blue-400 text-xs font-mono hover:underline"
        >
          View 200-Day Curriculum
        </Link>

        {currentNum < 200 ? (
          <button
            onClick={() => navigate(`/day/${currentNum + 1}`)}
            className="px-4 py-2 rounded-xl bg-[#121824] border border-[#232e42] hover:border-slate-600 text-slate-300 text-xs font-mono flex items-center gap-2"
          >
            <span>Day {currentNum + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
