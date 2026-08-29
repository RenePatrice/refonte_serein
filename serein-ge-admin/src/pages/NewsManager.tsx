import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { Article } from '../types';
import { formatDate } from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_NEWS_ADMIN: Article[] = [
  {
    id: 'a1',
    titre: 'SEREIN-GE devient distributeur agréé Toknav Technology au Burkina Faso',
    slug: 'serein-ge-distributeur-agreed-toknav-burkina',
    extrait: 'Une nouvelle gamme de récepteurs GNSS à réalité augmentée et caméras d\'implantation visuelle débarque à Ouagadougou.',
    contenu: 'Nous sommes particulièrement fiers d\'annoncer la signature de notre partenariat officiel de distribution...',
    image_couverture: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    categorie: 'Partenariat & Innovation',
    statut: 'publie',
    date_publication: '2026-08-20',
    vues: 342,
  },
  {
    id: 'a2',
    titre: 'Comment le GNSS avec centrale inertielle IMU optimise les cadences de levé sur le terrain',
    slug: 'impact-imu-gnss-sur-cadences-terrain',
    extrait: 'Découvrez comment supprimer l\'obligation de verticalité de la canne permet de gagner plus de 30% de temps.',
    contenu: 'Pendant des décennies, l\'arpenteur devait impérativement caler sa bulle de niveau à chaque point...',
    image_couverture: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    categorie: 'Expertise Technique',
    statut: 'publie',
    date_publication: '2026-08-12',
    vues: 518,
  }
];

const EMPTY_FORM: Partial<Article> = {
  titre: '',
  slug: '',
  extrait: '',
  contenu: '',
  image_couverture: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  categorie: 'Général',
  statut: 'publie',
};

export default function NewsManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadArticles = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setArticles(INITIAL_NEWS_ADMIN);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('actualites').select('*').order('date_publication', { ascending: false });

    if (error) {
      setLoadError('Impossible de charger les actualités : ' + error.message);
    } else {
      setArticles((data || []) as Article[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormError(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: Article) => {
    setEditingArticle(article);
    setFormError(null);
    setFormData(article);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cet article ?')) return;

    if (!isSupabaseConfigured || !supabase) {
      setArticles(articles.filter((a) => a.id !== id));
      return;
    }

    setBusyId(id);
    const { error } = await supabase.from('actualites').delete().eq('id', id);
    setBusyId(null);

    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setArticles(articles.filter((a) => a.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titre || !formData.contenu) return;

    const slug = formData.slug || formData.titre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!isSupabaseConfigured || !supabase) {
      if (editingArticle) {
        setArticles(articles.map((a) => (a.id === editingArticle.id ? { ...a, ...formData, slug } as Article : a)));
      } else {
        const newArticle: Article = {
          ...formData,
          id: `a_${Date.now()}`,
          slug,
          vues: 0,
          date_publication: new Date().toISOString(),
        } as Article;
        setArticles([newArticle, ...articles]);
      }
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: any = {
      titre: formData.titre,
      slug,
      extrait: formData.extrait,
      contenu: formData.contenu,
      image_couverture: formData.image_couverture || null,
      categorie: formData.categorie,
      statut: formData.statut,
    };

    if (editingArticle) {
      const { data, error } = await supabase.from('actualites').update(payload).eq('id', editingArticle.id).select().single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || "Échec de la mise à jour de l'article");
        return;
      }
      setArticles(articles.map((a) => (a.id === editingArticle.id ? (data as Article) : a)));
    } else {
      payload.date_publication = new Date().toISOString();
      const { data, error } = await supabase.from('actualites').insert(payload).select().single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || "Échec de la création de l'article");
        return;
      }
      setArticles([data as Article, ...articles]);
    }

    setIsModalOpen(false);
  };

  const columns: Column<Article>[] = [
    {
      header: 'Article & Titre',
      render: (a) => (
        <div className="flex items-center space-x-3">
          <img src={a.image_couverture} alt={a.titre} className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700" />
          <div className="max-w-md">
            <div className="font-bold text-white text-xs truncate">{a.titre}</div>
            <span className="text-[10px] text-emerald-400 font-mono">{a.categorie}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Date & Vues',
      render: (a) => (
        <div className="text-xs text-slate-400">
          <div>{formatDate(a.date_publication)}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{a.vues} consultations</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (a) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          a.statut === 'publie' ? 'bg-emerald-500/20 text-emerald-400' :
          a.statut === 'planifie' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
        }`}>
          {a.statut}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (a) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEdit(a)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(a.id)}
            disabled={busyId === a.id}
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
          <h2 className="text-xl font-bold font-display text-white">Gestion des Actualités & Blog</h2>
          <p className="text-xs text-slate-400">Rédaction d'articles techniques, annonces de partenariats et gestion des statuts de publication.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Rédiger un Article</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadArticles} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des actualités...</span>
        </div>
      ) : (
        <DataTable
          data={articles}
          columns={columns}
          searchPlaceholder="Rechercher un article, catégorie..."
          searchFilter={(item, q) =>
            item.titre.toLowerCase().includes(q.toLowerCase()) ||
            item.categorie.toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="actualites-serein-ge.csv"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticle ? 'Modifier l\'Article' : 'Rédiger une Nouvelle Actualité'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Titre de l'Article *</label>
            <input
              type="text"
              required
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Catégorie</label>
              <input
                type="text"
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="publie">Publié</option>
                <option value="brouillon">Brouillon</option>
                <option value="planifie">Planifié</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">URL Image Couverture</label>
              <input
                type="text"
                value={formData.image_couverture}
                onChange={(e) => setFormData({ ...formData, image_couverture: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Extrait / Chapô *</label>
            <textarea
              rows={2}
              required
              value={formData.extrait}
              onChange={(e) => setFormData({ ...formData, extrait: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Corps de l'Article (Markdown / Texte enrichi) *</label>
            <textarea
              rows={6}
              required
              value={formData.contenu}
              onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
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
              <span>Enregistrer l'Article</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
