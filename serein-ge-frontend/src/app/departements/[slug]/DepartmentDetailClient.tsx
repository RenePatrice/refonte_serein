'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, ArrowLeft, Phone } from 'lucide-react';
import { Department } from '../../../types';
import { INITIAL_DEPARTMENTS } from '../../../lib/mock-data';
import { useSupabaseItem, useSupabaseList } from '../../../lib/useSupabaseData';

interface DepartmentDetailClientProps {
  department: Department;
}

export default function DepartmentDetailClient({ department: initialDept }: DepartmentDetailClientProps) {
  const dept = useSupabaseItem('departments', initialDept.slug, initialDept);
  const { data: allDepartments } = useSupabaseList('departments', INITIAL_DEPARTMENTS, { orderColumn: 'ordre' });

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">

      {/* Breadcrumb & Hero */}
      <div className="border-b border-slate-800 bg-slate-900/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/departements"
            className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour aux départements</span>
          </Link>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Pôle Spécialisé</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-2">
            {dept.nom}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            {dept.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-slate-900 relative border border-slate-800">
              <Image
                src={dept.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'}
                alt={dept.nom}
                fill
                className="object-cover"
              />
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
              <h2 className="text-2xl font-bold text-white font-display">
                Missions & Prestations Assurées
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Notre pôle <strong>{dept.nom}</strong> intervient avec une rigueur méthodologique éprouvée et des équipements certifiés de dernière génération. Nous nous engageons à respecter scrupuleusement les délais impartis et les tolérances géométriques les plus exigeantes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-semibold text-white text-sm">Équipements Haute Précision</div>
                  <div className="text-xs text-slate-400 mt-1">GNSS RTK IMU, stations totales robotisées, drones LiDAR.</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-semibold text-white text-sm">Normes Internationales</div>
                  <div className="text-xs text-slate-400 mt-1">Rattachements géodésiques WGS84 / ITRF certifiés.</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-semibold text-white text-sm">Post-Traitement & DAO</div>
                  <div className="text-xs text-slate-400 mt-1">Génération de plans conformes AutoCAD, Covadis et WebSIG.</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-semibold text-white text-sm">Support Dédié</div>
                  <div className="text-xs text-slate-400 mt-1">Interlocuteur unique pour le suivi de votre marché.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar CTA & Contact */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Besoin de ce Pôle ?</h3>
                  <p className="text-xs text-slate-400">Devis gratuit sous 24h ouvrées</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Nos ingénieurs analysent votre cahier des charges et établissent une proposition technique et financière sur mesure.
              </p>

              <div className="space-y-3">
                <Link
                  href="/contact"
                  className="w-full block text-center py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition"
                >
                  Demander un Devis d'Étude
                </Link>
                <a
                  href="tel:+22625300000"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Appeler le Département</span>
                </a>
              </div>
            </div>

            {/* Other departments */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800">
              <h4 className="font-bold text-white text-sm mb-4">Autres Départements</h4>
              <div className="space-y-2.5">
                {allDepartments.filter((d) => d.id !== dept.id).map((other) => (
                  <Link
                    key={other.id}
                    href={`/departements/${other.slug}/`}
                    className="block p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/30 transition text-xs"
                  >
                    <div className="font-semibold text-slate-200">{other.nom}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{other.description}</div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
