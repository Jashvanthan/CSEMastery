import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Target,
  Layers,
  Code2,
  Coffee,
  Database,
  Globe,
  Cpu,
  BookmarkCheck,
  FolderGit2,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  Users,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentDay?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentDay = 1, isOpen = false, onClose }) => {
  const { user } = useAuth();

  const mainNav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/plan', label: '200-Day Plan', icon: CalendarDays },
    { to: `/day/${currentDay}`, label: 'Today', icon: Target, badge: `Day ${currentDay}` },
    { to: '/weeks', label: 'Weeks', icon: Layers },
    { to: '/community', label: 'Community & Ranks', icon: Users, badge: 'Multiuser' },
  ];

  const tracks = [
    { to: '/tracks/java', label: 'Java & OOP', icon: Coffee, color: 'text-amber-500' },
    { to: '/tracks/dsa', label: 'DSA Blueprint', icon: Code2, color: 'text-blue-400' },
    { to: '/tracks/dbms', label: 'DBMS & SQL', icon: Database, color: 'text-emerald-400' },
    { to: '/tracks/fullstack', label: 'Full Stack', icon: Globe, color: 'text-purple-400' },
    { to: '/tracks/ai', label: 'AI & ML', icon: Cpu, color: 'text-pink-400' },
  ];

  const tools = [
    { to: '/leetcode', label: 'LeetCode', icon: Sparkles, badge: 'Separate' },
    { to: '/revision', label: 'Revision Hub', icon: BookmarkCheck },
    { to: '/projects', label: 'Projects Studio', icon: FolderGit2 },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'MS';

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#090d16] border-r border-[#232e42] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-blue-500/25">
            200
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
              CSE MASTERY
            </h1>
            <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
              Learning OS
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1 mb-6">
          <div className="px-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Navigation
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Tracks Navigation */}
        <div className="space-y-1 mb-6">
          <div className="px-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Curriculum Tracks
          </div>
          {tracks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#161c2b] text-white border border-[#2f3e58]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </NavLink>
            );
          })}
        </div>

        {/* Tools & Tracker */}
        <div className="space-y-1">
          <div className="px-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Hub & Tools
          </div>
          {tools.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Multi-User Profile Snippet */}
      <Link
        to="/auth"
        onClick={onClose}
        className="p-4 border-t border-[#232e42] bg-[#0c111c]/80 hover:bg-[#121824] transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-mono text-xs font-bold text-white shadow-sm">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
              {user?.name || 'Mastery Scholar'}
            </p>
            <p className="text-[10px] font-mono text-emerald-400 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-User Session</span>
            </p>
          </div>
        </div>
        <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
      </Link>
    </aside>
  );
};
