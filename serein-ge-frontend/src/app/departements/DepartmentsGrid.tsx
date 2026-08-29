'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, Layers, Building2, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';
import { INITIAL_DEPARTMENTS } from '../../lib/mock-data';
import { useSupabaseList } from '../../lib/useSupabaseData';

export default function DepartmentsGrid() {
  const { data: departments } = useSupabaseList('departments', INITIAL_DEPARTMENTS, { orderColumn: 'ordre' });

  const icons = [
    <Compass className="w-8 h-8 text-emerald-400" key="1" />,
    <Layers className="w-8 h-8 text-teal-400" key="2" />,
    <Building2 className="w-8 h-8 text-cyan-400" key="3" />,
    <Cpu className="w-8 h-8 text-amber-400" key="4" />,
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {departments.map((dept, idx) => {
        const isEven = idx % 2 === 1;
        return (
          <div
            key={dept.id}
            id={dept.slug}
            className={`glass-panel rounded-3xl p-8 lg:p-12 border border-slate-800 flex flex-col ${
              isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'
            } gap-10 items-center`}
          >
            <div className="w-full lg:w-1/2 relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50 shrink-0">
              <Image
                src={dept.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'}
                alt={dept.nom}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-between">
              <div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 w-fit mb-4">
                  {icons[idx % icons.length]}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  {dept.nom}
                </h2>
                <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                  {dept.description}
                </p>

                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Mobilisation rapide de brigades mobiles équipées GNSS RTK</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Rapports techniques certifiés et conformes aux normes nationales</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Accompagnement méthodologique et post-traitement de données</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href={`/departements/${dept.slug}/`}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition inline-flex items-center gap-2"
                >
                  <span>Fiche Détaillée du Pôle</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  Demander une Étude
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
