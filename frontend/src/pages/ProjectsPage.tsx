import React, { useEffect, useState } from 'react';
import { FolderGit2, Code2, Save, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editForms, setEditForms] = useState<{
    [key: number]: { repoUrl: string; demoUrl: string; status: string; notes: string };
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

  const handleSaveProject = async (id: number) => {
    const form = editForms[id];
    if (!form) return;
    try {
      setSavingId(id);
      await api.updateProject(id, form);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: form.status as any, repo_url: form.repoUrl, demo_url: form.demoUrl, user_notes: form.notes }
            : p
        )
      );
    } catch (err) {
      alert('Failed to save project progress');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <FolderGit2 className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
            Hands-on Portfolio
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Topic Projects & Capstones</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Six progressively complex production software projects across Java, PostgreSQL, Full Stack React, Spring Boot, and AI Agents.
        </p>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="p-12 text-center font-mono text-slate-500 text-sm">Loading projects...</div>
      ) : (
        <div className="space-y-6">
          {projects.map((p) => {
            const form = editForms[p.id] || { repoUrl: '', demoUrl: '', status: p.status, notes: '' };
            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] hover:border-slate-700 transition-all shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 font-semibold">
                        {p.phase}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 uppercase">{p.track_id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">{p.title}</h2>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setEditForms((prev) => ({
                        ...prev,
                        [p.id]: { ...prev[p.id], status: e.target.value },
                      }))
                    }
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold focus:outline-none border ${
                      form.status === 'COMPLETED'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : form.status === 'IN_PROGRESS'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        : 'bg-[#161c2b] text-slate-400 border-[#232e42]'
                    }`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed ✓</option>
                  </select>
                </div>

                {/* Tech Stack & Requirements */}
                <div className="p-4 rounded-xl bg-[#090d16] border border-[#232e42] space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500">Tech Stack: </span>
                    <span className="text-blue-300">{p.tech_stack}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Core Requirements: </span>
                    <span className="text-slate-300">{p.requirements}</span>
                  </div>
                </div>

                {/* User URLs and Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">GitHub / Repository URL</label>
                    <input
                      type="url"
                      value={form.repoUrl}
                      onChange={(e) =>
                        setEditForms((prev) => ({
                          ...prev,
                          [p.id]: { ...prev[p.id], repoUrl: e.target.value },
                        }))
                      }
                      placeholder="https://github.com/..."
                      className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">Live Demo / Deployment URL</label>
                    <input
                      type="url"
                      value={form.demoUrl}
                      onChange={(e) =>
                        setEditForms((prev) => ({
                          ...prev,
                          [p.id]: { ...prev[p.id], demoUrl: e.target.value },
                        }))
                      }
                      placeholder="https://..."
                      className="w-full p-2.5 rounded-xl bg-[#090d16] border border-[#232e42] text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleSaveProject(p.id)}
                    disabled={savingId === p.id}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
                  >
                    {savingId === p.id ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{savingId === p.id ? 'Saving...' : 'Save Project Progress'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
