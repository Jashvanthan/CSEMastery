import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Flame,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Calendar,
  Users,
  Award,
  Crown,
  Medal,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { LeaderboardEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalScholars, setTotalScholars] = useState(0);
  const [topScholar, setTopScholar] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.getLeaderboard();
      setLeaderboard(res.leaderboard);
      setTotalScholars(res.totalScholars);
      setTopScholar(res.topScholar);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
          <Crown className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-lg bg-slate-300/20 text-slate-300 border border-slate-300/40 flex items-center justify-center">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center">
          <Award className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-[#161c2b] text-slate-400 border border-[#232e42] flex items-center justify-center font-mono font-bold text-xs">
        #{rank}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#121824] border border-[#232e42] relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Multi-User Community & Leaderboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              200 Days CSE Mastery Scholar Rankings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Track progress, compare completion milestones, and observe active study streaks across all registered scholars.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-xl bg-[#090d16] border border-[#232e42] font-mono text-center">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Scholars</p>
              <p className="text-xl font-bold text-blue-400">{totalScholars}</p>
            </div>
            <Link
              to="/auth"
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Switch Scholar</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Scholar Spotlight */}
      {topScholar && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-mono font-bold text-xl shadow-md">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Rank #1 Scholar
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {topScholar.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">{topScholar.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{topScholar.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Progress</p>
                <p className="text-sm font-bold text-emerald-400">{topScholar.completedDays} / 200 Days ({topScholar.progressPercentage}%)</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Streak</p>
                <p className="text-sm font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {topScholar.streak} Days
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">LeetCode</p>
                <p className="text-sm font-bold text-blue-400">{topScholar.solvedLeetCode} Solved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#232e42] pb-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Scholar Standings</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Ranked by Completed Days & Streaks</span>
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry) => {
            const isSelf = user?.id === entry.id;
            return (
              <div
                key={entry.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelf
                    ? 'bg-blue-950/20 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-[#090d16] border-[#232e42] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankBadge(entry.rank)}

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-sm text-white shadow-sm">
                    {entry.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      {entry.name}
                      {isSelf && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                          YOU
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#161c2b] text-slate-400 border border-[#232e42]">
                        {entry.badge}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">{entry.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 sm:gap-6 font-mono text-center text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500">DAYS</p>
                    <p className="text-xs sm:text-sm font-bold text-blue-400">
                      {entry.completedDays} / 200
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500">PROGRESS</p>
                    <p className="text-xs sm:text-sm font-bold text-emerald-400">
                      {entry.progressPercentage}%
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500">STREAK</p>
                    <p className="text-xs sm:text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {entry.streak}d
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500">LEETCODE</p>
                    <p className="text-xs sm:text-sm font-bold text-indigo-400">
                      {entry.solvedLeetCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center font-mono text-xs">
                  {isSelf ? (
                    <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/25 font-semibold">
                      Your Profile
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-[#161c2b] text-slate-400 border border-[#232e42]">
                      Verified Scholar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
