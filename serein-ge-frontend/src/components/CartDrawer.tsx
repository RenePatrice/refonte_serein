'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../lib/cart-store';
import { formatFCFA } from '../lib/formatters';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice, getTotalCount } = useCartStore();

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Mon Panier</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {totalCount} {totalCount > 1 ? 'articles' : 'article'}
              </span>
            </div>
            <button 
              onClick={closeCart}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body / Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white">Votre panier est vide</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Découvrez nos récepteurs GNSS RTK, stations totales et drones de pointe.
                </p>
                <Link
                  href="/produits"
                  onClick={closeCart}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-glow-emerald transition"
                >
                  Explorer la Boutique
                </Link>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const unitPrice = product.prix_promo_fcfa || product.prix_fcfa;
                const lineTotal = unitPrice * quantity;
                return (
                  <div 
                    key={product.id} 
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex gap-4 hover:border-slate-700 transition"
                  >
                    <div className="w-20 h-20 rounded-lg bg-slate-800 overflow-hidden relative shrink-0 border border-slate-700/50">
                      <Image
                        src={product.images[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'}
                        alt={product.nom}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">{product.nom}</h4>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="text-slate-500 hover:text-red-400 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                          {product.marque}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white min-w-[20px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-400">{formatFCFA(lineTotal)}</div>
                          {quantity > 1 && (
                            <div className="text-[10px] text-slate-500">{formatFCFA(unitPrice)} / u</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/70 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Sous-total articles :</span>
                  <span className="text-white font-medium">{formatFCFA(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Livraison :</span>
                  <span className="text-emerald-400 font-medium">Calculée au checkout</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-white">Total estimé :</span>
                  <span className="text-xl font-bold font-display text-emerald-400">{formatFCFA(totalPrice)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-glow-emerald transition-all transform hover:-translate-y-0.5"
                >
                  <span>Commander via CinetPay / Stripe</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <Link
                  href="/panier"
                  onClick={closeCart}
                  className="w-full block text-center py-2 text-xs text-slate-400 hover:text-white transition"
                >
                  Voir le détail complet du panier
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Paiement sécurisé CinetPay (Orange, Moov, Wave, Cartes)</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
