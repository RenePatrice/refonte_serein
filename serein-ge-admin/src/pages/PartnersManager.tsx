import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Globe, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { Partner } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_PARTNERS_ADMIN: Partner[] = [
  {
    id: 'par1',
    nom: 'CHCNAV (Huace Navigation)',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    site_web: 'https://chcnav.com',
    categorie: 'Constructeur',
    ordre: 1,
    is_active: true,
  },
  {
    id: 'par2',
    nom: 'Toknav Technology',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    site_web: 'https://toknav.com',
    categorie: 'Constructeur',
    ordre: 2,
    is_active: true,
  },
  {
    id: 'par3',
    nom: 'FOIF Precision Instruments',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    site_web: 'https://foif.com',
    categorie: 'Constructeur',
    ordre: 3,
    is_active: true,
  },
  {
    id: 'par4',
    nom: 'DJI Enterprise',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    site_web: 'https://enterprise.dji.com',
    categorie: 'Constructeur',
    ordre: 4,
    is_active: true,
  }
];

const EMPTY_FORM: Partial<Partner> = {
  nom: '',
  logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
  site_web: '',
  categorie: 'Constructeur',
  ordre: 1,
  is_active: true,
};

export default function PartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<Partial<Partner>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPartners = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setPartners(INITIAL_PARTNERS_ADMIN);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('partners').select('*').order('ordre', { ascending: true });

    if (error) {
      setLoadError('Impossible de charger les partenaires : ' + error.message);
    } else {
      setPartners((data || []) as Partner[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAdd = () => {
    setEditingPartner(null);
    setFormError(null);
    setFormData({ ...EMPTY_FORM, ordre: partners.length + 1 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Partner) => {
    setEditingPartner(p);
    setFormError(null);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce partenaire ?')) return;

    if (!isSupabaseConfigured || !supabase) {
      setPartners(partners.filter((p) => p.id !== id));
      return;
    }

    setBusyId(id);
    const { error } = await supabase.from('partners').delete().eq('id', id);
    setBusyId(null);

    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setPartners(partners.filter((p) => p.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom) return;

    if (!isSupabaseConfigured || !supabase) {
      if (editingPartner) {
        setPartners(partners.map((p) => (p.id === editingPartner.id ? { ...p, ...formData } as Partner : p)));
      } else {
        const newP: Partner = { ...formData, id: `par_${Date.now()}` } as Partner;
        setPartners([...partners, newP]);
      }
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      nom: formData.nom,
      logo_url: formData.logo_url,
      site_web: formData.site_web || null,
      categorie: formData.categorie,
      ordre: formData.ordre,
      is_active: formData.is_active,
    };

    if (editingPartner) {
      const { data, error } = await supabase.from('partners').update(payload).eq('id', editingPartner.id).select().single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || 'Échec de la mise à jour du partenaire');
        return;
      }
      setPartners(partners.map((p) => (p.id === editingPartner.id ? (data as Partner) : p)));
    } else {
      const { data, error } = await supabase.from('partners').insert(payload).select().single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || 'Échec de la création du partenaire');
        return;
      }
      setPartners([...partners, data as Partner]);
    }

    setIsModalOpen(false);
  };

  const columns: Column<Partner>[] = [
    {
      header: 'Partenaire',
      render: (p) => (
        <div className="flex items-center space-x-3">
          <img src={p.logo_url} alt={p.nom} className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700" />
          <div>
            <div className="font-bold text-white text-xs">{p.nom}</div>
            <span className="text-[10px] text-emerald-400 font-mono">{p.categorie}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Site Web',
      render: (p) => (
        p.site_web ? (
          <a href={p.site_web} target="_blank" rel="noreferrer" className="text-xs text-slate-300 hover:text-emerald-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">{p.site_web}</span>
          </a>
        ) : <span className="text-slate-500 text-xs">-</span>
      ),
    },
    {
      header: 'Ordre',
      accessor: 'ordre',
    },
    {
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEdit(p)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(p.id)}
            disabled={busyId === p.id}
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
          <h2 className="text-xl font-bold font-display text-white">Gestion des Partenaires & Constructeurs</h2>
          <p className="text-xs text-slate-400">CRUD des logos des constructeurs partenaires et ordre d'affichage.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Partenaire</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadPartners} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des partenaires...</span>
        </div>
      ) : (
        <DataTable
          data={partners}
          columns={columns}
          searchPlaceholder="Rechercher un partenaire..."
          searchFilter={(item, q) => item.nom.toLowerCase().includes(q.toLowerCase())}
          exportFileName="partenaires-serein-ge.csv"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPartner ? 'Modifier le Partenaire' : 'Nouveau Partenaire'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nom de l'Entité / Constructeur *</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Catégorie</label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Constructeur">Constructeur</option>
                <option value="Institutionnel">Institutionnel</option>
                <option value="Client Partenaire">Client Partenaire</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Site Web Officiel</label>
              <input
                type="url"
                value={formData.site_web}
                onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">URL Logo</label>
            <input
              type="text"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
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
