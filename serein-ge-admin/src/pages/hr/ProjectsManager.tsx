import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertTriangle, RefreshCw, X, Save, Users2, Flag, ClipboardList } from 'lucide-react';
import DataTable, { Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Project, ProjectMember, ProjectMilestone, ProjectReport, Employee,
  ProjectStatus, MilestoneStatus,
} from '../../types/hr.types';

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'planifie', label: 'Planifié' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' },
  { value: 'suspendu', label: 'Suspendu' },
];

const MILESTONE_STATUSES: MilestoneStatus[] = ['a_venir', 'en_cours', 'termine', 'en_retard'];

const EMPTY_FORM = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'en_cours' as ProjectStatus,
  responsible_id: '',
};

const EMPTY_MEMBER_FORM = { employee_id: '', role_in_project: '' };
const EMPTY_MILESTONE_FORM = { title: '', due_date: '', status: 'a_venir' as MilestoneStatus };

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER_FORM);
  const [milestoneForm, setMilestoneForm] = useState(EMPTY_MILESTONE_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const employeeName = (id: string) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.first_name} ${e.last_name}` : '—';
  };

  const loadAll = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProjects([]);
      setEmployees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const [{ data: proj, error }, { data: emp }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('employees').select('*').order('last_name', { ascending: true }),
    ]);

    if (error) {
      setLoadError('Impossible de charger les projets : ' + error.message);
    } else {
      setProjects((proj || []) as Project[]);
    }
    setEmployees((emp || []) as Employee[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData(EMPTY_FORM);
    setMembers([]);
    setMilestones([]);
    setReports([]);
    setMemberForm(EMPTY_MEMBER_FORM);
    setMilestoneForm(EMPTY_MILESTONE_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (proj: Project) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      description: proj.description || '',
      start_date: proj.start_date || '',
      end_date: proj.end_date || '',
      status: proj.status,
      responsible_id: proj.responsible_id,
    });
    setMemberForm(EMPTY_MEMBER_FORM);
    setMilestoneForm(EMPTY_MILESTONE_FORM);
    setFormError(null);
    setIsModalOpen(true);

    if (isSupabaseConfigured && supabase) {
      const [{ data: mem }, { data: mil }, { data: rep }] = await Promise.all([
        supabase.from('project_members').select('*').eq('project_id', proj.id),
        supabase.from('project_milestones').select('*').eq('project_id', proj.id).order('due_date', { ascending: true }),
        supabase.from('project_reports').select('*').eq('project_id', proj.id).order('week_start', { ascending: false }),
      ]);
      setMembers((mem || []) as ProjectMember[]);
      setMilestones((mil || []) as ProjectMilestone[]);
      setReports((rep || []) as ProjectReport[]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce projet ? Ses membres, jalons et rapports seront également supprimés.')) return;
    if (!isSupabaseConfigured || !supabase) {
      setProjects(projects.filter((p) => p.id !== id));
      return;
    }
    setBusyId(id);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    setBusyId(null);
    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.responsible_id) return;

    if (!isSupabaseConfigured || !supabase) {
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: formData.status,
      responsible_id: formData.responsible_id,
    };

    let savedRow: Project | null = null;

    if (editingProject) {
      const { data, error } = await supabase.from('projects').update(payload).eq('id', editingProject.id).select().single();
      if (error || !data) {
        setSaving(false);
        setFormError(error?.message || 'Échec de la mise à jour.');
        return;
      }
      savedRow = data as Project;
    } else {
      const { data, error } = await supabase.from('projects').insert(payload).select().single();
      if (error || !data) {
        setSaving(false);
        setFormError(error?.message || 'Échec de la création.');
        return;
      }
      savedRow = data as Project;
    }

    setSaving(false);
    if (editingProject) {
      setProjects(projects.map((p) => (p.id === savedRow!.id ? savedRow! : p)));
    } else {
      setProjects([savedRow!, ...projects]);
    }
    setIsModalOpen(false);
  };

  const handleAddMember = async () => {
    if (!editingProject || !memberForm.employee_id || !isSupabaseConfigured || !supabase) return;
    const { data, error } = await supabase.from('project_members').insert({
      project_id: editingProject.id,
      employee_id: memberForm.employee_id,
      role_in_project: memberForm.role_in_project || null,
    }).select().single();

    if (error || !data) {
      alert("Échec de l'ajout du membre : " + (error?.message || 'inconnu'));
      return;
    }
    setMembers([...members, data as ProjectMember]);
    setMemberForm(EMPTY_MEMBER_FORM);
  };

  const handleRemoveMember = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('project_members').delete().eq('id', id);
    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleAddMilestone = async () => {
    if (!editingProject || !milestoneForm.title || !milestoneForm.due_date || !isSupabaseConfigured || !supabase) return;
    const { data, error } = await supabase.from('project_milestones').insert({
      project_id: editingProject.id,
      title: milestoneForm.title,
      due_date: milestoneForm.due_date,
      status: milestoneForm.status,
    }).select().single();

    if (error || !data) {
      alert("Échec de l'ajout du jalon : " + (error?.message || 'inconnu'));
      return;
    }
    setMilestones([...milestones, data as ProjectMilestone].sort((a, b) => a.due_date.localeCompare(b.due_date)));
    setMilestoneForm(EMPTY_MILESTONE_FORM);
  };

  const handleRemoveMilestone = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('project_milestones').delete().eq('id', id);
    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleUpdateMilestoneStatus = async (id: string, status: MilestoneStatus) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, status } : m)));
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('project_milestones').update({ status }).eq('id', id);
    if (error) {
      alert('Échec de la mise à jour du statut : ' + error.message);
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const styles: Record<ProjectStatus, string> = {
      planifie: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      en_cours: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      termine: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      suspendu: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>{PROJECT_STATUSES.find((s) => s.value === status)?.label.toUpperCase()}</span>;
  };

  const columns: Column<Project>[] = [
    {
      header: 'Projet',
      render: (p) => (
        <div>
          <div className="font-bold text-white text-xs">{p.name}</div>
          <div className="text-[10px] text-slate-400 truncate max-w-[240px]">{p.description || '—'}</div>
        </div>
      ),
    },
    { header: 'Responsable', render: (p) => <span className="text-xs text-slate-200">{employeeName(p.responsible_id)}</span> },
    {
      header: 'Dates',
      render: (p) => <span className="text-[11px] text-slate-400">{p.start_date || '—'} → {p.end_date || 'indéterminé'}</span>,
    },
    { header: 'Statut', render: (p) => getStatusBadge(p.status) },
    {
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(p)} className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800" title="Modifier">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(p.id)}
            disabled={busyId === p.id}
            className="p-2 rounded-lg bg-slate-950 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 disabled:opacity-50"
            title="Supprimer"
          >
            {busyId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Projets</h2>
          <p className="text-xs text-slate-400">Équipes, jalons et rapports hebdomadaires par projet.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Projet</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadAll} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des projets...</span>
        </div>
      ) : (
        <DataTable
          data={projects}
          columns={columns}
          searchPlaceholder="Rechercher par nom de projet..."
          searchFilter={(item, q) => item.name.toLowerCase().includes(q.toLowerCase())}
          exportFileName="projets-serein-ge.csv"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Modifier le Projet' : 'Nouveau Projet'}
        subtitle="Informations générales, équipe, jalons et rapports."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-6 text-xs">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Nom du projet *</label>
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Description</label>
              <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Responsable *</label>
              <select required value={formData.responsible_id} onChange={(e) => setFormData({ ...formData, responsible_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500">
                <option value="">Sélectionner...</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Statut</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500">
                {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Date de début</label>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Date de fin</label>
              <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300">{formError}</div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold shadow-glow-emerald flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Enregistrer</span>
            </button>
          </div>
        </form>

        {editingProject && (
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-8 text-xs">

            <div>
              <div className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-emerald-400" />
                <span>Équipe du Projet</span>
              </div>
              <div className="space-y-2 mb-3">
                {members.length === 0 && <p className="text-slate-500">Aucun membre pour le moment.</p>}
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-semibold text-white">{employeeName(m.employee_id)}</span>
                      {m.role_in_project && <span className="text-slate-400"> — {m.role_in_project}</span>}
                    </div>
                    <button type="button" onClick={() => handleRemoveMember(m.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_auto] gap-2">
                <select value={memberForm.employee_id} onChange={(e) => setMemberForm({ ...memberForm, employee_id: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white">
                  <option value="">Employé...</option>
                  {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
                </select>
                <input placeholder="Rôle dans le projet (optionnel)" value={memberForm.role_in_project}
                  onChange={(e) => setMemberForm({ ...memberForm, role_in_project: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white" />
                <button type="button" onClick={handleAddMember} disabled={!memberForm.employee_id}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /><span>Ajouter</span>
                </button>
              </div>
            </div>

            <div>
              <div className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-emerald-400" />
                <span>Jalons</span>
              </div>
              <div className="space-y-2 mb-3">
                {milestones.length === 0 && <p className="text-slate-500">Aucun jalon pour le moment.</p>}
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="min-w-0">
                      <span className="font-semibold text-white">{m.title}</span>
                      <span className="text-slate-400"> — {m.due_date}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={m.status}
                        onChange={(e) => handleUpdateMilestoneStatus(m.id, e.target.value as MilestoneStatus)}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px] focus:outline-none focus:border-emerald-500"
                      >
                        {MILESTONE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button type="button" onClick={() => handleRemoveMilestone(m.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2">
                <input placeholder="Titre du jalon" value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white" />
                <input type="date" value={milestoneForm.due_date} onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white" />
                <select value={milestoneForm.status} onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value as MilestoneStatus })}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white">
                  {MILESTONE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" onClick={handleAddMilestone} disabled={!milestoneForm.title || !milestoneForm.due_date}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /><span>Ajouter</span>
                </button>
              </div>
            </div>

            <div>
              <div className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>Rapports Hebdomadaires</span>
              </div>
              <div className="space-y-2">
                {reports.length === 0 && <p className="text-slate-500">Aucun rapport soumis pour le moment.</p>}
                {reports.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{employeeName(r.author_id)} — {r.week_start} → {r.week_end}</span>
                      {r.progress_percent != null && <span className="text-emerald-400 font-bold">{r.progress_percent}%</span>}
                    </div>
                    {r.achievements && <p className="text-slate-300 mt-1"><span className="text-slate-500">Réalisé : </span>{r.achievements}</p>}
                    {r.blockers && <p className="text-amber-300 mt-0.5"><span className="text-slate-500">Blocages : </span>{r.blockers}</p>}
                    {r.next_steps && <p className="text-slate-300 mt-0.5"><span className="text-slate-500">Prochaines étapes : </span>{r.next_steps}</p>}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Les rapports sont rédigés par le responsable de projet depuis son propre espace (à venir).</p>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
