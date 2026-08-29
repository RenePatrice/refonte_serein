import React from 'react';
import NewsGrid from './NewsGrid';

export const metadata = {
  title: 'Actualités & Veille Technologique | SEREIN-GE',
  description: 'Suivez les actualités géomatiques, les innovations CHCNAV et Toknav et la vie du cabinet SEREIN-GE.',
};

export default function NewsPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">

      {/* Header Banner */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800 bg-grid-pattern text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Blog & Veille Technique</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-3">
            Actualités & Innovations
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Découvrez nos articles sur les évolutions du matériel topographique, les bonnes pratiques terrain et les actualités de SEREIN-GE au Burkina Faso.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewsGrid />
      </section>

    </div>
  );
}
