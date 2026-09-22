import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, AlertTriangle, Award, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface RevisionItem {
  task_id: number;
  task_number: number;
  task_title: string;
  difficulty: string;
  day_id: number;
  day_number: number;
  day_title: string;
  topic: string;
  track_id: string;
  track_name: string;
  track_color: string;
  revision_status: 'NOT_REVIEWED' | 'NEEDS_REVISION' | 'MASTERED';
  task_status: string;
  notes?: string;
  updated_at: string;
}

export const RevisionPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'NEEDS_REVISION' | 'MASTERED'>('ALL');
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevisionItems();
  }, []);

  const fetchRevisionItems = async () => {
    try {
      setLoading(true);
      const res = await api.getRevisionItems();
      setItems(res);
    } catch (err) {
      console.error('Error fetching revision items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRevision = async (taskId: number, newStatus: 'NEEDS_REVISION' | 'MASTERED') => {
    try {
      await api.updateTaskRevision(taskId, newStatus);
      setItems((prev) =>
        prev.map((item) => (item.task_id === taskId ? { ...item, revision_status: newStatus } : item))
      );
    } catch (err) {
      alert('Failed to update revision status');
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    return item.revision_status === filter;
  });

  const needsRevisionCount = items.filter((i) => i.revision_status === 'NEEDS_REVISION').length;
  const masteredCount = items.filter((i) => i.revision_status === 'MASTERED').length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <BookmarkCheck className="w-5 h-5 text-orange-400" />
          <span className="text-xs font-mono font-semibold text-orange-400 uppercase tracking-wider">
            Active Recall & Retention
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Revision Hub</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Systematically revisit and drill topics you marked for spaced repetition to lock in interview readiness.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[#232e42]">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-[#161c2b] text-slate-400 hover:text-white border border-[#232e42]'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilter('NEEDS_REVISION')}
            className={`px-4 py-1.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filter === 'NEEDS_REVISION'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-[#161c2b] text-amber-400 hover:text-amber-300 border border-[#232e42]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Needs Revision ({needsRevisionCount})</span>
          </button>
          <button
            onClick={() => setFilter('MASTERED')}
            className={`px-4 py-1.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filter === 'MASTERED'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-[#161c2b] text-emerald-400 hover:text-emerald-300 border border-[#232e42]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mastered ({masteredCount})</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="p-12 text-center font-mono text-slate-500 text-sm">
          Loading revision items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121824] border border-[#232e42] text-slate-500 font-mono text-sm">
          No items found under "{filter.replace('_', ' ')}". Complete tasks and tag their revision status in study modules!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.task_id}
              className="p-5 rounded-xl bg-[#121824] border border-[#232e42] hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-9 h-9 rounded-xl border font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    item.revision_status === 'MASTERED'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                      : item.revision_status === 'NEEDS_REVISION'
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                      : 'bg-blue-950/40 border-blue-500/30 text-blue-400'
                  }`}
                >
                  {item.revision_status === 'MASTERED' ? '★' : '⚡'}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="text-blue-400 font-bold">DAY {item.day_number}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">TASK #{item.task_number}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-purple-400 uppercase">{item.track_name}</span>
                    <span className="text-slate-500">•</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.revision_status === 'MASTERED'
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                          : item.revision_status === 'NEEDS_REVISION'
                          ? 'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.revision_status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 mt-1">{item.task_title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">Topic: {item.topic}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {item.revision_status !== 'MASTERED' && (
                  <button
                    onClick={() => handleUpdateRevision(item.task_id, 'MASTERED')}
                    className="px-3 py-1.5 rounded-lg bg-[#161c2b] border border-[#232e42] hover:border-emerald-500/50 hover:bg-emerald-950/30 text-emerald-400 font-mono text-xs transition-all cursor-pointer"
                  >
                    Mark Mastered
                  </button>
                )}
                {item.revision_status !== 'NEEDS_REVISION' && (
                  <button
                    onClick={() => handleUpdateRevision(item.task_id, 'NEEDS_REVISION')}
                    className="px-3 py-1.5 rounded-lg bg-[#161c2b] border border-[#232e42] hover:border-amber-500/50 hover:bg-amber-950/30 text-amber-400 font-mono text-xs transition-all cursor-pointer"
                  >
                    Needs Revision
                  </button>
                )}
                <Link
                  to={`/tasks/${item.task_id}`}
                  className="px-4 py-2 rounded-xl bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 text-blue-400 font-mono text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

