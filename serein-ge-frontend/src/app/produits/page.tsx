'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { INITIAL_PRODUCTS } from '../../lib/mock-data';
import { useSupabaseList } from '../../lib/useSupabaseData';

export default function ProductsCatalogPage() {
  const { data: allProducts } = useSupabaseList('products', INITIAL_PRODUCTS, { orderColumn: 'created_at', ascending: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Toutes');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  const brands = ['Toutes', 'CHCNAV', 'Toknav', 'FOIF', 'DJI Enterprise'];
  const categories = [
    'Toutes',
    'Récepteurs GNSS RTK',
    'Stations Totales',
    'Drones & LiDAR',
    'Carnets & Logiciels',
  ];

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch =
        product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description_courte.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand = selectedBrand === 'Toutes' || product.marque === selectedBrand;
      const matchesCategory = selectedCategory === 'Toutes' || product.categorie === selectedCategory;

      return matchesSearch && matchesBrand && matchesCategory;
    }).sort((a, b) => {
      const priceA = a.prix_promo_fcfa || a.prix_fcfa;
      const priceB = b.prix_promo_fcfa || b.prix_fcfa;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name') return a.nom.localeCompare(b.nom);
      return (b.en_vedette ? 1 : 0) - (a.en_vedette ? 1 : 0);
    });
  }, [allProducts, searchQuery, selectedBrand, selectedCategory, sortBy]);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Header Banner */}
      <section className="py-16 bg-slate-900/70 border-b border-slate-800 bg-grid-pattern text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Boutique & Distribution Officielle
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-3">
            Matériel Topographique & GNSS de Haute Précision
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Distributeur agréé <strong>CHCNAV</strong>, <strong>Toknav</strong> et <strong>FOIF</strong> au Burkina Faso. Garantie 2 ans, étalonnage certifié et stock disponible immédiatement à Ouagadougou.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un modèle (ex: i90, T20 Pro, Station Totale, Drone...)"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 shadow-xl"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content: Filters + Products Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filters and Sorters Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80 mb-10">
          
          {/* Brand Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            <span className="text-xs text-slate-500 uppercase font-semibold mr-1">Marque:</span>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedBrand === brand
                    ? 'bg-emerald-500 text-white shadow-glow-emerald'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Category & Sorting Selectors */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase font-semibold">Catégorie:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase font-semibold">Trier:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="featured">En Vedette</option>
                <option value="price-asc">Prix: Moins cher</option>
                <option value="price-desc">Prix: Plus cher</option>
                <option value="name">Nom alphabétique</option>
              </select>
            </div>
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
          <span>Affichage de <strong>{filteredProducts.length}</strong> instruments disponibles</span>
          {(selectedBrand !== 'Toutes' || selectedCategory !== 'Toutes' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedBrand('Toutes');
                setSelectedCategory('Toutes');
                setSearchQuery('');
              }}
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Réinitialiser les filtres</span>
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center max-w-lg mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">Aucun équipement trouvé</h3>
            <p className="text-xs text-slate-400 mt-2">
              Modifiez vos critères de recherche ou contactez-nous pour commander un équipement spécifique.
            </p>
          </div>
        )}

      </section>

    </div>
  );
}
