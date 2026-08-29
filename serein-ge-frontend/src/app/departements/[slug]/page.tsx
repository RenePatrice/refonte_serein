import React from 'react';
import { notFound } from 'next/navigation';
import { INITIAL_DEPARTMENTS } from '../../../lib/mock-data';
import DepartmentDetailClient from './DepartmentDetailClient';

export function generateStaticParams() {
  return INITIAL_DEPARTMENTS.map((dept) => ({
    slug: dept.slug,
  }));
}

export default function DepartmentDetailPage({ params }: { params: { slug: string } }) {
  const dept = INITIAL_DEPARTMENTS.find((d) => d.slug === params.slug);

  if (!dept) {
    notFound();
  }

  return <DepartmentDetailClient department={dept} />;
}
