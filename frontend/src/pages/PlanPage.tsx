import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import { Week, StudyDay } from '../types';

export const PlanPage: React.FC = () => {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [days, setDays] = useState<StudyDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: number]: boolean }>({ 1: true, 2: true });

  const trackTabs = [
    { id: 'all', label: 'All Tracks' },
    { id: 'dsa', label: 'DSA' },
    { id: 'java', label: 'Java' },
    { id: 'dbms', label: 'DBMS' },
    { id: 'fullstack', label: 'Full Stack' },
    { id: 'ai', label: 'AI' },
    { id: 'capstone', label: 'System Design & Capstone' },
  ];

  useEffect(() => {
    fetchPlan();
  }, [selectedTrack]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const [weeksRes, daysRes] = await Promise.all([
        api.getWeeks(selectedTrack !== 'all' ? selectedTrack : undefined),
        api.getDays({
          trackId: selectedTrack !== 'all' ? selectedTrack : undefined,
          limit: 200,
        }),
      ]);
      setWeeks(weeksRes);
      setDays(daysRes.days);
    } catch (err: any) {
      console.error('Error loading plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeekExpand = (weekId: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  // Filter days based on search query and status filter
  const filteredDays = days.filter((d) => {
    const matchesSearch =
      searchQuery === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.day_number.toString().includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && d.status === 'COMPLETED') ||
      (statusFilter === 'pending' && d.status !== 'COMPLETED');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121824] border border-[#232e42]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
              Curriculum Roadmap
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">200-Day CSE Mastery Plan</h1>
          <p className="text-xs text-slate-400 mt-1">
            Structured week-wise and day-wise learning progression spanning DSA, Java, DBMS, Full Stack, and AI.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-[#161c2b] px-4 py-2 rounded-xl border border-[#232e42]">
          <span>Total: <strong>200 Days</strong></span>
          <span>•</span>
          <span><strong>30 Weeks</strong></span>
        </div>
      </div>

      {/* Track Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#232e42]">
        {trackTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTrack(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all ${
              selectedTrack === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-[#121824] text-slate-400 hover:text-slate-200 hover:bg-[#161c2b] border border-[#232e42]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search day number, topic, concept..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121824] border border-[#232e42] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#121824] border border-[#232e42] text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Week-by-Week Accordion Tree View (Section 14) */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-sm">
          Loading 200-day structure...
        </div>
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => {
            const weekDays = filteredDays.filter((d) => d.week_id === week.id);
            if (weekDays.length === 0 && searchQuery !== '') return null;

            const isExpanded = !!expandedWeeks[week.id];

            return (
              <div
                key={week.id}
                className="rounded-2xl bg-[#121824] border border-[#232e42] overflow-hidden transition-all shadow-md"
              >
                {/* Week Header Toggle Bar */}
                <div
                  onClick={() => toggleWeekExpand(week.id)}
                  className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors ${
                    week.is_locked ? 'opacity-70 bg-[#0f141f] hover:bg-[#121824]' : 'hover:bg-[#161c2b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="p-1 rounded-lg bg-[#090d16] text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 font-mono text-xs mb-0.5">
                        <span className="font-bold text-blue-400">WEEK {week.week_number}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 uppercase">{week.track_name || week.track_id}</span>
                        {week.is_locked && (
                          <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-semibold text-[10px]">
                            🔒 LOCKED (WEEK + 10)
                          </span>
                        )}
                        {week.status === 'COMPLETED' && (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded font-semibold text-[10px]">
                            COMPLETED
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100">{week.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {week.is_locked && week.lock_reason ? week.lock_reason : week.formattedDateRange}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right font-mono text-xs">
                      <span className="text-slate-200 font-bold">
                        {week.completedDays || 0} / {week.totalDays || 7}
                      </span>
                      <span className="text-slate-500 ml-1">({week.percentage || 0}%)</span>
                    </div>

                    <Link
                      to={`/week/${week.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                        week.is_locked
                          ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          : 'bg-[#161c2b] border-[#232e42] hover:border-blue-500/40 text-blue-400 hover:text-blue-300'
                      }`}
                    >
                      {week.is_locked ? 'Locked Week →' : 'Week Details →'}
                    </Link>
                  </div>
                </div>

                {/* Days Grid within Week */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-[#0e131f] border-t border-[#232e42] grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weekDays.map((day) => (
                      <Link
                        key={day.id}
                        to={`/day/${day.day_number}`}
                        className="p-4 rounded-xl bg-[#121824] border border-[#232e42] hover:border-blue-500/40 transition-all flex items-start justify-between group shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              day.status === 'COMPLETED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-[#161c2b] text-slate-400 border border-[#232e42]'
                            }`}
                          >
                            {day.status === 'COMPLETED' ? '✓' : day.day_number}
                          </span>

                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <span className="text-[11px] font-mono font-bold text-blue-400 uppercase">
                                Day {day.day_number}
                              </span>
                              {day.formattedDate && (
                                <>
                                  <span className="text-slate-600 text-[10px]">•</span>
                                  <span className="text-[10px] font-mono text-slate-300 bg-[#161c2b] px-1.5 py-0.5 rounded border border-[#232e42]">
                                    📅 {day.formattedDate}
                                  </span>
                                </>
                              )}
                              <span className="text-slate-600 text-[10px]">•</span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase">
                                {day.topic}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">
                              {day.title}
                            </h4>
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {day.estimated_minutes} mins
                            </span>
                          </div>

                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                              day.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {day.status === 'COMPLETED' ? 'Done' : 'Pending'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
