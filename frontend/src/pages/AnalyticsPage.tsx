import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Award, Flame, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setStats(res);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
            Learning Analytics
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Performance & Velocity Metrics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Quantitative tracking of your 200-day journey, study pace, and curriculum mastery.
        </p>
      </div>

      {/* Curriculum Schedule Anchors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#0e131f] border border-[#232e42] text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Curriculum Start</span>
            <span className="text-slate-200 font-semibold">{stats.formattedStartDate || stats.startDate || 'Sep 21, 2026'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Today's Calendar Position</span>
            <span className="text-slate-200 font-semibold">
              {stats.todayCalendarDate || 'Today'} (Day {stats.currentDay} of {stats.totalDays})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Completion</span>
            <span className="text-slate-200 font-semibold">{stats.formattedTargetEndDate || stats.targetEndDate || 'Apr 8, 2027'}</span>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#121824] border border-[#232e42]">
          <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Total Progress</span>
          <div className="text-3xl font-bold font-mono text-blue-400 mt-1">{stats.progressPercentage}%</div>
          <span className="text-xs font-mono text-slate-500">{stats.completedDays} / 200 Days</span>
        </div>

        <div className="p-5 rounded-xl bg-[#121824] border border-[#232e42]">
          <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Active Streak</span>
          <div className="text-3xl font-bold font-mono text-amber-400 mt-1 flex items-center gap-1">
            <Flame className="w-6 h-6 fill-amber-400" />
            {stats.streak.current}d
          </div>
          <span className="text-xs font-mono text-slate-500">Longest: {stats.streak.longest}d</span>
        </div>

        <div className="p-5 rounded-xl bg-[#121824] border border-[#232e42]">
          <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Tasks Completed</span>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">{stats.completedTasks}</div>
          <span className="text-xs font-mono text-slate-500">of {stats.totalTasks} study tasks</span>
        </div>

        <div className="p-5 rounded-xl bg-[#121824] border border-[#232e42]">
          <span className="text-xs font-mono text-slate-400 uppercase font-semibold">LeetCode Solved</span>
          <div className="text-3xl font-bold font-mono text-purple-400 mt-1">{stats.leetcode.completed}</div>
          <span className="text-xs font-mono text-slate-500">{stats.leetcode.percentage}% of curated problems</span>
        </div>
      </div>

      {/* Track Mastery Breakdown */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] space-y-4">
        <h2 className="text-base font-bold text-slate-100">Curriculum Track Mastery</h2>
        <div className="space-y-4">
          {stats.trackProgress.map((t) => (
            <div key={t.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 font-semibold">{t.name}</span>
                <span className="text-slate-400">{t.completed} / {t.total} Days ({t.progress}%)</span>
              </div>
              <div className="w-full bg-[#1c2438] h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${t.progress}%`, backgroundColor: t.color || '#3b82f6' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Bar Graph Visualization */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] space-y-4">
        <h2 className="text-base font-bold text-slate-100">30-Week Completion Trajectory</h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-2">
          {stats.weekProgress.map((w) => (
            <div
              key={w.id}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                w.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : w.percentage && w.percentage > 0
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-[#161c2b] border-[#232e42] text-slate-500'
              }`}
            >
              <span className="font-mono text-[10px] font-bold">W{w.week_number}</span>
              <span className="font-mono text-xs font-semibold my-1">{w.percentage}%</span>
              <span className="text-[9px] font-mono">{w.completed}/{w.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
