import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Archive, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { JobOffer } from '../types';
import { formatDate } from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_JOBS_ADMIN: JobOffer[] = [
  {
    id: 'j1',
    titre: 'Ingénieur Géomètre-Topographe Senior (H/F)',
    slug: 'ingenieur-geometre-topographe-senior',
    departement: 'Topographie & Géodésie',
    type_contrat: 'CDI',
    lieu: 'Ouagadougou avec déplacements chantiers',
    salaire_indicatif: 'Selon profil et expérience (Grille SEREIN-GE)',
    date_limite: '2026-10-31',
    description: 'Encadrement des brigades topographiques de terrain et supervision des calculs géodésiques.',
    statut: 'active',
    created_at: '2026-08-01',
  },
  {
    id: 'j2',
    titre: 'Technico-Commercial Vente Matériel Topographique & Drones (H/F)',
    slug: 'technico-commercial-materiel-topo-drones',
    departement: 'Distribution de Matériel',
    type_contrat: 'CDI',
    lieu: 'Ouagadougou',
    salaire_indicatif: 'Fixe motivant + Commissions sur ventes',
    date_limite: '2026-09-30',
    description: 'Développement du portefeuille clients et démonstrations terrain des récepteurs CHCNAV & Toknav.',
    statut: 'active',
    created_at: '2026-08-10',
  }
];

const EMPTY_FORM: Partial<JobOffer> = {
  titre: '',
  slug: '',
  departement: 'Topographie & Géodésie',
  type_contrat: 'CDI',
  lieu: 'Ouagadougou, Burkina Faso',
  salaire_indicatif: 'Selon profil',
  date_limite: '2026-12-31',
  description: '',
  statut: 'active',
};

export default function JobsManager() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null);
  const [formData, setFormData] = useState<Partial<JobOffer>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadJobs = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setJobs(INITIAL_JOBS_ADMIN);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('job_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError("Impossible de charger les offres d'emploi : " + error.message);
    } else {
      setJobs((data || []) as JobOffer[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormError(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job: JobOffer) => {
    setEditingJob(job);
    setFormError(null);
    setFormData(job);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cette offre ?')) return;

    if (!isSupabaseConfigured || !supabase) {
      setJobs(jobs.filter((j) => j.id !== id));
      return;
    }

    setBusyId(id);
    const { error } = await supabase.from('job_offers').delete().eq('id', id);
    setBusyId(null);

    if (error) {
      alert("Échec de la suppression : " + error.message);
      return;
    }
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const handleToggleArchive = async (job: JobOffer) => {
    const newStatut = job.statut === 'active' ? 'archivee' : 'active';

    if (!isSupabaseConfigured || !supabase) {
      setJobs(jobs.map((j) => (j.id === job.id ? { ...j, statut: newStatut } : j)));
      return;
    }

    setBusyId(job.id);
    const { error } = await supabase.from('job_offers').update({ statut: newStatut }).eq('id', job.id);
    setBusyId(null);

    if (error) {
      alert("Échec de la mise à jour du statut : " + error.message);
      return;
    }
    setJobs(jobs.map((j) => (j.id === job.id ? { ...j, statut: newStatut } : j)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titre || !formData.description) return;

    const slug = formData.slug || formData.titre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!isSupabaseConfigured || !supabase) {
      if (editingJob) {
        setJobs(jobs.map((j) => (j.id === editingJob.id ? { ...j, ...formData, slug } as JobOffer : j)));
      } else {
        const newJob: JobOffer = {
          ...formData,
          id: `j_${Date.now()}`,
          slug,
          created_at: new Date().toISOString(),
        } as JobOffer;
        setJobs([newJob, ...jobs]);
      }
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      titre: formData.titre,
      slug,
      departement: formData.departement,
      type_contrat: formData.type_contrat,
      lieu: formData.lieu,
      salaire_indicatif: formData.salaire_indicatif || null,
      date_limite: formData.date_limite || null,
      description: formData.description,
      statut: formData.statut,
    };

    if (editingJob) {
      const { data, error } = await supabase
        .from('job_offers')
        .update(payload)
        .eq('id', editingJob.id)
        .select()
        .single();

      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || "Échec de la mise à jour de l'offre");
        return;
      }
      setJobs(jobs.map((j) => (j.id === editingJob.id ? (data as JobOffer) : j)));
    } else {
      const { data, error } = await supabase
        .from('job_offers')
        .insert(payload)
        .select()
        .single();

      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || "Échec de la création de l'offre");
        return;
      }
      setJobs([data as JobOffer, ...jobs]);
    }

    setIsModalOpen(false);
  };

  const columns: Column<JobOffer>[] = [
    {
      header: 'Poste & Département',
      render: (j) => (
        <div>
          <div className="font-bold text-white text-xs">{j.titre}</div>
          <div className="text-[10px] text-emerald-400 font-mono">{j.departement} • {j.type_contrat}</div>
        </div>
      ),
    },
    {
      header: 'Lieu',
      accessor: 'lieu',
    },
    {
      header: 'Date Limite',
      render: (j) => (
        <span className="text-xs text-slate-300">{formatDate(j.date_limite)}</span>
      ),
    },
    {
      header: 'Statut',
      render: (j) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          j.statut === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
        }`}>
          {j.statut}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (j) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleArchive(j)}
            disabled={busyId === j.id}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 disabled:opacity-40"
            title={j.statut === 'active' ? 'Archiver' : 'Activer'}
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(j)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(j.id)}
            disabled={busyId === j.id}
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
          <h2 className="text-xl font-bold font-display text-white">Gestion des Offres d'Emploi</h2>
          <p className="text-xs text-slate-400">Création, publication et archivage des postes ouverts chez SEREIN-GE.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publier une Offre</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={loadJobs}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des offres...</span>
        </div>
      ) : (
        <DataTable
          data={jobs}
          columns={columns}
          searchPlaceholder="Rechercher une offre..."
          searchFilter={(item, q) => item.titre.toLowerCase().includes(q.toLowerCase())}
          exportFileName="offres-serein-ge.csv"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? 'Modifier l\'Offre' : 'Créer une Offre d\'Emploi'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Intitulé du Poste *</label>
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
              <label className="block font-semibold text-slate-300 mb-1">Département *</label>
              <select
                value={formData.departement}
                onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Topographie & Géodésie">Topographie & Géodésie</option>
                <option value="Géomatique & SIG">Géomatique & SIG</option>
                <option value="Ingénierie & BTP">Ingénierie & BTP</option>
                <option value="Distribution de Matériel">Distribution de Matériel</option>
                <option value="Administration & RH">Administration & RH</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Type de Contrat</label>
              <select
                value={formData.type_contrat}
                onChange={(e) => setFormData({ ...formData, type_contrat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Prestation / Consultant">Prestation / Consultant</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Lieu d'Affectation</label>
              <input
                type="text"
                value={formData.lieu}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Date Limite de Dépôt</label>
              <input
                type="date"
                value={formData.date_limite}
                onChange={(e) => setFormData({ ...formData, date_limite: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description & Profil Recherché *</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
