import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  ExternalLink,
  Save,
  Check,
  X,
  Code2,
  Layers,
  ChevronDown,
  Clock,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { LeetCodeProblem, LeetCodeStats } from '../types';

export const LeetcodePage: React.FC = () => {
  const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedWeek, setSelectedWeek] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Problem Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNum, setNewNum] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDiff, setNewDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newTopic, setNewTopic] = useState('Arrays');
  const [newSubtopic, setNewSubtopic] = useState('');
  const [newWeek, setNewWeek] = useState('1');
  const [newUrl, setNewUrl] = useState('');
  const [creating, setCreating] = useState(false);

  // Notes Modal / Inline Editing
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const topicsList = [
    'All',
    'Arrays',
    'Strings',
    'Linked Lists',
    'Trees and Tries',
    'Stacks and Queues',
    'Graphs',
    'Dynamic Programming',
    'Heaps',
    'Hashing',
    'Bit Manipulation',
    'Sorting',
    'Searching',
  ];

  useEffect(() => {
    fetchData();
  }, [selectedTopic, selectedWeek, selectedDifficulty, selectedStatus, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        api.getLeetcode({
          topic: selectedTopic,
          week: selectedWeek,
          difficulty: selectedDifficulty,
          status: selectedStatus,
          search: searchQuery,
        }),
        api.getLeetcodeStats(),
      ]);
      setProblems(listRes);
      setStats(statsRes);
    } catch (err: any) {
      console.error('Error fetching leetcode data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (prob: LeetCodeProblem) => {
    const newStatus = prob.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.toggleLeetcodeStatus(prob.id, newStatus);
      setProblems((prev) =>
        prev.map((p) => (p.id === prob.id ? { ...p, status: newStatus } : p))
      );
      // Refresh stats
      const updatedStats = await api.getLeetcodeStats();
      setStats(updatedStats);
    } catch (err) {
      alert('Failed to update problem status');
    }
  };

  const handleSaveProblemNotes = async (id: number) => {
    try {
      const p = problems.find((item) => item.id === id);
      if (!p) return;
      await api.toggleLeetcodeStatus(id, p.status, noteText);
      setProblems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, user_notes: noteText } : item))
      );
      setEditingNotesId(null);
    } catch (err) {
      alert('Failed to save notes');
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNum || !newTitle) {
      alert('Number and Title are required');
      return;
    }
    try {
      setCreating(true);
      await api.addLeetcodeProblem({
        leetcode_number: parseInt(newNum, 10),
        title: newTitle,
        difficulty: newDiff,
        topic: newTopic,
        subtopic: newSubtopic,
        week_id: parseInt(newWeek, 10),
        url: newUrl || `https://leetcode.com/problems/${newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
      });
      setShowAddModal(false);
      setNewNum('');
      setNewTitle('');
      setNewSubtopic('');
      setNewUrl('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add problem');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
              Dedicated System
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">LeetCode Mastery Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Independent practice hub categorized by topic and week with real LeetCode numbers and complexity analysis.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Problem</span>
        </button>
      </div>

      {/* Statistics Cards (Section 19) */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-[#121824] border border-[#232e42]">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Problems</span>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{stats.total}</div>
            <span className="text-[11px] font-mono text-slate-500">In curriculum</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#232e42]">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Completed</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.completed}</div>
            <span className="text-[11px] font-mono text-emerald-500/80">{stats.percentage}% Solved</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#232e42]">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Pending</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{stats.pending}</div>
            <span className="text-[11px] font-mono text-slate-500">Problems left</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#232e42]">
            <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">Easy</span>
            <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
              {stats.difficulty.easy.completed} <span className="text-xs text-slate-500 font-normal">/ {stats.difficulty.easy.total}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Solved</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#232e42]">
            <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">Medium</span>
            <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
              {stats.difficulty.medium.completed} <span className="text-xs text-slate-500 font-normal">/ {stats.difficulty.medium.total}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Solved</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#232e42]">
            <span className="text-[11px] font-mono text-red-400 uppercase font-semibold">Hard</span>
            <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
              {stats.difficulty.hard.completed} <span className="text-xs text-slate-500 font-normal">/ {stats.difficulty.hard.total}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Solved</span>
          </div>
        </div>
      )}

      {/* Topic-level progress bars */}
      {stats && stats.topicBreakdown.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#121824] border border-[#232e42]">
          <h3 className="text-xs font-mono uppercase text-slate-400 font-bold mb-3 tracking-wider">
            Topic-Level Progress
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stats.topicBreakdown.map((tb) => (
              <div key={tb.topic} className="p-3 rounded-xl bg-[#161c2b] border border-[#232e42]">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span className="truncate">{tb.topic}</span>
                  <span className="font-mono text-[10px] text-slate-400">{tb.completed}/{tb.total}</span>
                </div>
                <div className="w-full bg-[#1c2438] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${tb.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by #number or title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121824] border border-[#232e42] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#121824] border border-[#232e42] text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {topicsList.map((t) => (
            <option key={t} value={t}>
              {t === 'All' ? 'All Topics' : t}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#121824] border border-[#232e42] text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#121824] border border-[#232e42] text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Problems List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-sm">
          Loading LeetCode problems...
        </div>
      ) : problems.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-mono text-sm rounded-2xl bg-[#121824] border border-[#232e42]">
          No LeetCode problems match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {problems.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-xl bg-[#121824] border border-[#232e42] hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <span className="w-12 h-10 rounded-lg bg-[#161c2b] border border-[#232e42] font-mono text-xs font-bold text-blue-400 flex items-center justify-center shrink-0">
                  #{p.leetcode_number}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-100">{p.title}</h3>
                    {p.is_locked && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-semibold">
                        🔒 Locked
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                        p.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : p.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                    <span className="text-slate-300">Topic: {p.topic}</span>
                    {p.subtopic && <span>• {p.subtopic}</span>}
                    <span>• Week {p.week_id}</span>
                    {p.time_complexity && <span>• Time: {p.time_complexity}</span>}
                  </div>

                  {p.is_locked && p.lock_reason && (
                    <p className="mt-2 text-xs font-mono text-amber-300/80 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/20">
                      🔒 {p.lock_reason}
                    </p>
                  )}

                  {p.user_notes && (
                    <p className="mt-2 text-xs font-mono text-blue-300/80 bg-[#090d16] px-3 py-1.5 rounded-lg border border-[#232e42]">
                      Notes: {p.user_notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Notes Button */}
                <button
                  onClick={() => {
                    setEditingNotesId(p.id);
                    setNoteText(p.user_notes || '');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#161c2b] border border-[#232e42] hover:border-slate-600 text-xs font-mono text-slate-300 hover:text-white transition-colors"
                >
                  Notes
                </button>

                {/* Open LeetCode Link */}
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#161c2b] border border-[#232e42] hover:border-blue-500/40 text-blue-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <span>Solve</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Mark Complete / Pending Button */}
                <button
                  onClick={() => handleToggleStatus(p)}
                  disabled={p.is_locked}
                  className={`px-4 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    p.is_locked
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : p.status === 'COMPLETED'
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{p.is_locked ? 'Locked' : p.status === 'COMPLETED' ? 'Completed ✓' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Notes Modal */}
      {editingNotesId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#121824] border border-[#232e42] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Problem Solution Notes</h3>
              <button
                onClick={() => setEditingNotesId(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record solution invariants, corner cases, data structure choices..."
              rows={4}
              className="w-full p-3 rounded-xl bg-[#090d16] border border-[#232e42] text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNotesId(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveProblemNotes(editingNotesId)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-mono text-xs font-semibold"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Problem Modal (Section 18) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProblem}
            className="w-full max-w-md rounded-2xl bg-[#121824] border border-[#232e42] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">+ Add LeetCode Problem</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Problem #</label>
                <input
                  type="number"
                  required
                  value={newNum}
                  onChange={(e) => setNewNum(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Difficulty</label>
                <select
                  value={newDiff}
                  onChange={(e) => setNewDiff(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="font-mono text-xs">
              <label className="text-slate-400 block mb-1">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 3Sum"
                className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Topic</label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {topicsList
                    .filter((t) => t !== 'All')
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Week (1 - 30)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newWeek}
                  onChange={(e) => setNewWeek(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="font-mono text-xs">
              <label className="text-slate-400 block mb-1">Subtopic / Pattern</label>
              <input
                type="text"
                value={newSubtopic}
                onChange={(e) => setNewSubtopic(e.target.value)}
                placeholder="e.g. Two Pointers / Hash Map"
                className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="font-mono text-xs">
              <label className="text-slate-400 block mb-1">LeetCode URL (optional)</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-mono text-xs font-semibold"
              >
                {creating ? 'Saving...' : 'Add Problem'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
