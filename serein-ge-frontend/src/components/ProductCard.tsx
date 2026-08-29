'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Check, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../lib/formatters';
import { useCartStore } from '../lib/cart-store';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discountPercent = product.prix_promo_fcfa
    ? Math.round(((product.prix_fcfa - product.prix_promo_fcfa) / product.prix_fcfa) * 100)
    : null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group h-full border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300">
      {/* Image Container */}
      <Link href={`/produits/${product.slug}/`} className="relative aspect-[4/3] bg-slate-900 overflow-hidden block">
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
          alt={product.nom}
          fill
          className="object-cover group-hover:scale-108 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            {product.marque}
          </span>
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-md">
              -{discountPercent}% PROMO
            </span>
          )}
          {product.en_vedette && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500 text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Vedette
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-md ${
            product.stock > 0 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            {product.stock > 0 ? `En stock (${product.stock})` : 'Sur commande'}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] text-slate-400 font-medium">{product.categorie}</span>
          <Link href={`/produits/${product.slug}/`}>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mt-1 line-clamp-2">
              {product.nom}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2">
            {product.description_courte}
          </p>

          {/* Quick Specs Tag Pills */}
          {product.specs_techniques && Object.keys(product.specs_techniques).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(product.specs_techniques).slice(0, 2).map(([key, val]) => (
                <span key={key} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                  {key}: <strong className="text-slate-200">{val}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Prix unitaire</div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-emerald-400 font-display">
                {formatFCFA(product.prix_promo_fcfa || product.prix_fcfa)}
              </span>
              {product.prix_promo_fcfa && (
                <span className="text-xs line-through text-slate-500">
                  {formatFCFA(product.prix_fcfa)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/produits/${product.slug}/`}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              title="Voir la fiche détaillée"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`p-2.5 rounded-xl font-medium transition flex items-center justify-center ${
                added
                  ? 'bg-emerald-500 text-white shadow-glow-emerald'
                  : product.stock > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-glow-emerald'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Ajouter au panier"
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
