import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Sparkles, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { Realisation } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_REALISATIONS_ADMIN: Realisation[] = [
  {
    id: 'r1',
    titre: 'Levé Topographique & Modélisation 3D pour le Corridor Routier Ouaga-Kaya (105 km)',
    slug: 'leve-topo-corridor-ouaga-kaya',
    client: 'Ministère des Infrastructures du Burkina Faso',
    date_realisation: '2025-11-15',
    lieu: 'Région du Centre-Nord, Burkina Faso',
    categorie: 'Topographie',
    description: 'Réalisation des études topographiques détaillées d\'axe routier.',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
    a_la_une: true,
    is_published: true,
  },
  {
    id: 'r2',
    titre: 'Numérisation Cadastrale & Mise en Place du SIG Urbain de Bobo-Dioulasso',
    slug: 'sig-urbain-bobo-dioulasso',
    client: 'Commune Urbaine de Bobo-Dioulasso',
    date_realisation: '2025-08-20',
    lieu: 'Bobo-Dioulasso, Burkina Faso',
    categorie: 'Géomatique',
    description: 'Acquisition d\'orthophotographies par drone haute résolution.',
    images: ['https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80'],
    a_la_une: true,
    is_published: true,
  },
  {
    id: 'r3',
    titre: 'Auscultation Géométrique & Suivi de Stabilité du Barrage de Bagré',
    slug: 'auscultation-barrage-bagre',
    client: 'Bagrepôle',
    date_realisation: '2026-02-10',
    lieu: 'Bagré, Région du Centre-Est',
    categorie: 'Hydraulique',
    description: 'Surveillance géodésique de haute précision pour la détection millimétrique des déformations.',
    images: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80'],
    a_la_une: false,
    is_published: true,
  }
];

const EMPTY_FORM: Partial<Realisation> = {
  titre: '',
  slug: '',
  client: '',
  lieu: 'Burkina Faso',
  categorie: 'Topographie',
  description: '',
  images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
  a_la_une: false,
  is_published: true,
};

export default function RealisationsManager() {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Realisation | null>(null);
  const [formData, setFormData] = useState<Partial<Realisation>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadRealisations = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setRealisations(INITIAL_REALISATIONS_ADMIN);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('realisations').select('*').order('created_at', { ascending: false });

    if (error) {
      setLoadError('Impossible de charger les réalisations : ' + error.message);
    } else {
      setRealisations((data || []) as Realisation[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRealisations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormError(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Realisation) => {
    setEditingItem(r);
    setFormError(null);
    setFormData(r);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce projet ?')) return;

    if (!isSupabaseConfigured || !supabase) {
      setRealisations(realisations.filter((r) => r.id !== id));
      return;
    }

    setBusyId(id);
    const { error } = await supabase.from('realisations').delete().eq('id', id);
    setBusyId(null);

    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setRealisations(realisations.filter((r) => r.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titre || !formData.client) return;

    const slug = formData.slug || formData.titre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!isSupabaseConfigured || !supabase) {
      if (editingItem) {
        setRealisations(realisations.map((r) => (r.id === editingItem.id ? { ...r, ...formData, slug } as Realisation : r)));
      } else {
        const newR: Realisation = { ...formData, id: `r_${Date.now()}`, slug } as Realisation;
        setRealisations([newR, ...realisations]);
      }
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      titre: formData.titre,
      slug,
      client: formData.client,
      date_realisation: formData.date_realisation || null,
      lieu: formData.lieu,
      categorie: formData.categorie,
      description: formData.description,
      images: formData.images || [],
      a_la_une: formData.a_la_une,
      is_published: formData.is_published,
    };

    if (editingItem) {
      const { data, error } = await supabase.from('realisations').update(payload).eq('id', editingItem.id).select().single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || 'Échec de la mise à jour de la réalisation');
        return;
      }
      setRealisations(realisations.map((r) => (r.id === editingItem.id ? (data as Realisation) : r)));
    } else {
      const { data, error } = await supabase.from('realisations').insert(payload).select().single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || 'Échec de la création de la réalisation');
        return;
      }
      setRealisations([data as Realisation, ...realisations]);
    }

    setIsModalOpen(false);
  };

  const columns: Column<Realisation>[] = [
    {
      header: 'Projet',
      render: (r) => (
        <div className="flex items-center space-x-3">
          <img src={r.images[0]} alt={r.titre} className="w-12 h-9 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700" />
          <div className="max-w-md">
            <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
              <span>{r.titre}</span>
              {r.a_la_une && <Sparkles className="w-3 h-3 text-amber-400" />}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">{r.categorie} • {r.lieu}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Client / Donneur d\'Ordre',
      accessor: 'client',
    },
    {
      header: 'À la une',
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.a_la_une ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
          {r.a_la_une ? 'En vedette' : 'Standard'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            disabled={busyId === r.id}
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
          <h2 className="text-xl font-bold font-display text-white">Gestion des Réalisations & Projets</h2>
          <p className="text-xs text-slate-400">CRUD des chantiers d'ingénierie, galeries photo et mise en avant « À la une ».</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Projet</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadRealisations} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des réalisations...</span>
        </div>
      ) : (
        <DataTable
          data={realisations}
          columns={columns}
          searchPlaceholder="Rechercher un projet, client..."
          searchFilter={(item, q) =>
            item.titre.toLowerCase().includes(q.toLowerCase()) ||
            item.client.toLowerCase().includes(q.toLowerCase()) ||
            item.categorie.toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="realisations-serein-ge.csv"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Modifier la Réalisation' : 'Nouveau Projet / Réalisation'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Titre du Projet *</label>
            <input
              type="text"
              required
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Client *</label>
              <input
                type="text"
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Catégorie *</label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Topographie">Topographie</option>
                <option value="Géomatique">Géomatique</option>
                <option value="Hydraulique">Hydraulique</option>
                <option value="BTP / VRD">BTP / VRD</option>
                <option value="Mines & Carrières">Mines & Carrières</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Date de Réalisation</label>
              <input
                type="date"
                value={formData.date_realisation || ''}
                onChange={(e) => setFormData({ ...formData, date_realisation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Lieu d'Intervention</label>
              <input
                type="text"
                value={formData.lieu}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">URL Image Principale</label>
              <input
                type="text"
                value={formData.images ? formData.images[0] : ''}
                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description Technique</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.a_la_une}
                onChange={(e) => setFormData({ ...formData, a_la_une: e.target.checked })}
              />
              <span>Mettre « À la une » sur l'accueil</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              />
              <span>Publié sur le site</span>
            </label>
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
              className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800"
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
