import React, { useState, useRef, useEffect } from 'react';
import { Menu, Flame, Calendar, Sparkles, Users, User, Settings, LogOut, ChevronDown, CheckCircle2, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DemoUser } from '../types';

interface HeaderProps {
  currentDay: number;
  streakCount: number;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentDay, streakCount, onOpenMobileMenu }) => {
  const { user, logout, loginAsDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [defaultDemoUser, setDefaultDemoUser] = useState<DemoUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    api
      .getDemoUsers()
      .then((data) => {
        if (data && data.length > 0) {
          setDefaultDemoUser(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLaunchDefaultDemo = async () => {
    if (!defaultDemoUser) return;
    await loginAsDemo(defaultDemoUser.id);
    setDropdownOpen(false);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/auth');
  };

  const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'MS';
  const isDefaultDemoActive = user?.email === 'student@csemastery.hub' || user?.id === 1;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090d16]/90 backdrop-blur-md border-b border-[#232e42] px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#121824]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/25 font-semibold">
            DAY {currentDay} / 200
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-xs font-semibold">
          <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
          <span>{streakCount} DAY STREAK</span>
        </div>

        {/* Community Leaderboard */}
        <Link
          to="/community"
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#161c2b] border border-[#232e42] hover:border-amber-500/40 text-slate-300 hover:text-amber-400 text-xs font-mono transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>Leaderboard</span>
        </Link>

        {/* LeetCode Fast Action */}
        <Link
          to="/leetcode"
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#161c2b] border border-[#232e42] hover:border-blue-500/40 text-slate-300 hover:text-blue-400 text-xs font-mono transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>LeetCode</span>
        </Link>

        {/* Interactive Multi-User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#121824] border border-[#232e42] hover:border-blue-500/40 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-xs text-white shadow-sm">
              {userInitials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                {user?.name || 'Mastery Scholar'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#121824] border border-[#232e42] shadow-2xl py-2 z-50 text-xs font-mono">
              {/* User Overview */}
              <div className="px-4 py-3 border-b border-[#232e42]">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Active Scholar Profile</p>
                <h4 className="text-sm font-bold text-slate-100 truncate">{user?.name || 'Mastery Scholar'}</h4>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'student@csemastery.hub'}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-blue-400">
                  <Calendar className="w-3 h-3" />
                  <span>Start: {user?.start_date || 'Day 1'}</span>
                </div>
              </div>

              {/* Default Demo Switch Option */}
              {!isDefaultDemoActive && defaultDemoUser && (
                <div className="p-2 border-b border-[#232e42]">
                  <button
                    onClick={handleLaunchDefaultDemo}
                    className="w-full text-left px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-between transition-colors"
                  >
                    <span>Switch to Default Demo</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                </div>
              )}

              {/* Navigation Links */}
              <div className="py-1">
                <Link
                  to="/community"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-[#161c2b] hover:text-white transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Community Leaderboard</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-[#161c2b] hover:text-white transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-blue-400" />
                  <span>Schedule & Settings</span>
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-[#161c2b] hover:text-white transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In with Another Account</span>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="pt-1 border-t border-[#232e42]">
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
