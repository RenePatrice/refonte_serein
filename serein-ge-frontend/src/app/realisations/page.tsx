'use client';

import React, { useState } from 'react';
import RealisationCard from '../../components/RealisationCard';
import { INITIAL_REALISATIONS } from '../../lib/mock-data';
import { useSupabaseList } from '../../lib/useSupabaseData';

export default function RealisationsPage() {
  const { data: allRealisations } = useSupabaseList('realisations', INITIAL_REALISATIONS, { orderColumn: 'created_at', ascending: false });
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const categories = ['Tous', 'Topographie', 'Géomatique', 'Hydraulique', 'BTP / VRD', 'Mines & Carrières'];

  const filteredRealisations = selectedCategory === 'Tous'
    ? allRealisations
    : allRealisations.filter((r) => r.categorie === selectedCategory);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Header Banner */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800 bg-grid-pattern text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Portfolio & Références</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-3">
            Nos Projets & Réalisations Phares
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Découvrez nos interventions géodésiques, nos modélisations 3D, nos auscultations d'ouvrages d'art et nos cadastres urbains à travers le Burkina Faso et l'Afrique de l'Ouest.
          </p>
        </div>
      </section>

      {/* Filter Tabs & Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Filters */}
        <div className="flex items-center justify-center flex-wrap gap-2.5 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white font-bold shadow-glow-emerald'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRealisations.map((realisation) => (
            <RealisationCard key={realisation.id} realisation={realisation} />
          ))}
        </div>

      </section>

    </div>
  );
}
