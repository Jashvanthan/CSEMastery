import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  Coffee,
  Database,
  Globe,
  Cpu,
  Award,
  Lock,
  Sparkles,
  AlertTriangle,
  X,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Track, Week, StudyDay } from '../types';

export const TracksPage: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [days, setDays] = useState<StudyDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedModalTrack, setLockedModalTrack] = useState<Track | null>(null);

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
  const activeEnrolledTrack = tracks.find((t) => t.is_active) || tracks[0];

  const handleTrackClick = (t: Track, e: React.MouseEvent) => {
    if (t.is_locked) {
      e.preventDefault();
      setLockedModalTrack(t);
    }
  };

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
      {/* Domain Lock Warning Modal */}
      {lockedModalTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#121824] border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setLockedModalTrack(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Domain Locked</h3>
                <span className="text-xs font-mono text-amber-400 font-semibold">One Domain at a Time</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              You can only unlock one domain at a time! Complete all study weeks and days in your active domain{' '}
              <strong className="text-blue-400 font-semibold">{activeEnrolledTrack?.name}</strong> to unlock{' '}
              <strong className="text-amber-300 font-semibold">{lockedModalTrack.name}</strong>.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-[#161c2b] border border-[#232e42] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Current Domain Progress:</span>
              <span className="text-emerald-400 font-mono font-bold">{activeEnrolledTrack?.progress || 0}%</span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  setLockedModalTrack(null);
                  navigate(`/tracks/${activeEnrolledTrack?.id || 'dsa'}`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
              >
                <span>Continue {activeEnrolledTrack?.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLockedModalTrack(null)}
                className="px-4 py-2.5 rounded-xl bg-[#161c2b] border border-[#232e42] hover:bg-[#1a2337] text-slate-300 font-mono text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#232e42]">
        {tracks.map((t) => {
          const Icon = getIcon(t.icon);
          const isActive = t.id === activeTrackId;
          const isLocked = t.is_locked;

          return (
            <Link
              key={t.id}
              to={isLocked ? '#' : `/tracks/${t.id}`}
              onClick={(e) => handleTrackClick(t, e)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : isLocked
                  ? 'bg-[#0f141f] text-slate-500 border border-[#1e2738] opacity-75 cursor-not-allowed'
                  : 'bg-[#121824] text-slate-400 hover:text-slate-200 hover:bg-[#161c2b] border border-[#232e42]'
              }`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-500/70" /> : <Icon className="w-3.5 h-3.5" />}
              <span>{t.name}</span>
              {isLocked && <span className="text-[10px] text-amber-400 font-mono ml-1">🔒</span>}
              {!isLocked && t.progress !== undefined && (
                <span className="text-[10px] text-emerald-400/80 font-mono ml-1">{t.progress}%</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Track Header Card with Overall Metrics */}
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-blue-400 uppercase font-bold tracking-wider">
                    Curriculum Track
                  </span>
                  {currentTrack.is_active && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Active Learning Domain
                    </span>
                  )}
                  {currentTrack.is_locked && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked Domain
                    </span>
                  )}
                </div>
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

          {/* Detailed Track Metrics */}
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Weeks in this Track</h2>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
            Current Week + 10 Horizon Active
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-sm">
            Loading track syllabus...
          </div>
        ) : (
          <div className="space-y-4">
            {weeks.map((w) => {
              const weekDays = days.filter((d) => d.week_id === w.id);
              const isWeekLocked = w.is_locked;

              return (
                <div
                  key={w.id}
                  className={`rounded-2xl bg-[#121824] border p-5 shadow-md transition-all ${
                    isWeekLocked ? 'border-slate-800/80 opacity-75' : 'border-[#232e42]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg border font-mono text-xs font-bold flex items-center justify-center ${
                          isWeekLocked
                            ? 'bg-slate-900 border-slate-800 text-slate-600'
                            : 'bg-[#161c2b] border-[#232e42] text-blue-400'
                        }`}
                      >
                        {isWeekLocked ? <Lock className="w-3.5 h-3.5" /> : `W${w.week_number}`}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-100">{w.title}</h3>
                          {isWeekLocked && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              🔒 Locked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isWeekLocked && w.lock_reason ? w.lock_reason : w.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-slate-400">
                        {w.completedDays || 0} / {w.totalDays || 7} Days
                      </span>
                      <Link
                        to={`/week/${w.id}`}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                          isWeekLocked
                            ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                            : 'bg-[#161c2b] border-[#232e42] hover:border-blue-500/40 text-blue-400'
                        }`}
                      >
                        {isWeekLocked ? 'Locked Week →' : 'Week Details →'}
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
