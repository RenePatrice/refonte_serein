import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, UserCheck, Calendar, ArrowUpRight } from 'lucide-react';
import { Realisation } from '../types';
import { formatDate } from '../lib/formatters';

interface RealisationCardProps {
  realisation: Realisation;
}

export default function RealisationCard({ realisation }: RealisationCardProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300">
      {/* Image with overlay */}
      <Link href={`/realisations/${realisation.slug}/`} className="relative aspect-[16/10] bg-slate-900 overflow-hidden block">
        <Image
          src={realisation.images[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'}
          alt={realisation.titre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        
        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
            {realisation.categorie}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">{realisation.lieu}</span>
          </span>
          {realisation.date_realisation && (
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(realisation.date_realisation)}</span>
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">Client: <strong className="text-slate-300">{realisation.client}</strong></span>
          </div>

          <Link href={`/realisations/${realisation.slug}/`}>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
              {realisation.titre}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {realisation.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
          <Link
            href={`/realisations/${realisation.slug}/`}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 group/link"
          >
            <span>Détails du projet</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
