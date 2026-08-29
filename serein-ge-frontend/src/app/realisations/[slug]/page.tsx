import React from 'react';
import { notFound } from 'next/navigation';
import { INITIAL_REALISATIONS } from '../../../lib/mock-data';
import RealisationDetailClient from './RealisationDetailClient';

export function generateStaticParams() {
  return INITIAL_REALISATIONS.map((r) => ({
    slug: r.slug,
  }));
}

export default function RealisationDetailPage({ params }: { params: { slug: string } }) {
  const realisation = INITIAL_REALISATIONS.find((r) => r.slug === params.slug);

  if (!realisation) {
    notFound();
  }

  return <RealisationDetailClient realisation={realisation} />;
}
