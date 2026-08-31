import React, { useEffect, useState } from 'react';
import { ClipboardList, Loader2, AlertTriangle, Send } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Project, ProjectReport } from '../../types/hr.types';

interface MyProjectReportsProps {
  employeeId: string;
}

const EMPTY_FORM = {
  project_id: '',
  week_start: '',
  week_end: '',
  progress_percent: '',
  achievements: '',
  blockers: '',
  next_steps: '',
};

export default function MyProjectReports({ employeeId }: MyProjectReportsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadAll = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const [{ data: proj, error: projError }, { data: rep }] = await Promise.all([
      supabase.from('projects').select('*').eq('responsible_id', employeeId).order('created_at', { ascending: false }),
      supabase.from('project_reports').select('*').eq('author_id', employeeId).order('week_start', { ascending: false }),
    ]);
    if (projError) {
      setError('Impossible de charger vos projets : ' + projError.message);
    } else {
      setProjects((proj || []) as Project[]);
      if (proj && proj.length > 0) setFormData((f) => ({ ...f, project_id: f.project_id || proj[0].id }));
    }
    setReports((rep || []) as ProjectReport[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id || !formData.week_start || !formData.week_end || !isSupabaseConfigured || !supabase) return;

    setSaving(true);
    const { data, error: insertError } = await supabase.from('project_reports').insert({
      project_id: formData.project_id,
      author_id: employeeId,
      week_start: formData.week_start,
      week_end: formData.week_end,
      progress_percent: formData.progress_percent ? Number(formData.progress_percent) : null,
      achievements: formData.achievements || null,
      blockers: formData.blockers || null,
      next_steps: formData.next_steps || null,
    }).select().single();
    setSaving(false);

    if (insertError || !data) {
      alert("Échec de l'envoi du rapport : " + (insertError?.message || 'inconnu'));
      return;
    }
    setReports([data as ProjectReport, ...reports]);
    setFormData({ ...EMPTY_FORM, project_id: formData.project_id });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name || '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl text-xs">

      <div>
        <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-emerald-400" />
          <span>Mes Rapports Hebdomadaires</span>
        </h2>
        <p className="text-slate-400 mt-1">Projets dont vous êtes responsable, et suivi hebdomadaire.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          Vous n'êtes responsable d'aucun projet pour le moment.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="admin-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="font-bold text-white text-sm">Nouveau Rapport</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Projet *</label>
              <select required value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500">
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Semaine du *</label>
              <input required type="date" value={formData.week_start} onChange={(e) => setFormData({ ...formData, week_start: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Au *</label>
              <input required type="date" value={formData.week_end} onChange={(e) => setFormData({ ...formData, week_end: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Avancement (%)</label>
              <input type="number" min={0} max={100} value={formData.progress_percent} onChange={(e) => setFormData({ ...formData, progress_percent: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Réalisations</label>
              <textarea rows={2} value={formData.achievements} onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Blocages</label>
              <textarea rows={2} value={formData.blockers} onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Prochaines étapes</label>
              <textarea rows={2} value={formData.next_steps} onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            {saved && <span className="text-emerald-400">Rapport envoyé !</span>}
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold shadow-glow-emerald flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Envoyer le Rapport</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <div className="font-bold text-white text-sm">Historique</div>
        {reports.length === 0 && <p className="text-slate-500">Aucun rapport envoyé pour le moment.</p>}
        {reports.map((r) => (
          <div key={r.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{projectName(r.project_id)} — {r.week_start} → {r.week_end}</span>
              {r.progress_percent != null && <span className="text-emerald-400 font-bold">{r.progress_percent}%</span>}
            </div>
            {r.achievements && <p className="text-slate-300 mt-1"><span className="text-slate-500">Réalisé : </span>{r.achievements}</p>}
            {r.blockers && <p className="text-amber-300 mt-0.5"><span className="text-slate-500">Blocages : </span>{r.blockers}</p>}
          </div>
        ))}
      </div>

    </div>
  );
}
