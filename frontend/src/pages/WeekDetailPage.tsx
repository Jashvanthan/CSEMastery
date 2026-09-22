import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Week, StudyDay } from '../types';

export const WeekDetailPage: React.FC = () => {
  const { weekId } = useParams<{ weekId: string }>();
  const [data, setData] = useState<{ week: Week; days: StudyDay[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (weekId) {
      fetchWeek(parseInt(weekId, 10));
    }
  }, [weekId]);

  const fetchWeek = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWeekDetail(id);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load week');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWeek = async () => {
    if (!data) return;
    const newStatus = data.week.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.toggleWeekStatus(data.week.id, newStatus);
      setData((prev) =>
        prev
          ? {
              ...prev,
              week: { ...prev.week, status: newStatus },
            }
          : null
      );
    } catch (err: any) {
      alert('Failed to update week status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-400">
        <p>{error || 'Week not found'}</p>
        <Link to="/weeks" className="mt-4 inline-block text-blue-400 font-mono text-sm">
          ← Back to Weeks
        </Link>
      </div>
    );
  }

  const { week, days } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-slate-200">Dashboard</Link>
        <span>/</span>
        <Link to="/plan" className="hover:text-slate-200">200-Day Plan</Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Week {week.week_number}</span>
      </nav>

      {week.is_locked && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-3 text-xs font-mono">
          <span className="text-base">🔒</span>
          <div>
            <strong>Week Locked:</strong> {week.lock_reason || `Unlocks when you reach Week ${week.week_number - 10} (Week + 10 Learning Horizon).`}
          </div>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-semibold">
                WEEK {week.week_number}
              </span>
              <span className="text-slate-400 uppercase">{week.track_name || week.track_id}</span>
              {week.is_locked && (
                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-semibold text-[10px]">
                  🔒 LOCKED
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">{week.title}</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">{week.description}</p>
            {week.formattedDateRange && (
              <div className="flex items-center gap-2 mt-3 text-xs font-mono text-blue-400 bg-[#090d16] px-3 py-1.5 rounded-xl border border-[#232e42] w-fit">
                <span>📅 Scheduled:</span>
                <span className="text-slate-200 font-semibold">{week.formattedDateRange}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleWeek}
              disabled={week.is_locked}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs font-mono flex items-center gap-2 transition-all shadow-md ${
                week.is_locked
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : week.status === 'COMPLETED'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{week.is_locked ? 'Locked' : week.status === 'COMPLETED' ? 'Week Completed ✓' : 'Mark Week Complete'}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#232e42] flex items-center justify-between">
          <span className="text-xs font-mono text-slate-300">
            {week.completedDays || 0} / {week.totalDays || days.length} Days Completed
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">{week.progress || 0}%</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Days in Week {week.week_number}</h2>
        <div className="grid grid-cols-1 gap-3">
          {days.map((day) => (
            <Link
              key={day.id}
              to={`/day/${day.day_number}`}
              className="p-5 rounded-xl bg-[#121824] border border-[#232e42] hover:border-blue-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${
                    day.status === 'COMPLETED'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#161c2b] text-slate-400 border border-[#232e42]'
                  }`}
                >
                  {day.status === 'COMPLETED' ? '✓' : `D${day.day_number}`}
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                      Day {day.day_number} — {day.title}
                    </h3>
                    {day.formattedDate && (
                      <span className="text-[10px] font-mono text-slate-300 bg-[#161c2b] px-2 py-0.5 rounded border border-[#232e42]">
                        📅 {day.formattedDate}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                    <span>Topic: {day.topic}</span>
                    <span>•</span>
                    <span>{day.completedTasks || 0} / {day.totalTasks || 5} Tasks Done</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {day.estimated_minutes} mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg ${
                    day.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {day.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
