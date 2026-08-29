import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import { Article } from '../types';
import { formatDate } from '../lib/formatters';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300">
      <Link href={`/actualites/${article.slug}/`} className="relative aspect-[16/9] bg-slate-900 overflow-hidden block">
        <Image
          src={article.image_couverture || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80'}
          alt={article.titre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            {article.categorie}
          </span>
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(article.date_publication)}</span>
            </span>
            {article.vues !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.vues} vues</span>
              </span>
            )}
          </div>

          <Link href={`/actualites/${article.slug}/`}>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
              {article.titre}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {article.extrait}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <Link
            href={`/actualites/${article.slug}/`}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 group/link"
          >
            <span>Lire l'article</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
