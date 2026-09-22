import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Calendar,
  AlertCircle,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  BookmarkCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingTaskId, setTogglingTaskId] = useState<number | null>(null);
  const [togglingDay, setTogglingDay] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const data = await api.getDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleToggleTodayTask = async (taskId: number, currentStatus: string) => {
    if (togglingTaskId !== null) return;
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      setTogglingTaskId(taskId);
      await api.updateTaskStatus(taskId, newStatus);
      await fetchDashboard(true);
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleToggleTodayDay = async (dayId: number, currentStatus: string) => {
    if (togglingDay) return;
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      setTogglingDay(true);
      await api.toggleDayStatus(dayId, newStatus);
      await fetchDashboard(true);
    } catch (err: any) {
      alert(err.message || 'Failed to update day status');
    } finally {
      setTogglingDay(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono text-slate-400">Loading CSE Mastery Command Center...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p className="font-medium">{error || 'Unable to connect to database'}</p>
        </div>
        <button
          onClick={() => fetchDashboard()}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm font-semibold transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Welcome & Philosophy Banner */}
      <div className="flex flex-col gap-5 p-6 rounded-2xl bg-gradient-to-r from-[#121824] via-[#161c2b] to-[#121824] border border-[#232e42] relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold">
                CURRICULUM TIMELINE → DAY {stats.currentDay} / 200
              </span>
              <span className="text-xs font-mono text-slate-400">WEEK {stats.currentWeek}</span>
              {stats.paceMessage && (
                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                    stats.scheduleStatus === 'AHEAD'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : stats.scheduleStatus === 'BEHIND'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                  }`}
                >
                  ⚡ {stats.paceMessage}
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">
              CSE Learning Command Center
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {stats.overallPendingDays} days remaining in your 200-day journey. Paced accurately from your official curriculum start date.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stats.nextIncompleteDay && stats.nextIncompleteDay !== stats.currentDay ? (
              <>
                <Link
                  to={`/day/${stats.nextIncompleteDay}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <span>Resume Day {stats.nextIncompleteDay}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/day/${stats.currentDay}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold shadow-lg shadow-blue-600/20 transition-all"
                >
                  <span>Today's Target (Day {stats.currentDay})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <Link
                to={`/day/${stats.currentDay}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:translate-x-0.5"
              >
                <span>Continue Day {stats.currentDay}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Curriculum Calendar Schedule Anchors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#232e42] font-mono text-xs text-slate-300 relative z-10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Curriculum Start</span>
              <span className="font-semibold text-slate-200">{stats.formattedStartDate || stats.startDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Today's Calendar Date</span>
              <span className="font-semibold text-slate-200">{stats.todayCalendarDate || 'Today'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Target Completion</span>
              <span className="font-semibold text-slate-200">{stats.formattedTargetEndDate || stats.targetEndDate}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Top Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Days */}
        <div className="p-5 rounded-xl bg-[#121824] border border-[#232e42] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase">Total Days</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">{stats.totalDays}</span>
            <span className="text-xs font-mono text-slate-400">Days</span>
          </div>
          <div className="w-full bg-[#1c2438] h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Completed Days */}
        <div className="p-5 rounded-xl bg-[#121824] border border-[#232e42] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase">Completed Days</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">{stats.completedDays}</span>
            <span className="text-xs font-mono text-slate-400">/ {stats.totalDays}</span>
          </div>
          <span className="text-xs font-mono text-emerald-400/80 mt-4 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {stats.completedTasks} tasks done in PostgreSQL
          </span>
        </div>

        {/* Overall Pending Days */}
        <div className="p-5 rounded-xl bg-[#121824] border border-[#232e42] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase">Overall Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-400">{stats.overallPendingDays}</span>
            <span className="text-xs font-mono text-slate-400">Days Remaining</span>
          </div>
          <span className="text-xs font-mono text-slate-400 mt-4">
            {1000 - stats.completedTasks} total tasks to go
          </span>
        </div>

        {/* Overall Percentage */}
        <div className="p-5 rounded-xl bg-[#121824] border border-[#232e42] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase">Mastery Progress</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-purple-400">{stats.progressPercentage}%</span>
            <span className="text-xs font-mono text-slate-400">Achieved</span>
          </div>
          <div className="w-full bg-[#1c2438] h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* REQUIRED DASHBOARD COUNTERS (Sections 11 & User Request) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Pending Until Today / Overdue */}
        <div className="p-4 rounded-xl bg-[#161c2b] border border-[#232e42] flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Pending Up To Today</span>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {stats.pendingUntilToday}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {stats.pendingUntilToday === 0 ? 'Fully on track!' : 'Overdue topics'}
          </span>
        </div>

        {/* Completed Topics */}
        <div className="p-4 rounded-xl bg-[#161c2b] border border-[#232e42] flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Completed Topics</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {stats.completedTopicsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            of {stats.totalTopicsCount} total topics
          </span>
        </div>

        {/* Pending Topics */}
        <div className="p-4 rounded-xl bg-[#161c2b] border border-[#232e42] flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Pending Topics</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {stats.pendingTopicsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Overall topics to finish</span>
        </div>

        {/* Completed Weeks */}
        <div className="p-4 rounded-xl bg-[#161c2b] border border-[#232e42] flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Completed Weeks</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {stats.completedWeeksCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">of {stats.totalWeeks} total weeks</span>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-xl bg-[#161c2b] border border-[#232e42] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Daily Streak</span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">1-Day Gate</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 flex items-center gap-1.5">
            <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
            {stats.streak.current}d
          </div>
          <span className="text-[11px] text-slate-400 mt-1 font-mono">
            Highest: <strong className="text-amber-300 font-semibold">{stats.streak.highest ?? stats.streak.longest}d</strong>
          </span>
        </div>

        {/* Revision */}
        <div className="p-4 rounded-xl bg-[#161c2b] border border-[#232e42] flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Needs Revision</span>
          <div className="text-2xl font-bold font-mono text-orange-400 mt-1">
            {stats.revision.needsRevision}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Mastered: {stats.revision.mastered}</span>
        </div>
      </div>

      {/* TODAY'S LEARNING CARD & NEXT ACTION CARD (Section 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {stats.today && (
          <div className="p-6 rounded-2xl bg-[#121824] border border-blue-500/30 glow-subtle flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs font-semibold">
                    SCHEDULED TODAY — DAY {stats.today.day_number}
                  </span>
                  {stats.today.formattedDate && (
                    <span className="text-xs font-mono text-slate-300 bg-[#161c2b] px-2 py-0.5 rounded border border-[#232e42]">
                      📅 {stats.today.formattedDate}
                    </span>
                  )}
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      stats.today.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {stats.today.status}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleTodayDay(stats.today.id, stats.today.status)}
                  disabled={togglingDay}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    stats.today.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-[#1a2333] text-slate-300 border-[#2b394f] hover:bg-[#232e42]'
                  }`}
                >
                  {togglingDay ? 'Saving...' : stats.today.status === 'COMPLETED' ? '✓ Day Completed' : 'Mark Day Completed'}
                </button>
              </div>

              <h2 className="text-lg font-bold text-slate-100">{stats.today.title}</h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {stats.today.overview}
              </p>

              {/* Today's Tasks Progress Bar */}
              <div className="mt-3 bg-[#161c2b] p-3 rounded-xl border border-[#232e42]">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400 font-semibold">Today's Syllabus Tasks</span>
                  <span className="text-blue-400 font-bold">
                    {stats.today.completedTasks ?? 0} / {stats.today.totalTasks ?? 0} ({stats.today.progress ?? 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#1c2438] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${stats.today.progress ?? 0}%` }}
                  />
                </div>

                {/* Subtask Quick Check List */}
                {stats.today.tasks && stats.today.tasks.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {stats.today.tasks.map((task) => {
                      const isDone = task.status === 'COMPLETED';
                      const isUpdating = togglingTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0e131d] border border-[#1e2738] hover:border-[#2a364d] transition-colors"
                        >
                          <button
                            onClick={() => handleToggleTodayTask(task.id, task.status)}
                            disabled={isUpdating}
                            className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 border transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                                  : 'border-slate-600 bg-[#161c2b] text-transparent hover:border-blue-400'
                              }`}
                            >
                              {isDone ? '✓' : ''}
                            </span>
                            <span
                              className={`text-xs truncate ${
                                isDone ? 'text-slate-400 line-through' : 'text-slate-200 font-medium'
                              }`}
                            >
                              {task.task_number}. {task.title}
                            </span>
                          </button>

                          <Link
                            to={`/task/${task.id}`}
                            className="text-[11px] font-mono text-blue-400 hover:text-blue-300 shrink-0 px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-all"
                          >
                            Study →
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#232e42]/60">
              <span className="text-xs font-mono text-slate-500">
                {stats.today.status === 'COMPLETED' ? 'All tasks complete for today' : 'Continue today\'s study module'}
              </span>
              <Link
                to={`/day/${stats.today.day_number}`}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-md"
              >
                <span>Full Day {stats.today.day_number} View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {stats.nextDay && stats.nextIncompleteDay !== stats.today?.day_number ? (
          <div className="p-6 rounded-2xl bg-[#121824] border border-emerald-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold">
                  RESUME NEXT INCOMPLETE — DAY {stats.nextDay.day_number}
                </span>
                {stats.nextDay.formattedDate && (
                  <span className="text-xs font-mono text-slate-300 bg-[#161c2b] px-2 py-0.5 rounded border border-[#232e42]">
                    📅 {stats.nextDay.formattedDate}
                  </span>
                )}
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {stats.nextDay.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">{stats.nextDay.title}</h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {stats.nextDay.overview}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#232e42]/60">
              <span className="text-xs font-mono text-emerald-400/80">Next unfinished syllabus topic</span>
              <Link
                to={`/day/${stats.nextDay.day_number}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-md"
              >
                <span>Resume Day {stats.nextDay.day_number}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs font-semibold">
                  PACE STATUS
                </span>
                <span className="text-xs font-mono text-slate-400">200-DAY TRACKER</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">{stats.paceMessage}</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Your daily syllabus is pegged to your start date ({stats.formattedStartDate}). All 200 days scale automatically.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#232e42]/60">
              <span className="text-xs font-mono text-slate-500">Need to change start date?</span>
              <Link
                to="/settings"
                className="px-4 py-2 rounded-xl bg-[#161c2b] hover:bg-[#1f283d] text-slate-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all border border-[#232e42]"
              >
                <span>Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>


      {/* TRACK PROGRESS GRID (Section 36) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100">Track Progress</h3>
          <span className="text-xs font-mono text-slate-400">Independent Progression</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.trackProgress.map((t) => (
            <Link
              key={t.id}
              to={`/tracks/${t.id}`}
              className="p-5 rounded-xl bg-[#121824] border border-[#232e42] hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {t.name}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{t.progress}%</span>
              </div>
              <div className="w-full bg-[#1c2438] h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${t.progress}%`, backgroundColor: t.color || '#3b82f6' }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Completed: {t.completed}</span>
                <span>Pending: {t.pending}</span>
                <span>Total: {t.total}d</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* LEETCODE SUMMARY & RECENT WEEKS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LeetCode Tracker Progress */}
        <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">LeetCode Progress</h3>
              </div>
              <Link to="/leetcode" className="text-xs font-mono text-blue-400 hover:underline">
                View Tracker →
              </Link>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold font-mono text-slate-100">
                {stats.leetcode.completed}
              </span>
              <span className="text-xs font-mono text-slate-400">/ {stats.leetcode.total} Solved</span>
              <span className="text-sm font-mono font-semibold text-amber-400 ml-auto">
                {stats.leetcode.percentage}%
              </span>
            </div>

            <div className="w-full bg-[#1c2438] h-2 rounded-full overflow-hidden mb-6">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.leetcode.percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 rounded-lg bg-[#161c2b] border border-[#232e42]">
                <span className="text-[11px] text-emerald-400 block font-semibold">Easy</span>
                <span className="text-lg font-bold text-slate-200">{stats.leetcode.easyCompleted}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#161c2b] border border-[#232e42]">
                <span className="text-[11px] text-amber-400 block font-semibold">Medium</span>
                <span className="text-lg font-bold text-slate-200">{stats.leetcode.mediumCompleted}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#161c2b] border border-[#232e42]">
                <span className="text-[11px] text-red-400 block font-semibold">Hard</span>
                <span className="text-lg font-bold text-slate-200">{stats.leetcode.hardCompleted}</span>
              </div>
            </div>
          </div>

          <Link
            to="/leetcode"
            className="mt-6 w-full py-2 rounded-xl bg-[#161c2b] border border-[#232e42] hover:border-blue-500/40 text-center text-xs font-mono text-slate-300 hover:text-blue-400 transition-colors"
          >
            Open Separate LeetCode Hub
          </Link>
        </div>

        {/* Weekly Progression List (Section 13) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-slate-100">Week Progress</h3>
            </div>
            <Link to="/weeks" className="text-xs font-mono text-blue-400 hover:underline">
              View All 30 Weeks →
            </Link>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {stats.weekProgress.slice(0, 8).map((w) => (
              <Link
                key={w.id}
                to={`/week/${w.id}`}
                className="p-3.5 rounded-xl bg-[#161c2b] border border-[#232e42] hover:border-slate-600 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#121824] border border-[#232e42] font-mono text-xs font-bold text-slate-300 flex items-center justify-center">
                    W{w.week_number}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                      {w.title}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500 uppercase">
                      {w.track_id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-200">{w.completed} / {w.total}</span>
                    <span className="text-slate-500 ml-1">({w.percentage}%)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
