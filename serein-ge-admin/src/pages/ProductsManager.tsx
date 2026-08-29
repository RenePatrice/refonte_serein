import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Sparkles, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../lib/mock-admin-data';
import { formatFCFA } from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const EMPTY_FORM: Partial<Product> = {
  nom: '',
  slug: '',
  marque: 'CHCNAV',
  categorie: 'Récepteurs GNSS RTK',
  description_courte: '',
  description_complete: '',
  prix_fcfa: 3500000,
  prix_promo_fcfa: null,
  stock: 5,
  stock_alerte: 2,
  images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
  specs_techniques: {},
  en_vedette: false,
  is_active: true,
};

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts(INITIAL_PRODUCTS);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (error) {
      setLoadError('Impossible de charger le catalogue : ' + error.message);
    } else {
      setProducts((data || []) as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormError(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormError(null);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet équipement du catalogue ?')) return;

    if (!isSupabaseConfigured || !supabase) {
      setProducts(products.filter((p) => p.id !== id));
      return;
    }

    setBusyId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    setBusyId(null);

    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.prix_fcfa) return;

    const slug = formData.slug || formData.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!isSupabaseConfigured || !supabase) {
      if (editingProduct) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? { ...p, ...formData, slug } as Product : p)));
      } else {
        const newProduct: Product = { ...formData, id: `p_${Date.now()}`, slug } as Product;
        setProducts([newProduct, ...products]);
      }
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      nom: formData.nom,
      slug,
      marque: formData.marque,
      categorie: formData.categorie,
      description_courte: formData.description_courte,
      description_complete: formData.description_complete,
      prix_fcfa: formData.prix_fcfa,
      prix_promo_fcfa: formData.prix_promo_fcfa || null,
      stock: formData.stock,
      stock_alerte: formData.stock_alerte,
      images: formData.images || [],
      specs_techniques: formData.specs_techniques || {},
      en_vedette: formData.en_vedette,
      is_active: formData.is_active,
    };

    if (editingProduct) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editingProduct.id).select().single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || 'Échec de la mise à jour du produit');
        return;
      }
      setProducts(products.map((p) => (p.id === editingProduct.id ? (data as Product) : p)));
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || 'Échec de la création du produit');
        return;
      }
      setProducts([data as Product, ...products]);
    }

    setIsModalOpen(false);
  };

  const columns: Column<Product>[] = [
    {
      header: 'Instrument',
      render: (p) => (
        <div className="flex items-center space-x-3">
          <img src={p.images[0]} alt={p.nom} className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700" />
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{p.nom}</span>
              {p.en_vedette && <Sparkles className="w-3 h-3 text-amber-400" />}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono uppercase">{p.marque} • {p.categorie}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Prix Unitaire',
      render: (p) => (
        <div>
          <div className="font-bold text-emerald-400 font-display">{formatFCFA(p.prix_promo_fcfa || p.prix_fcfa)}</div>
          {p.prix_promo_fcfa && <div className="text-[10px] line-through text-slate-500">{formatFCFA(p.prix_fcfa)}</div>}
        </div>
      ),
    },
    {
      header: 'Stock & Alerte',
      render: (p) => (
        <div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            p.stock <= p.stock_alerte
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {p.stock} en stock (seuil: {p.stock_alerte})
          </span>
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (p) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.is_active ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
          {p.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEdit(p)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Modifier"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(p.id)}
            disabled={busyId === p.id}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition disabled:opacity-40"
            title="Supprimer"
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
          <h2 className="text-xl font-bold font-display text-white">Gestion du Catalogue d'Instruments</h2>
          <p className="text-xs text-slate-400">Ajout, modification, gestion des prix en FCFA et contrôle des stocks de matériel.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Instrument</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadProducts} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement du catalogue...</span>
        </div>
      ) : (
        <DataTable
          data={products}
          columns={columns}
          searchPlaceholder="Rechercher par nom, marque, catégorie..."
          searchFilter={(item, q) =>
            item.nom.toLowerCase().includes(q.toLowerCase()) ||
            item.marque.toLowerCase().includes(q.toLowerCase()) ||
            item.categorie.toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="catalogue-serein-ge.csv"
        />
      )}

      {/* Product Edit / Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Modifier l\'Instrument' : 'Nouvel Instrument Topographique'}
        subtitle="Renseignez les spécifications et caractéristiques techniques."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nom du Produit *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: CHCNAV i90 GNSS RTK"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Marque *</label>
              <select
                value={formData.marque}
                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="CHCNAV">CHCNAV</option>
                <option value="Toknav">Toknav</option>
                <option value="FOIF">FOIF</option>
                <option value="DJI Enterprise">DJI Enterprise</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Catégorie *</label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Récepteurs GNSS RTK">Récepteurs GNSS RTK</option>
                <option value="Stations Totales">Stations Totales</option>
                <option value="Drones & LiDAR">Drones & LiDAR</option>
                <option value="Carnets & Logiciels">Carnets & Logiciels</option>
                <option value="Accessoires">Accessoires</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Prix Standard (FCFA) *</label>
              <input
                type="number"
                required
                min={0}
                value={formData.prix_fcfa}
                onChange={(e) => setFormData({ ...formData, prix_fcfa: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Prix Promo (FCFA, optionnel)</label>
              <input
                type="number"
                min={0}
                value={formData.prix_promo_fcfa || ''}
                onChange={(e) => setFormData({ ...formData, prix_promo_fcfa: e.target.value ? parseInt(e.target.value, 10) : null })}
                placeholder="Laisser vide si pas de promo"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Stock Disponible *</label>
              <input
                type="number"
                required
                min={0}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Seuil Alerte Stock</label>
              <input
                type="number"
                min={1}
                value={formData.stock_alerte}
                onChange={(e) => setFormData({ ...formData, stock_alerte: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">URL Image Principale</label>
              <input
                type="text"
                value={formData.images ? formData.images[0] : ''}
                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description Courte</label>
            <textarea
              rows={2}
              value={formData.description_courte}
              onChange={(e) => setFormData({ ...formData, description_courte: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description Complète</label>
            <textarea
              rows={3}
              value={formData.description_complete}
              onChange={(e) => setFormData({ ...formData, description_complete: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.en_vedette}
                onChange={(e) => setFormData({ ...formData, en_vedette: e.target.checked })}
                className="rounded text-emerald-500 focus:ring-emerald-500"
              />
              <span>Mettre en Vedette (Page d'accueil)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded text-emerald-500 focus:ring-emerald-500"
              />
              <span>Actif dans la boutique</span>
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
              className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-bold shadow-glow-emerald hover:bg-emerald-400 flex items-center gap-2 disabled:opacity-50"
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
