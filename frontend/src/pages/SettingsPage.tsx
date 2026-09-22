import React, { useEffect, useState } from 'react';
import { Settings, Calendar, User, Save, Check, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

export const SettingsPage: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      setUser(res);
      setName(res.name || '');
      setStartDate(res.start_date || new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.updateProfile({ name, start_date: startDate });
      setUser(res);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // Helper to calculate calendar dates for preview
  const getCalendarDateForDay = (dayNum: number) => {
    if (!startDate) return '';
    const d = new Date(startDate);
    d.setDate(d.getDate() + (dayNum - 1));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
            Configuration
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Schedule & Profile Settings</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Customize your official curriculum Start Date. All 200 days will automatically map to precise calendar dates without penalizing future days.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1.5 font-semibold">Scholar Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1.5 font-semibold">
              Curriculum Start Date (Day 1)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-[#232e42] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Changing the Start Date recalculates your current day index and overdue count. Days after the current date are strictly marked as <strong>Future</strong> and will never count as overdue.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Settings Saved Successfully!' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* 200-Day Calendar Mapping Preview Table (Section 28) */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">200-Day Calendar Schedule Mapping</h2>
          <span className="text-xs font-mono text-slate-400">Day 1 to Day 200</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {[1, 10, 20, 30, 40, 50, 75, 100, 125, 150, 175, 190, 195, 200].map((d) => (
            <div
              key={d}
              className="p-3 rounded-xl bg-[#161c2b] border border-[#232e42] text-center font-mono"
            >
              <span className="text-blue-400 text-xs font-bold block">DAY {d}</span>
              <span className="text-[11px] text-slate-300 block mt-1">{getCalendarDateForDay(d)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
