import React, { useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_APPLICATIONS } from '../lib/mock-admin-data';
import { formatFCFA } from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Order, Application } from '../types';

const BRAND_COLORS = ['#B08F63', '#D9C4A0', '#8C6E47', '#C7A876', '#A3835A', '#E3D6BE'];
const MONTHS_FR = ['Jan', 'Fév', 'Mars', 'Avril', 'Mai', 'Juin', 'Juill', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
const REVENUE_STATUSES: Order['statut'][] = ['paid', 'processing', 'shipped'];

type OrderItemRow = { product_marque: string | null; total_ligne_fcfa: number; order_id: string };

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setApplications(INITIAL_APPLICATIONS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    const [productsRes, ordersRes, applicationsRes, itemsRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('applications').select('*'),
      supabase.from('order_items').select('product_marque, total_ligne_fcfa, order_id'),
    ]);

    const firstError = productsRes.error || ordersRes.error || applicationsRes.error || itemsRes.error;
    if (firstError) {
      setLoadError('Impossible de charger le tableau de bord : ' + firstError.message);
      setLoading(false);
      return;
    }

    setProducts((productsRes.data || []) as Product[]);
    setOrders((ordersRes.data || []) as Order[]);
    setApplications((applicationsRes.data || []) as Application[]);
    setOrderItems((itemsRes.data || []) as OrderItemRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculs KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + (REVENUE_STATUSES.includes(o.statut) ? o.total_fcfa : 0), 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.stock_alerte);
  const pendingApplications = applications.filter((a) => a.statut === 'nouveau' || a.statut === 'en_revue');

  const revenueOrderIds = useMemo(
    () => new Set(orders.filter((o) => REVENUE_STATUSES.includes(o.statut)).map((o) => o.id)),
    [orders]
  );

  // Chart data : Revenus mensuels (en Millions FCFA) — 6 derniers mois glissants
  const revenueChartData = useMemo(() => {
    if (!isSupabaseConfigured) {
      return [
        { mois: 'Mars', montant: 8.5 },
        { mois: 'Avril', montant: 12.2 },
        { mois: 'Mai', montant: 15.8 },
        { mois: 'Juin', montant: 11.4 },
        { mois: 'Juill', montant: 19.5 },
        { mois: 'Août', montant: 24.8 },
      ];
    }

    const now = new Date();
    const buckets: { key: string; mois: string; montant: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, mois: MONTHS_FR[d.getMonth()], montant: 0 });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));

    orders.forEach((o) => {
      if (!REVENUE_STATUSES.includes(o.statut) || !o.created_at) return;
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.montant += o.total_fcfa;
    });

    return buckets.map((b) => ({ mois: b.mois, montant: Math.round((b.montant / 1_000_000) * 10) / 10 }));
  }, [orders]);

  // Distribution par marque : chiffre d'affaires réel, ou répartition du catalogue si aucune vente encore
  const brandDistribution = useMemo(() => {
    if (!isSupabaseConfigured) {
      return [
        { name: 'CHCNAV', value: 45, color: '#B08F63' },
        { name: 'Toknav', value: 30, color: '#D9C4A0' },
        { name: 'FOIF', value: 15, color: '#8C6E47' },
        { name: 'DJI Enterprise', value: 10, color: '#C7A876' },
      ];
    }

    const revenueByBrand = new Map<string, number>();
    orderItems.forEach((item) => {
      if (!revenueOrderIds.has(item.order_id) || !item.product_marque) return;
      revenueByBrand.set(item.product_marque, (revenueByBrand.get(item.product_marque) || 0) + item.total_ligne_fcfa);
    });

    let source = revenueByBrand;
    if (source.size === 0) {
      // Pas encore de ventes : on affiche la répartition du catalogue à la place
      const countByBrand = new Map<string, number>();
      products.forEach((p) => countByBrand.set(p.marque, (countByBrand.get(p.marque) || 0) + 1));
      source = countByBrand;
    }

    const total = Array.from(source.values()).reduce((s, v) => s + v, 0);
    if (total === 0) return [];

    return Array.from(source.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], idx) => ({
        name,
        value: Math.round((value / total) * 1000) / 10,
        color: BRAND_COLORS[idx % BRAND_COLORS.length],
      }));
  }, [orderItems, revenueOrderIds, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-2 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{loadError}</span>
        </div>
        <button onClick={loadDashboard} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Réessayer</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">

        {/* KPI 1 : Revenus */}
        <div className="admin-card rounded-2xl p-6 relative overflow-hidden border border-slate-800 flex flex-col justify-between min-h-[164px]">
          <div className="flex justify-between items-start gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-snug">Chiffre d'Affaires</span>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold font-display text-white mt-2 truncate" title={formatFCFA(totalRevenue)}>
              {formatFCFA(totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Commandes payées, en préparation ou expédiées</span>
            </div>
          </div>
        </div>

        {/* KPI 2 : Commandes */}
        <div className="admin-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between min-h-[164px]">
          <div className="flex justify-between items-start gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-snug">Commandes Clients</span>
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold font-display text-white mt-2">
              {orders.length} <span className="text-xs text-slate-400 font-normal">commandes</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-400 mt-2 font-medium">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{orders.filter((o) => o.statut === 'delivered').length} livrée(s)</span>
            </div>
          </div>
        </div>

        {/* KPI 3 : Stock Faible Alertes */}
        <div className={`admin-card rounded-2xl p-6 border flex flex-col justify-between min-h-[164px] ${lowStockProducts.length > 0 ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'}`}>
          <div className="flex justify-between items-start gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-snug">Alertes de Stock</span>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold font-display text-amber-400 mt-2">
              {lowStockProducts.length} <span className="text-xs text-slate-400 font-normal">équipements</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-2 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Réapprovisionnement requis</span>
            </div>
          </div>
        </div>

        {/* KPI 4 : Candidatures */}
        <div className="admin-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between min-h-[164px]">
          <div className="flex justify-between items-start gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-snug">Candidatures RH</span>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold font-display text-cyan-400 mt-2">
              {pendingApplications.length} <span className="text-xs text-slate-400 font-normal">à traiter</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 mt-2 font-medium">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Nouvelles & en revue</span>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Area Chart : Chiffre d'affaires */}
        <div className="lg:col-span-2 admin-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white font-display">Évolution des Ventes Matériel (Millions FCFA)</h3>
              <p className="text-xs text-slate-400">Revenus mensuels enregistrés via CinetPay, Stripe & Virements</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              6 derniers mois
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B08F63" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#B08F63" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DC" />
                <XAxis dataKey="mois" stroke="#9C9587" fontSize={11} />
                <YAxis stroke="#9C9587" fontSize={11} tickFormatter={(val) => `${val}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC', borderRadius: '12px', fontSize: '12px', color: '#1A1712' }}
                  formatter={(val: any) => [`${val} Millions FCFA`, 'Ventes']}
                />
                <Area type="monotone" dataKey="montant" stroke="#B08F63" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart : Répartition par marque */}
        <div className="admin-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display">Part des Ventes par Marque</h3>
            <p className="text-xs text-slate-400">Répartition des équipements distribués</p>

            <div className="h-48 my-4 flex items-center justify-center">
              {brandDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={brandDistribution}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {brandDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC', borderRadius: '10px', fontSize: '11px', color: '#1A1712' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-slate-500">Aucune donnée disponible</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            {brandDistribution.map((b) => (
              <div key={b.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                <span className="text-slate-300 font-medium">{b.name} ({b.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Two Columns : Stock alert items & Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Low Stock Table */}
        <div className="admin-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Alertes de Stock & Réapprovisionnement</h3>
            </div>
            <span className="text-xs text-amber-400 font-mono font-semibold">
              {lowStockProducts.length} alerte(s)
            </span>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">Aucune alerte de stock actuellement.</p>
            )}
            {lowStockProducts.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{p.nom}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Marque: {p.marque} • {formatFCFA(p.prix_fcfa)}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Reste : {p.stock} (Alerte à {p.stock_alerte})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="admin-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Dernières Commandes</h3>
            </div>
            <span className="text-xs text-slate-400">Total : {orders.length}</span>
          </div>

          <div className="space-y-3">
            {orders.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">Aucune commande enregistrée pour le moment.</p>
            )}
            {orders.slice(0, 8).map((o) => (
              <div key={o.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{o.reference}</span>
                    <span className="text-[10px] text-slate-400 font-normal truncate max-w-[150px]">{o.client_nom}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{formatFCFA(o.total_fcfa)}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  o.statut === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                  o.statut === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                  o.statut === 'shipped' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {o.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
