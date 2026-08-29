'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Article } from '../../../types';
import { formatDate } from '../../../lib/formatters';
import { useSupabaseItem } from '../../../lib/useSupabaseData';

interface NewsDetailClientProps {
  article: Article;
}

export default function NewsDetailClient({ article: initialArticle }: NewsDetailClientProps) {
  const article = useSupabaseItem('actualites', initialArticle.slug, initialArticle);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">

      {/* Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/actualites"
            className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour aux actualités</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {article.categorie}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(article.date_publication)}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white leading-tight">
            {article.titre}
          </h1>

          <p className="mt-4 text-base text-slate-300 italic">
            "{article.extrait}"
          </p>
        </div>
      </div>

      {/* Main Article Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-slate-900 relative border border-slate-800 mb-10">
          <Image
            src={article.image_couverture || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80'}
            alt={article.titre}
            fill
            className="object-cover"
          />
        </div>

        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
          {article.contenu}
        </div>

        {/* Share & CTA */}
        <div className="mt-12 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-white">Partager cet article technique</h4>
            <p className="text-xs text-slate-400 mt-1">Diffusez ces informations au sein de votre réseau professionnel.</p>
          </div>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${article.titre} - SEREIN-GE`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition shrink-0"
          >
            Partager sur WhatsApp
          </a>
        </div>
      </div>

    </div>
  );
}
