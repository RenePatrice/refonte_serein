'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  Send,
  ShoppingBag,
  MessageCircle,
  Mail
} from 'lucide-react';
import { useCartStore } from '../../lib/cart-store';
import { formatFCFA, generateOrderReference } from '../../lib/formatters';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const COMPANY_WHATSAPP = '22670000000';

export default function CheckoutPage() {
  const { items, clearCart, getTotalPrice, getTotalCount } = useCartStore();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '+226 ',
    entreprise: '',
    adresse: '',
    ville: 'Ouagadougou',
    pays: 'Burkina Faso',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const buildWhatsAppMessage = (orderRef: string, clientNom: string) => {
    const lines = [
      `*Nouvelle commande SEREIN-GE — ${orderRef}*`,
      '',
      `Client : ${clientNom}`,
      `Téléphone : ${formData.telephone}`,
      `Email : ${formData.email}`,
      formData.entreprise ? `Entreprise : ${formData.entreprise}` : null,
      `Livraison : ${formData.adresse}, ${formData.ville}`,
      '',
      '*Articles :*',
      ...items.map(
        ({ product, quantity }) =>
          `- ${product.nom} × ${quantity} = ${formatFCFA((product.prix_promo_fcfa || product.prix_fcfa) * quantity)}`
      ),
      '',
      `*Total : ${formatFCFA(totalPrice)}*`,
      formData.notes ? `\nNotes : ${formData.notes}` : null,
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const orderRef = generateOrderReference();
    const clientNom = `${formData.prenom} ${formData.nom}`.trim();

    const orderPayload = {
      reference: orderRef,
      client_nom: clientNom,
      client_email: formData.email,
      client_telephone: formData.telephone,
      client_entreprise: formData.entreprise || null,
      adresse_livraison: formData.adresse,
      ville: formData.ville,
      pays: formData.pays,
      notes_client: formData.notes || null,
      total_fcfa: totalPrice,
      frais_livraison_fcfa: 0,
      statut: 'pending',
      mode_paiement: 'whatsapp',
    };

    // Mode démo hors-ligne : Supabase non configuré, on simule la confirmation
    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => {
        setIsSubmitting(false);
        setOrderCompleted({ reference: orderRef, nom: clientNom, email: formData.email, total: totalPrice });
        clearCart();
      }, 1200);
      return;
    }

    try {
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderErr || !orderData) {
        throw new Error(orderErr?.message || "Impossible d'enregistrer la commande");
      }

      const itemsPayload = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_nom: item.product.nom,
        product_marque: item.product.marque,
        quantite: item.quantity,
        prix_unitaire_fcfa: item.product.prix_promo_fcfa || item.product.prix_fcfa,
        total_ligne_fcfa: (item.product.prix_promo_fcfa || item.product.prix_fcfa) * item.quantity,
      }));
      await supabase.from('order_items').insert(itemsPayload);

      // Notification email (client + équipe commerciale) : best-effort, ne bloque
      // jamais la confirmation de commande si le SMTP n'est pas encore configuré.
      supabase.functions
        .invoke('send-notification-email', {
          body: {
            type: 'order',
            reference: orderRef,
            clientNom,
            clientEmail: formData.email,
            clientTelephone: formData.telephone,
            totalFcfa: totalPrice,
            items: items.map(({ product, quantity }) => ({
              nom: product.nom,
              quantite: quantity,
              prixUnitaireFcfa: product.prix_promo_fcfa || product.prix_fcfa,
            })),
          },
        })
        .catch((err) => console.error('Email de confirmation non envoyé :', err));

      setIsSubmitting(false);
      setOrderCompleted({ reference: orderRef, nom: clientNom, email: formData.email, total: totalPrice });
      clearCart();

      window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${buildWhatsAppMessage(orderRef, clientNom)}`, '_blank');
    } catch (err: any) {
      console.error('Order submission error:', err);
      setIsSubmitting(false);
      setSubmitError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  if (orderCompleted) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/40 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Commande Transmise</span>
            <h1 className="text-3xl font-extrabold font-display text-white">Merci pour votre confiance !</h1>
            <p className="text-sm text-slate-300">
              Votre commande sous la référence <strong className="text-emerald-400 font-mono text-base">{orderCompleted.reference}</strong> a été enregistrée avec succès.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Client :</span>
              <span className="font-semibold text-white">{orderCompleted.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email de confirmation :</span>
              <span className="font-semibold text-white">{orderCompleted.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Montant total TTC :</span>
              <span className="font-bold text-emerald-400 text-sm">{formatFCFA(orderCompleted.total)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-slate-300 text-left space-y-2">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Un onglet WhatsApp s'est ouvert avec le récapitulatif de votre commande — envoyez le message pour que notre équipe le reçoive immédiatement.</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Un email de confirmation vous sera également envoyé, et un conseiller technique SEREIN-GE vous contactera pour organiser la remise ou la livraison.</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition"
            >
              Retour à l'Accueil
            </Link>
            <Link
              href="/produits"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 transition"
            >
              Parcourir la Boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel rounded-3xl p-10 text-center border border-slate-800 space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Votre panier est vide</h2>
          <p className="text-xs text-slate-400">Ajoutez des produits avant de passer commande.</p>
          <Link href="/produits" className="inline-block px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider">
            Aller à la Boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <Link href="/panier" className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modifier le panier</span>
          </Link>
          <h1 className="text-3xl font-extrabold font-display text-white">Finalisation de la Commande</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Renseignez vos coordonnées : votre commande sera transmise instantanément par WhatsApp et par email à un conseiller SEREIN-GE.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* Form Column (Customer info) */}
            <div className="lg:col-span-2 space-y-8">

              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <span>Informations de Livraison & Facturation</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      required
                      value={formData.nom}
                      onChange={handleInputChange}
                      placeholder="Ex: OUÉDRAOGO"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Prénom(s) *</label>
                    <input
                      type="text"
                      name="prenom"
                      required
                      value={formData.prenom}
                      onChange={handleInputChange}
                      placeholder="Ex: Issa"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adresse Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@entreprise.bf"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Numéro de Téléphone / WhatsApp *</label>
                    <input
                      type="tel"
                      name="telephone"
                      required
                      value={formData.telephone}
                      onChange={handleInputChange}
                      placeholder="+226 70 00 00 00"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nom de l'Entreprise ou Cabinet (Optionnel)</label>
                    <input
                      type="text"
                      name="entreprise"
                      value={formData.entreprise}
                      onChange={handleInputChange}
                      placeholder="Ex: Cabinet Topo Faso SARL"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adresse de livraison ou Siège *</label>
                    <input
                      type="text"
                      name="adresse"
                      required
                      value={formData.adresse}
                      onChange={handleInputChange}
                      placeholder="Quartier, Rue, Secteur à Ouagadougou ou Ville en province"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ville *</label>
                    <input
                      type="text"
                      name="ville"
                      required
                      value={formData.ville}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pays</label>
                    <input
                      type="text"
                      name="pays"
                      disabled
                      value={formData.pays}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes complémentaires (optionnel)</label>
                    <textarea
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Précisions sur la livraison, disponibilité, etc."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <span>Transmission de la Commande</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Aucun paiement en ligne n'est requis à cette étape. Dès validation, votre commande est enregistrée puis transmise par WhatsApp et par email à un conseiller SEREIN-GE, qui vous recontactera pour convenir du règlement (espèces, virement ou chèque) et de la livraison ou du retrait au showroom.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp instantané</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>Confirmation par email</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Summary Column */}
            <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold font-display text-white">Votre Commande</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-center text-xs py-2 border-b border-slate-800/60">
                    <div className="truncate max-w-[160px]">
                      <div className="font-semibold text-white truncate">{product.nom}</div>
                      <div className="text-[10px] text-slate-500">Qté: {quantity} × {formatFCFA(product.prix_promo_fcfa || product.prix_fcfa)}</div>
                    </div>
                    <div className="font-bold text-emerald-400">
                      {formatFCFA((product.prix_promo_fcfa || product.prix_fcfa) * quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Sous-total articles :</span>
                  <span className="font-semibold text-white">{formatFCFA(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison :</span>
                  <span className="text-emerald-400 font-semibold">Gratuit à Ouagadougou</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Total à régler :</span>
                  <span className="text-xl font-extrabold font-display text-emerald-400">
                    {formatFCFA(totalPrice)}
                  </span>
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-glow-emerald transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer ma Commande'}</span>
              </button>

              <div className="text-[11px] text-slate-500 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Vos données sont transmises de façon sécurisée</span>
                </div>
                <p>En confirmant, vous acceptez les conditions générales de vente de SEREIN-GE.</p>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
