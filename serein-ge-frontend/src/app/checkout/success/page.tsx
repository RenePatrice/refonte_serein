'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { formatFCFA } from '../../../lib/formatters';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

type OrderStatus = {
  reference: string;
  statut: string;
  total_fcfa: number;
  mode_paiement: string;
  client_nom: string;
  paid_at: string | null;
};

const POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 3000;

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref');

  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!reference || !isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let attempts = 0;
    let cancelled = false;

    const fetchStatus = async () => {
      const { data, error } = await client.functions.invoke('order-status', {
        body: { reference },
      });

      if (cancelled) return;

      if (error || !data?.order) {
        attempts += 1;
        if (attempts >= POLL_ATTEMPTS) {
          setNotFound(true);
          setLoading(false);
        } else {
          setTimeout(fetchStatus, POLL_INTERVAL_MS);
        }
        return;
      }

      setOrder(data.order);

      // Le webhook du fournisseur de paiement peut mettre quelques secondes à
      // arriver : on continue de vérifier tant que la commande reste "pending".
      if (data.order.statut === 'pending' && attempts < POLL_ATTEMPTS) {
        attempts += 1;
        setTimeout(fetchStatus, POLL_INTERVAL_MS);
      } else {
        setLoading(false);
      }
    };

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (!reference) {
    return (
      <StatusPanel
        icon={<XCircle className="w-10 h-10" />}
        tone="rose"
        title="Référence de commande manquante"
        message="Aucune référence de commande n'a été fournie."
      />
    );
  }

  if (loading) {
    return (
      <StatusPanel
        icon={<Loader2 className="w-10 h-10 animate-spin" />}
        tone="emerald"
        title="Vérification du paiement en cours..."
        message={`Nous confirmons le statut de votre commande ${reference} auprès de la passerelle de paiement.`}
      />
    );
  }

  if (notFound || !order) {
    return (
      <StatusPanel
        icon={<XCircle className="w-10 h-10" />}
        tone="rose"
        title="Commande introuvable"
        message={`Nous n'avons pas pu retrouver la commande ${reference}. Contactez-nous si le montant a été débité.`}
      />
    );
  }

  if (order.statut === 'paid') {
    return (
      <StatusPanel
        icon={<CheckCircle className="w-10 h-10" />}
        tone="emerald"
        title="Paiement confirmé !"
        message={`Merci ${order.client_nom}, votre commande ${order.reference} d'un montant de ${formatFCFA(order.total_fcfa)} a bien été réglée.`}
      />
    );
  }

  if (order.statut === 'cancelled') {
    return (
      <StatusPanel
        icon={<XCircle className="w-10 h-10" />}
        tone="rose"
        title="Paiement annulé ou refusé"
        message={`La transaction pour la commande ${order.reference} n'a pas abouti. Vous pouvez réessayer depuis votre panier.`}
      />
    );
  }

  return (
    <StatusPanel
      icon={<Clock className="w-10 h-10" />}
      tone="amber"
      title="Paiement en attente de confirmation"
      message={`Votre commande ${order.reference} est enregistrée. La confirmation de paiement peut prendre quelques minutes ; un conseiller SEREIN-GE vous contactera si nécessaire.`}
    />
  );
}

function StatusPanel({
  icon,
  tone,
  title,
  message,
}: {
  icon: React.ReactNode;
  tone: 'emerald' | 'rose' | 'amber';
  title: string;
  message: string;
}) {
  const toneClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  }[tone];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16 px-4 flex items-center">
      <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 text-center space-y-6 shadow-2xl w-full">
        <div className={`w-20 h-20 rounded-full border flex items-center justify-center mx-auto ${toneClasses}`}>
          {icon}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">{title}</h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">{message}</p>
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-950 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
