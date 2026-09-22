import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Code2,
  Coffee,
  Database,
  Globe,
  Cpu,
  Award,
  Layers,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Track, Week, StudyDay } from '../types';

export const TracksPage: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [days, setDays] = useState<StudyDay[]>([]);
  const [loading, setLoading] = useState(true);

  const activeTrackId = trackId || 'dsa';

  useEffect(() => {
    fetchTrackData(activeTrackId);
  }, [activeTrackId]);

  const fetchTrackData = async (id: string) => {
    try {
      setLoading(true);
      const [tracksRes, weeksRes, daysRes] = await Promise.all([
        api.getTracks(),
        api.getWeeks(id),
        api.getDays({ trackId: id, limit: 200 }),
      ]);
      setTracks(tracksRes);
      setWeeks(weeksRes);
      setDays(daysRes.days);
    } catch (err) {
      console.error('Error fetching track data:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentTrack = tracks.find((t) => t.id === activeTrackId);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Binary':
      case 'Code2':
        return Code2;
      case 'Coffee':
        return Coffee;
      case 'Database':
        return Database;
      case 'Layout':
      case 'Globe':
        return Globe;
      case 'Cpu':
        return Cpu;
      default:
        return Award;
    }
  };

  const IconComp = getIcon(currentTrack?.icon);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Track Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#232e42]">
        {tracks.map((t) => {
          const Icon = getIcon(t.icon);
          const isActive = t.id === activeTrackId;
          return (
            <Link
              key={t.id}
              to={`/tracks/${t.id}`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-[#121824] text-slate-400 hover:text-slate-200 hover:bg-[#161c2b] border border-[#232e42]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Track Header Card with Overall Metrics (User Requirement: overall progress, completed/pending topics, completed/pending weeks) */}
      {currentTrack && (
        <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `${currentTrack.color}15`,
                  borderColor: `${currentTrack.color}40`,
                  color: currentTrack.color,
                }}
              >
                <IconComp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase font-bold tracking-wider">
                  Curriculum Track
                </span>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 mt-0.5">
                  {currentTrack.name}
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  {currentTrack.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <div className="text-3xl font-bold font-mono text-slate-100">
                {currentTrack.progress || 0}%
              </div>
              <span className="text-xs font-mono text-slate-500">Track Mastery</span>
            </div>
          </div>

          {/* Detailed Track Metrics (User explicit request: completed topics, pending topics, completed weeks, pending weeks) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#232e42]">
            <div className="p-3.5 rounded-xl bg-[#161c2b] border border-[#232e42]">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Completed Days</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {currentTrack.completedDays || 0}{' '}
                <span className="text-xs text-slate-500 font-normal">/ {currentTrack.totalDays || 0}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161c2b] border border-[#232e42]">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Pending Days</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {currentTrack.pendingDays || 0}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161c2b] border border-[#232e42]">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Completed Weeks</span>
              <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                {currentTrack.completedWeeks || 0}{' '}
                <span className="text-xs text-slate-500 font-normal">/ {currentTrack.totalWeeks || 0}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161c2b] border border-[#232e42]">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Pending Weeks</span>
              <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                {currentTrack.pendingWeeks || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track Weeks & Days Exploration */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-100">Weeks in this Track</h2>
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-sm">
            Loading track syllabus...
          </div>
        ) : (
          <div className="space-y-4">
            {weeks.map((w) => {
              const weekDays = days.filter((d) => d.week_id === w.id);
              return (
                <div key={w.id} className="rounded-2xl bg-[#121824] border border-[#232e42] p-5 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#161c2b] border border-[#232e42] font-mono text-xs font-bold text-blue-400 flex items-center justify-center">
                        W{w.week_number}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-100">{w.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{w.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-slate-400">
                        {w.completedDays || 0} / {w.totalDays || 7} Days
                      </span>
                      <Link
                        to={`/week/${w.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#161c2b] border border-[#232e42] hover:border-blue-500/40 text-blue-400 text-xs font-mono"
                      >
                        Week Details →
                      </Link>
                    </div>
                  </div>

                  {/* Day Cards for Week */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3 border-t border-[#232e42]/60">
                    {weekDays.map((d) => (
                      <Link
                        key={d.id}
                        to={`/day/${d.day_number}`}
                        className="p-3 rounded-xl bg-[#161c2b] border border-[#232e42] hover:border-blue-500/40 flex items-center justify-between transition-all group"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-blue-400 font-bold">D{d.day_number}</span>
                            <span className="text-xs font-medium text-slate-200 group-hover:text-blue-400 truncate max-w-[160px]">
                              {d.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{d.topic}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            d.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {d.status === 'COMPLETED' ? 'Done' : 'Pending'}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
