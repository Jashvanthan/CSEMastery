import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Code2,
  Save,
  Clock,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Sparkles,
  Layers,
  Terminal,
  Filter,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [trackFilter, setTrackFilter] = useState<string>('ALL');
  const [editForms, setEditForms] = useState<{
    [key: number]: { repoUrl: string; demoUrl: string; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; notes: string };
  }>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      setProjects(res);
      const initialForms: any = {};
      res.forEach((p) => {
        initialForms[p.id] = {
          repoUrl: p.repo_url || '',
          demoUrl: p.demo_url || '',
          status: p.status || 'PENDING',
          notes: p.user_notes || '',
        };
      });
      setEditForms(initialForms);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (projectId: number, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    setEditForms((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || { repoUrl: '', demoUrl: '', notes: '' }),
        status: newStatus,
      },
    }));
  };

  const handleSaveProject = async (id: number) => {
    const form = editForms[id];
    if (!form) return;
    try {
      setSavingId(id);
      await api.updateProject(id, form);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: form.status, repo_url: form.repoUrl, demo_url: form.demoUrl, user_notes: form.notes }
            : p
        )
      );
      setSavedSuccessId(id);
      setTimeout(() => {
        setSavedSuccessId((curr) => (curr === id ? null : curr));
      }, 3000);
    } catch (err) {
      console.error('Failed to save project progress:', err);
      alert('Failed to save project progress. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  // Quick 1-click Mark Completed & Save
  const handleQuickComplete = async (id: number) => {
    const currentForm = editForms[id] || { repoUrl: '', demoUrl: '', notes: '', status: 'PENDING' };
    const updatedForm = { ...currentForm, status: 'COMPLETED' as const };
    
    setEditForms((prev) => ({
      ...prev,
      [id]: updatedForm,
    }));

    try {
      setSavingId(id);
      await api.updateProject(id, updatedForm);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'COMPLETED', repo_url: updatedForm.repoUrl, demo_url: updatedForm.demoUrl, user_notes: updatedForm.notes }
            : p
        )
      );
      setSavedSuccessId(id);
      setTimeout(() => {
        setSavedSuccessId((curr) => (curr === id ? null : curr));
      }, 3000);
    } catch (err) {
      console.error('Failed to mark completed:', err);
    } finally {
      setSavingId(null);
    }
  };

  // Filtered list
  const filteredProjects = projects.filter((p) => {
    const currentStatus = editForms[p.id]?.status || p.status || 'PENDING';
    const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
    const matchesTrack = trackFilter === 'ALL' || p.track_id.toLowerCase() === trackFilter.toLowerCase();
    return matchesStatus && matchesTrack;
  });

  const completedCount = projects.filter((p) => (editForms[p.id]?.status || p.status) === 'COMPLETED').length;
  const inProgressCount = projects.filter((p) => (editForms[p.id]?.status || p.status) === 'IN_PROGRESS').length;
  const pendingCount = projects.length - completedCount - inProgressCount;
  const progressPct = projects.length > 0 ? Math.round((completedCount / projects.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderGit2 className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
                Hands-on Engineering Studio
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Topic Projects & Capstones</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Six production software architectures across Java Multithreading, PostgreSQL Storage, Full Stack React, Spring Boot, and AI Agents.
            </p>
          </div>

          {/* Overall Portfolio Progress Card */}
          <div className="p-4 rounded-xl bg-[#090d16]/80 border border-[#232e42] flex items-center gap-4 min-w-[240px]">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-500 transition-all duration-500"
                  strokeDasharray={`${progressPct}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-100 font-mono">{progressPct}%</span>
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-slate-200">
                {completedCount} of {projects.length} Completed
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                <span className="text-blue-400">{inProgressCount} in progress</span>
                <span>•</span>
                <span className="text-slate-500">{pendingCount} pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-5 border-t border-[#232e42]/60 flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090d16] border border-[#232e42]">
            {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#161c2b]'
                }`}
              >
                {s === 'ALL' && 'All Projects'}
                {s === 'PENDING' && `Pending (${pendingCount})`}
                {s === 'IN_PROGRESS' && `In Progress (${inProgressCount})`}
                {s === 'COMPLETED' && `Completed (${completedCount})`}
              </button>
            ))}
          </div>

          {/* Domain Filter Dropdown */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-300 focus:outline-none focus:border-purple-500 font-mono text-xs"
            >
              <option value="ALL">All Domains</option>
              <option value="java">Java & OOP</option>
              <option value="dsa">DSA</option>
              <option value="dbms">DBMS & SQL</option>
              <option value="fullstack">Full Stack Web</option>
              <option value="ai">AI & ML</option>
              <option value="capstone">System Design</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="p-12 text-center font-mono text-slate-500 text-sm flex flex-col items-center gap-2">
          <Clock className="w-6 h-6 animate-spin text-purple-400" />
          <span>Loading portfolio architectures...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121824] border border-[#232e42] text-center font-mono text-slate-400 text-sm">
          No projects match the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((p) => {
            const form = editForms[p.id] || { repoUrl: '', demoUrl: '', status: p.status || 'PENDING', notes: '' };
            const isSavedSuccess = savedSuccessId === p.id;
            const isSaving = savingId === p.id;

            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] hover:border-slate-700 transition-all shadow-md space-y-4"
              >
                {/* Project Header & Status Button Group */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 font-semibold">
                        {p.phase}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 uppercase font-semibold">{p.track_id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">{p.title}</h2>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">{p.description}</p>
                  </div>

                  {/* Interactive Status Selector Buttons */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090d16] border border-[#232e42] shrink-0 self-start">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(p.id, 'PENDING')}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                        form.status === 'PENDING'
                          ? 'bg-[#1e293b] text-slate-200 border border-slate-600 shadow'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(p.id, 'IN_PROGRESS')}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                        form.status === 'IN_PROGRESS'
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(p.id, 'COMPLETED')}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        form.status === 'COMPLETED'
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Completed
                    </button>
                  </div>
                </div>

                {/* Tech Stack & Requirements */}
                <div className="p-4 rounded-xl bg-[#090d16] border border-[#232e42] space-y-2 text-xs font-mono">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">Tech Stack:</span>
                    <span className="text-blue-300 font-medium">{p.tech_stack}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">Core Specs:</span>
                    <span className="text-slate-300">{p.requirements}</span>
                  </div>
                </div>

                {/* URLs & Live Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-400 flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                        <span>GitHub / Repository URL</span>
                      </label>
                      {form.repoUrl && (
                        <a
                          href={form.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span>Open Repo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={form.repoUrl}
                      onChange={(e) =>
                        setEditForms((prev) => ({
                          ...prev,
                          [p.id]: { ...(prev[p.id] || form), repoUrl: e.target.value },
                        }))
                      }
                      placeholder="https://github.com/username/project-repo"
                      className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-400 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>Live Demo / Deployment URL</span>
                      </label>
                      {form.demoUrl && (
                        <a
                          href={form.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <span>Open Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={form.demoUrl}
                      onChange={(e) =>
                        setEditForms((prev) => ({
                          ...prev,
                          [p.id]: { ...(prev[p.id] || form), demoUrl: e.target.value },
                        }))
                      }
                      placeholder="https://my-deployed-project.com"
                      className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Architecture / Implementation Notes */}
                <div>
                  <label className="text-slate-400 font-mono text-xs flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Implementation Notes & Architecture Highlights</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) =>
                      setEditForms((prev) => ({
                        ...prev,
                        [p.id]: { ...(prev[p.id] || form), notes: e.target.value },
                      }))
                    }
                    placeholder="Document your architecture design decisions, API endpoints, benchmarks, or challenges solved..."
                    className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-xs"
                  />
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#232e42]/50">
                  <div className="flex items-center gap-2">
                    {form.status !== 'COMPLETED' ? (
                      <button
                        type="button"
                        onClick={() => handleQuickComplete(p.id)}
                        disabled={isSaving}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Quick Complete</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Project Completed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isSavedSuccess && (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Changes Saved!
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveProject(p.id)}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save Project Progress'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
