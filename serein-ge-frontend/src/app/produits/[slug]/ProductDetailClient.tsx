'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Check,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Award,
  MessageCircle,
  Plus,
  Minus,
  Cpu,
  Sparkles,
  Share2
} from 'lucide-react';
import { Product } from '../../../types';
import { formatFCFA } from '../../../lib/formatters';
import { useCartStore } from '../../../lib/cart-store';
import ProductCard from '../../../components/ProductCard';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product: initialProduct, relatedProducts: initialRelated }: ProductDetailClientProps) {
  const [product, setProduct] = useState(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState(initialRelated);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let cancelled = false;
    const client = supabase;

    (async () => {
      const { data: row } = await client.from('products').select('*').eq('slug', initialProduct.slug).single();
      if (cancelled || !row) return;
      const freshProduct = row as Product;
      setProduct(freshProduct);

      const { data: related } = await client
        .from('products')
        .select('*')
        .or(`marque.eq.${freshProduct.marque},categorie.eq.${freshProduct.categorie}`)
        .neq('id', freshProduct.id)
        .limit(3);
      if (!cancelled && related) setRelatedProducts(related as Product[]);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProduct.slug]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discountPercent = product.prix_promo_fcfa
    ? Math.round(((product.prix_fcfa - product.prix_promo_fcfa) / product.prix_fcfa) * 100)
    : null;

  const currentPrice = product.prix_promo_fcfa || product.prix_fcfa;

  const whatsappMessage = encodeURIComponent(
    `Bonjour SEREIN-GE, je souhaite commander l'équipement suivant : ${product.nom} (${formatFCFA(currentPrice)}). Avez-vous du stock disponible à Ouagadougou ?`
  );

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-400">
          <Link href="/produits" className="hover:text-emerald-400 inline-flex items-center gap-1.5 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au catalogue</span>
          </Link>
          <div className="flex items-center gap-2">
            <span>Boutique</span>
            <span>/</span>
            <span className="text-emerald-400 font-medium">{product.marque}</span>
            <span>/</span>
            <span className="text-slate-300 truncate max-w-[200px]">{product.nom}</span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Main Preview Box */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 relative border border-slate-800 shadow-2xl">
              <Image
                src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'}
                alt={product.nom}
                fill
                className="object-cover"
              />

              {/* Discount / Vedette Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                  {product.marque}
                </span>
                {discountPercent && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-lg">
                    -{discountPercent}% PROMOTION
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border-2 transition ${
                      selectedImage === idx ? 'border-emerald-500 shadow-glow-emerald' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Image src={img} alt={`${product.nom} thumb ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Data & Cart Actions */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                {product.categorie}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white mt-1">
                {product.nom}
              </h1>
              
              {/* Stock Status Badge */}
              <div className="mt-3 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.stock > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {product.stock > 0 ? `En stock à Ouagadougou (${product.stock} unités disponibles)` : 'Rupture temporaire - Sur commande'}
                </span>
                <span className="text-xs text-slate-500 font-mono">Réf: {product.slug}</span>
              </div>
            </div>

            {/* Price section */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Prix TTC (Francs CFA)</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold font-display text-emerald-400">
                    {formatFCFA(currentPrice)}
                  </span>
                  {product.prix_promo_fcfa && (
                    <span className="text-base line-through text-slate-500">
                      {formatFCFA(product.prix_fcfa)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description_complete}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-400 uppercase">Quantité :</span>
                <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-white min-w-[30px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                    added
                      ? 'bg-emerald-500 text-white shadow-glow-emerald'
                      : product.stock > 0
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-glow-emerald transform hover:-translate-y-0.5'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Ajouter au Panier</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/22670000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-4 px-6 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center justify-center space-x-2 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Commander sur WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Guarantees Strip */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-white">Garantie 2 Ans</div>
                <div className="text-[9px] text-slate-500">Constructeur officiel</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
                <Clock className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-white">SAV & Calibration</div>
                <div className="text-[9px] text-slate-500">Atelier à Ouagadougou</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
                <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-white">Formation Offerte</div>
                <div className="text-[9px] text-slate-500">Prise en main terrain</div>
              </div>
            </div>

          </div>

        </div>

        {/* Technical Specifications Table */}
        {product.specs_techniques && Object.keys(product.specs_techniques).length > 0 && (
          <div className="mt-16 glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">Spécifications Techniques Détaillées</h3>
                <p className="text-xs text-slate-400">Données métrologiques constructeur certifiées</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specs_techniques).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-mono font-medium">{key}</span>
                  <span className="text-xs font-bold text-white text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-800">
            <h3 className="text-2xl font-bold text-white font-display mb-8">
              Équipements Complémentaires & Similaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
