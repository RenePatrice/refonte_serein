import React from 'react';
import { notFound } from 'next/navigation';
import { INITIAL_NEWS } from '../../../lib/mock-data';
import NewsDetailClient from './NewsDetailClient';

export function generateStaticParams() {
  return INITIAL_NEWS.map((article) => ({
    slug: article.slug,
  }));
}

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  const article = INITIAL_NEWS.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return <NewsDetailClient article={article} />;
}
