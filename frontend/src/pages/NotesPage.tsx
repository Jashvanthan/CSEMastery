import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Calendar, Edit3, Save, Check } from 'lucide-react';
import { api } from '../services/api';
import { StudyNote } from '../types';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.getNotes();
      setNotes(res);
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      setSaving(true);
      const saved = await api.saveNote({ content: newContent });
      setNotes([saved, ...notes]);
      setNewContent('');
    } catch (err) {
      alert('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.deleteNote(id);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#121824] border border-[#232e42] relative shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
            Personal Knowledge Base
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Study Notes Repository</h1>
        <p className="text-xs text-slate-400 mt-1">
          All your personal engineering notes, algorithm explanations, and code reminders stored securely in PostgreSQL.
        </p>
      </div>

      {/* Add Quick Note Form */}
      <form onSubmit={handleAddNote} className="p-5 rounded-2xl bg-[#121824] border border-[#232e42] space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Create Quick Note</h3>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Record insights, interview takeaways, cheat sheet snippets..."
          rows={3}
          className="w-full p-3 rounded-xl bg-[#090d16] border border-[#232e42] text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !newContent.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Note'}</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      {loading ? (
        <div className="p-12 text-center font-mono text-slate-500 text-sm">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121824] border border-[#232e42] text-slate-500 font-mono text-sm">
          No study notes saved yet. Write notes on task study pages or use the box above!
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-xl bg-[#121824] border border-[#232e42] hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                  {note.task_title && (
                    <span className="text-blue-400 font-semibold">• {note.task_title}</span>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-[#161c2b] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-[#090d16] p-3 rounded-lg border border-[#232e42]">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
