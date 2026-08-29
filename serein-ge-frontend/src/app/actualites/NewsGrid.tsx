'use client';

import React from 'react';
import ArticleCard from '../../components/ArticleCard';
import { INITIAL_NEWS } from '../../lib/mock-data';
import { useSupabaseList } from '../../lib/useSupabaseData';

export default function NewsGrid() {
  const { data: articles } = useSupabaseList('actualites', INITIAL_NEWS, { orderColumn: 'date_publication', ascending: false });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
