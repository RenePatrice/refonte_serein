'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../lib/cart-store';
import { formatFCFA } from '../../lib/formatters';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalCount } = useCartStore();

  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  if (items.length === 0) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel rounded-3xl p-10 text-center border border-slate-800 space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Votre Panier est Vide</h1>
          <p className="text-xs text-slate-400">
            Vous n'avez pas encore ajouté d'instruments ou d'accessoires de topographie à votre panier.
          </p>
          <div className="pt-4">
            <Link
              href="/produits"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-glow-emerald transition"
            >
              <span>Découvrir la Boutique</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-8">
          <div>
            <Link href="/produits" className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continuer mes achats</span>
            </Link>
            <h1 className="text-3xl font-extrabold font-display text-white">Mon Panier d'Achat</h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-rose-400 transition inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Vider tout le panier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Items Table / Cards */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const unitPrice = product.prix_promo_fcfa || product.prix_fcfa;
              const lineTotal = unitPrice * quantity;
              return (
                <div
                  key={product.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden relative shrink-0 border border-slate-800">
                      <Image
                        src={product.images[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'}
                        alt={product.nom}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        {product.marque}
                      </span>
                      <Link href={`/produits/${product.slug}/`}>
                        <h3 className="text-sm font-bold text-white hover:text-emerald-400 transition truncate">
                          {product.nom}
                        </h3>
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Prix unitaire : <strong className="text-slate-200">{formatFCFA(unitPrice)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-white min-w-[24px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[110px]">
                      <div className="text-sm font-bold text-emerald-400 font-display">
                        {formatFCFA(lineTotal)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold font-display text-white">Récapitulatif de Commande</h2>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Nombre d'articles :</span>
                <span className="font-semibold text-white">{totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span className="font-semibold text-white">{formatFCFA(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison :</span>
                <span className="text-emerald-400 font-semibold">Gratuit à Ouagadougou</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total TTC :</span>
                <span className="text-2xl font-extrabold font-display text-emerald-400">
                  {formatFCFA(totalPrice)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-glow-emerald transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
              >
                <span>Procéder au Paiement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Paiement sécurisé via CinetPay & Stripe</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Orange Money BF • Moov Money BF • Wave • VISA • Mastercard
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
