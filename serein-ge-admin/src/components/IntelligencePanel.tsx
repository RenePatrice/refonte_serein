import React, { useEffect, useState } from 'react';
import { Sparkles, Eye, ShoppingCart, Search, Loader2, TrendingUp } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';

type AnalyticsEventType = 'page_view' | 'product_view' | 'add_to_cart' | 'search' | 'order_submitted';

interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  session_id: string;
  path: string | null;
  product_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

const EVENT_LABELS: Record<AnalyticsEventType, string> = {
  page_view: 'Pages vues',
  product_view: 'Fiches produit consultées',
  add_to_cart: 'Ajouts au panier',
  search: 'Recherches',
  order_submitted: 'Commandes transmises',
};

interface IntelligencePanelProps {
  products: Product[];
}

export default function IntelligencePanel({ products }: IntelligencePanelProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    const since = new Date();
    since.setDate(since.getDate() - 30);

    supabase
      .from('analytics_events')
      .select('id, event_type, session_id, path, product_id, metadata, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000)
      .then(({ data }) => {
        setEvents((data || []) as AnalyticsEvent[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="admin-card rounded-3xl p-8 border border-slate-800 flex items-center justify-center gap-2 text-slate-400 text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
        <span>Chargement de l'intelligence visiteurs...</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="admin-card rounded-3xl p-8 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white font-display">Intelligence Visiteurs</h3>
        </div>
        <p className="text-xs text-slate-400">
          Aucune activité enregistrée sur les 30 derniers jours. Le suivi se remplit automatiquement dès que des visiteurs naviguent sur le site public.
        </p>
      </div>
    );
  }

  const countsByType = events.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
    return acc;
  }, {} as Record<AnalyticsEventType, number>);

  const productViewCounts = new Map<string, number>();
  events.filter((e) => e.event_type === 'product_view' && e.product_id).forEach((e) => {
    productViewCounts.set(e.product_id!, (productViewCounts.get(e.product_id!) || 0) + 1);
  });
  const topProducts = Array.from(productViewCounts.entries())
    .map(([productId, count]) => ({ product: products.find((p) => p.id === productId), count }))
    .filter((row) => row.product)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const searchCounts = new Map<string, number>();
  events.filter((e) => e.event_type === 'search' && e.metadata?.query).forEach((e) => {
    const q = String(e.metadata!.query).trim().toLowerCase();
    if (!q) return;
    searchCounts.set(q, (searchCounts.get(q) || 0) + 1);
  });
  const topSearches = Array.from(searchCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const uniqueVisitors = new Set(events.map((e) => e.session_id)).size;
  const funnel = [
    { label: 'Fiches produit vues', value: countsByType.product_view || 0 },
    { label: 'Ajouts au panier', value: countsByType.add_to_cart || 0 },
    { label: 'Commandes transmises', value: countsByType.order_submitted || 0 },
  ];
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <div className="admin-card rounded-3xl p-8 border border-slate-800 space-y-8">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <div>
          <h3 className="text-lg font-bold text-white font-display">Intelligence Visiteurs</h3>
          <p className="text-xs text-slate-400">Comportement anonyme sur le site public — 30 derniers jours.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {(Object.keys(EVENT_LABELS) as AnalyticsEventType[]).map((type) => (
          <div key={type} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-2xl font-extrabold text-white font-display">{countsByType[type] || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{EVENT_LABELS[type]}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div>
          <div className="flex items-center gap-1.5 text-white font-bold text-sm mb-3">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Produits les plus consultés</span>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-500">Pas encore de fiche produit consultée.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map(({ product, count }) => (
                <div key={product!.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-200 truncate max-w-[70%]">{product!.nom}</span>
                  <span className="text-emerald-400 font-bold">{count} vue{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-white font-bold text-sm mb-3">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Recherches fréquentes</span>
          </div>
          {topSearches.length === 0 ? (
            <p className="text-xs text-slate-500">Aucune recherche enregistrée.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topSearches.map(([query, count]) => (
                <span key={query} className="px-3 py-1.5 rounded-full bg-slate-950/60 border border-slate-800 text-xs text-slate-200">
                  "{query}" <span className="text-emerald-400 font-bold">×{count}</span>
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      <div>
        <div className="flex items-center gap-1.5 text-white font-bold text-sm mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Tunnel de conversion</span>
          <span className="text-[10px] text-slate-500 font-normal ml-1">({uniqueVisitors} visiteurs uniques)</span>
        </div>
        <div className="space-y-2.5">
          {funnel.map((f) => (
            <div key={f.label} className="flex items-center gap-3 text-xs">
              <span className="w-40 shrink-0 text-slate-400">{f.label}</span>
              <div className="flex-1 h-6 rounded-lg bg-slate-950/60 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg flex items-center justify-end px-2"
                  style={{ width: `${Math.max(6, (f.value / maxFunnel) * 100)}%` }}
                >
                  <span className="text-white font-bold text-[10px]">{f.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
