import React from 'react';
import { notFound } from 'next/navigation';
import { INITIAL_PRODUCTS } from '../../../lib/mock-data';
import ProductDetailClient from './ProductDetailClient';

export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = INITIAL_PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.marque === product.marque || p.categorie === product.categorie)
  ).slice(0, 3);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
