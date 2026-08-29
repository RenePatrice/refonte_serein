import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { TeamMember, Department } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_TEAM_ADMIN: TeamMember[] = [
  {
    id: 't1',
    nom: 'Ing. Patrice COMPAORÉ',
    poste: 'Directeur Général & Ingénieur Géomètre',
    department_nom: 'Topographie & Géodésie',
    bio: 'Plus de 18 ans d\'expérience en ingénierie géodésique et aménagement territorial.',
    photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    email: 'direction@serein-ge.bf',
    telephone: '+226 25 30 00 01',
    ordre: 1,
    is_active: true,
  },
  {
    id: 't2',
    nom: 'Mme Aminata OUÉDRAOGO',
    poste: 'Responsable SIG & Télédétection',
    department_nom: 'Géomatique & SIG',
    bio: 'Spécialiste en modélisation spatiale et WebSIG.',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    email: 'sig@serein-ge.bf',
    telephone: '+226 25 30 00 02',
    ordre: 2,
    is_active: true,
  },
  {
    id: 't3',
    nom: 'Ing. Moussa TRAORÉ',
    poste: 'Chef de Projets BTP & Auscultation',
    department_nom: 'Ingénierie & BTP',
    bio: 'Expert en cubatures et contrôle géométrique de grands ouvrages.',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    email: 'travaux@serein-ge.bf',
    telephone: '+226 25 30 00 03',
    ordre: 3,
    is_active: true,
  },
  {
    id: 't4',
    nom: 'Yacouba SANOU',
    poste: 'Responsable Ventes & Support SAV',
    department_nom: 'Distribution de Matériel',
    bio: 'Technicien supérieur certifié CHCNAV & Toknav.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    email: 'commercial@serein-ge.bf',
    telephone: '+226 25 30 00 04',
    ordre: 4,
    is_active: true,
  }
];

const DEMO_DEPARTMENT_NAMES = ['Topographie & Géodésie', 'Géomatique & SIG', 'Ingénierie & BTP', 'Distribution de Matériel'];

const EMPTY_FORM: Partial<TeamMember> = {
  nom: '',
  poste: '',
  department_nom: 'Topographie & Géodésie',
  department_id: null,
  bio: '',
  photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
  email: '',
  telephone: '',
  ordre: 1,
  is_active: true,
};

export default function TeamManager() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadTeam = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setTeam(INITIAL_TEAM_ADMIN);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);

    const [teamRes, deptRes] = await Promise.all([
      supabase.from('team').select('*, departments(nom)').order('ordre', { ascending: true }),
      supabase.from('departments').select('id, nom').order('ordre', { ascending: true }),
    ]);

    if (teamRes.error) {
      setLoadError("Impossible de charger l'équipe : " + teamRes.error.message);
    } else {
      const mapped = (teamRes.data || []).map((row: any) => ({
        ...row,
        department_nom: row.departments?.nom || '—',
      }));
      setTeam(mapped as TeamMember[]);
    }

    if (deptRes.data) setDepartments(deptRes.data as Department[]);

    setLoading(false);
  };

  useEffect(() => {
    loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormError(null);
    setFormData({
      ...EMPTY_FORM,
      department_id: isSupabaseConfigured ? (departments[0]?.id || null) : null,
      ordre: team.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormError(null);
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce membre ?')) return;

    if (!isSupabaseConfigured || !supabase) {
      setTeam(team.filter((m) => m.id !== id));
      return;
    }

    setBusyId(id);
    const { error } = await supabase.from('team').delete().eq('id', id);
    setBusyId(null);

    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setTeam(team.filter((m) => m.id !== id));
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= team.length) return;

    const current = team[index];
    const target = team[targetIndex];

    if (!isSupabaseConfigured || !supabase) {
      const newTeam = [...team];
      newTeam[index] = target;
      newTeam[targetIndex] = current;
      setTeam(newTeam.map((m, idx) => ({ ...m, ordre: idx + 1 })));
      return;
    }

    setBusyId(current.id);
    const [res1, res2] = await Promise.all([
      supabase.from('team').update({ ordre: target.ordre }).eq('id', current.id),
      supabase.from('team').update({ ordre: current.ordre }).eq('id', target.id),
    ]);
    setBusyId(null);

    if (res1.error || res2.error) {
      alert("Échec de la réorganisation : " + (res1.error?.message || res2.error?.message));
      return;
    }

    const newTeam = [...team];
    newTeam[index] = { ...target, ordre: current.ordre };
    newTeam[targetIndex] = { ...current, ordre: target.ordre };
    setTeam(newTeam.sort((a, b) => a.ordre - b.ordre));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.poste) return;

    if (!isSupabaseConfigured || !supabase) {
      if (editingMember) {
        setTeam(team.map((m) => (m.id === editingMember.id ? { ...m, ...formData } as TeamMember : m)));
      } else {
        const newM: TeamMember = { ...formData, id: `t_${Date.now()}` } as TeamMember;
        setTeam([...team, newM]);
      }
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      nom: formData.nom,
      poste: formData.poste,
      department_id: formData.department_id || null,
      bio: formData.bio || null,
      photo_url: formData.photo_url || null,
      email: formData.email || null,
      telephone: formData.telephone || null,
      ordre: formData.ordre,
      is_active: formData.is_active,
    };

    if (editingMember) {
      const { data, error } = await supabase
        .from('team')
        .update(payload)
        .eq('id', editingMember.id)
        .select('*, departments(nom)')
        .single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || 'Échec de la mise à jour du membre');
        return;
      }
      const updated = { ...(data as any), department_nom: (data as any).departments?.nom || '—' } as TeamMember;
      setTeam(team.map((m) => (m.id === editingMember.id ? updated : m)));
    } else {
      const { data, error } = await supabase
        .from('team')
        .insert(payload)
        .select('*, departments(nom)')
        .single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || 'Échec de la création du membre');
        return;
      }
      const created = { ...(data as any), department_nom: (data as any).departments?.nom || '—' } as TeamMember;
      setTeam([...team, created]);
    }

    setIsModalOpen(false);
  };

  const columns: Column<TeamMember>[] = [
    {
      header: 'Ordre',
      render: (m) => {
        const index = team.findIndex((t) => t.id === m.id);
        return (
          <div className="flex items-center space-x-1">
            <span className="font-bold text-white text-xs w-4">{m.ordre}</span>
            <button
              onClick={() => handleMoveOrder(index, 'up')}
              disabled={index === 0 || busyId === m.id}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleMoveOrder(index, 'down')}
              disabled={index === team.length - 1 || busyId === m.id}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
    {
      header: 'Membre & Photo',
      render: (m) => (
        <div className="flex items-center space-x-3">
          <img src={m.photo_url} alt={m.nom} className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
          <div>
            <div className="font-bold text-white text-xs">{m.nom}</div>
            <div className="text-[10px] text-emerald-400 font-medium">{m.poste}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Département',
      accessor: 'department_nom',
    },
    {
      header: 'Contact',
      render: (m) => (
        <div className="text-[11px] text-slate-400 space-y-0.5">
          <div>{m.email}</div>
          <div>{m.telephone}</div>
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (m) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEdit(m)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(m.id)}
            disabled={busyId === m.id}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-red-400 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Gestion de l'Équipe & Organigramme</h2>
          <p className="text-xs text-slate-400">CRUD des membres, photos, départements et ordre d'apparition sur le site public.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Membre</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadTeam} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement de l'équipe...</span>
        </div>
      ) : (
        <DataTable
          data={team}
          columns={columns}
          searchPlaceholder="Rechercher un membre, poste..."
          searchFilter={(item, q) =>
            item.nom.toLowerCase().includes(q.toLowerCase()) ||
            item.poste.toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="equipe-serein-ge.csv"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Modifier le Membre' : 'Nouveau Membre de l\'Équipe'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nom & Titre *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Ing. Patrice COMPAORÉ"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Poste / Fonction *</label>
              <input
                type="text"
                required
                value={formData.poste}
                onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                placeholder="Ex: Directeur Technique"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Département</label>
              {isSupabaseConfigured ? (
                <select
                  value={formData.department_id || ''}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value || null })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="">— Aucun —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.nom}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={formData.department_nom}
                  onChange={(e) => setFormData({ ...formData, department_nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {DEMO_DEPARTMENT_NAMES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">URL Photo</label>
              <input
                type="text"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Biographie sommaire</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300">
              {formError}
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-bold shadow-glow-emerald flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
