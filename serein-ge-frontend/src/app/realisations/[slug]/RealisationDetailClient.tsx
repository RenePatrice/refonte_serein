'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, UserCheck, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Realisation } from '../../../types';
import { formatDate } from '../../../lib/formatters';
import { useSupabaseItem } from '../../../lib/useSupabaseData';

interface RealisationDetailClientProps {
  realisation: Realisation;
}

export default function RealisationDetailClient({ realisation: initialRealisation }: RealisationDetailClientProps) {
  const realisation = useSupabaseItem('realisations', initialRealisation.slug, initialRealisation);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">

      {/* Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/realisations"
            className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour aux réalisations</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {realisation.categorie}
            </span>
            {realisation.date_realisation && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(realisation.date_realisation)}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white max-w-4xl">
            {realisation.titre}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{realisation.lieu}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>Client : <strong className="text-white">{realisation.client}</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Photos & Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-slate-900 relative border border-slate-800">
              <Image
                src={realisation.images[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'}
                alt={realisation.titre}
                fill
                className="object-cover"
              />
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
              <h2 className="text-2xl font-bold text-white font-display">Contexte & Démarche d'Ingénierie</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {realisation.description}
              </p>

              {realisation.details && Object.keys(realisation.details).length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                  <h3 className="text-base font-bold text-white">Indicateurs & Spécificités du Marché</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(realisation.details).map(([k, v]) => (
                      <div key={k} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-xs text-slate-400 font-mono">{k}</div>
                        <div className="text-sm font-semibold text-white mt-1">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Grid */}
            {realisation.images.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Galerie Photo du Chantier</h3>
                <div className="grid grid-cols-2 gap-4">
                  {realisation.images.slice(1).map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 relative border border-slate-800">
                      <Image src={img} alt={`${realisation.titre} ${i + 2}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Un Projet Similaire ?</h3>
                  <p className="text-xs text-slate-400">Étude de faisabilité & chiffrage</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nos experts géomètres sont à votre écoute pour évaluer le dimensionnement géodésique et topographique de vos projets.
              </p>
              <Link
                href="/contact"
                className="w-full block text-center py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition"
              >
                Demander un Devis Personnalisé
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
