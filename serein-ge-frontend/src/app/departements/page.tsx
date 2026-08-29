import React from 'react';
import DepartmentsGrid from './DepartmentsGrid';

export const metadata = {
  title: 'Nos Départements & Métiers | SEREIN-GE',
  description: 'Découvrez les 4 pôles d\'expertise de SEREIN-GE : Topographie & Géodésie, Géomatique & SIG, Ingénierie & BTP, Distribution de Matériel & Support.',
};

export default function DepartmentsPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">

      {/* Header */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800 bg-grid-pattern text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Nos Domaines d'Expertise</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-3">
            Pôles d'Ingénierie & Services
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Une expertise technique pointue pour vos études foncières, vos travaux publics, la gestion spatiale de vos territoires et la fourniture d'instruments de précision.
          </p>
        </div>
      </section>

      {/* Departments Detailed Grid */}
      <DepartmentsGrid />

    </div>
  );
}
