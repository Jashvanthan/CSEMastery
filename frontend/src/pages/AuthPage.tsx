import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Flame,
  Binary,
  Code2,
  Database,
  Layers,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DemoUser } from '../types';

export const AuthPage: React.FC = () => {
  const { login, register, loginAsDemo, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'demo' | 'login' | 'register'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [defaultDemoUser, setDefaultDemoUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    api
      .getDemoUsers()
      .then((data) => {
        if (data && data.length > 0) {
          setDefaultDemoUser(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load demo user', err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password, startDate);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check the provided information.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async () => {
    if (!defaultDemoUser) return;
    setError(null);
    setLoading(true);
    try {
      await loginAsDemo(defaultDemoUser.id);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to access default demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Secure Multi-User Workspace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          CSE Mastery Scholar Authentication
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Access your personal learning space with private progress isolation, or explore using the official default demo account.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="p-1 rounded-xl bg-[#121824] border border-[#232e42] inline-flex gap-1 font-mono text-xs">
          <button
            onClick={() => { setMode('demo'); setError(null); }}
            className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
              mode === 'demo'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Default Demo Account</span>
          </button>
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Register New Account</span>
          </button>
        </div>
      </div>

      {/* Active User Alert (if authenticated) */}
      {isAuthenticated && user && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-mono text-emerald-400 font-semibold">AUTHENTICATED AS</p>
              <h3 className="text-sm font-bold text-slate-100">{user.name} ({user.email})</h3>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-mono font-semibold hover:bg-emerald-500 transition-colors"
          >
            Go to Dashboard &rarr;
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Mode 1: Single Default Demo Account */}
      {mode === 'demo' && (
        <div className="max-w-md mx-auto space-y-4">
          {defaultDemoUser ? (
            <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] shadow-xl space-y-6 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-xl text-white shadow-lg">
                  {defaultDemoUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                      OFFICIAL DEMO
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 truncate mt-1">{defaultDemoUser.name}</h3>
                  <p className="text-xs text-slate-400 font-mono truncate">{defaultDemoUser.email}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090d16] border border-[#232e42] space-y-2 text-xs text-slate-300">
                <p className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Public Default Demo Profile</span>
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Use this default demo account for instant sandbox exploration. To create a private study roadmap with personal notes and task tracking, please sign in or register with your email.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2.5 rounded-lg bg-[#090d16] border border-[#232e42]">
                  <p className="text-[10px] text-slate-500">COMPLETED</p>
                  <p className="text-xs font-bold text-blue-400">{defaultDemoUser.completedDays} Days</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#090d16] border border-[#232e42]">
                  <p className="text-[10px] text-slate-500">TASKS</p>
                  <p className="text-xs font-bold text-emerald-400">{defaultDemoUser.completedTasks} Tasks</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#090d16] border border-[#232e42]">
                  <p className="text-[10px] text-slate-500">LEETCODE</p>
                  <p className="text-xs font-bold text-amber-400">{defaultDemoUser.solvedLeetCode} Solved</p>
                </div>
              </div>

              <button
                onClick={handleDemoSwitch}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Launch Default Demo Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] text-center font-mono text-xs text-slate-400">
              Loading default demo account...
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Sign In */}
      {mode === 'login' && (
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#121824] border border-[#232e42] shadow-xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-mono font-semibold block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="scholar@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono font-semibold block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In with Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mode 3: Register New Scholar */}
      {mode === 'register' && (
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#121824] border border-[#232e42] shadow-xl space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-mono font-semibold block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono font-semibold block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono font-semibold block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono font-semibold block mb-1.5">
                Curriculum Start Date (Day 1)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Your private schedule will begin from this calendar date.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Initialize Personal Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
