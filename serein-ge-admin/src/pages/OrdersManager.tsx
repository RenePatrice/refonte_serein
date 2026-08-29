import React, { useEffect, useState } from 'react';
import { Eye, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { Order } from '../types';
import { INITIAL_ORDERS } from '../lib/mock-admin-data';
import { formatFCFA, formatDate } from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setOrders(INITIAL_ORDERS);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError('Impossible de charger les commandes : ' + error.message);
    } else {
      setOrders((data || []) as Order[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['statut']) => {
    if (!isSupabaseConfigured || !supabase) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, statut: newStatus } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, statut: newStatus });
      }
      return;
    }

    setUpdatingStatus(true);
    const { error } = await supabase.from('orders').update({ statut: newStatus }).eq('id', orderId);
    setUpdatingStatus(false);

    if (error) {
      alert('Échec de la mise à jour du statut : ' + error.message);
      return;
    }

    setOrders(orders.map((o) => (o.id === orderId ? { ...o, statut: newStatus } : o)));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, statut: newStatus });
    }
  };

  const getStatusBadge = (statut: Order['statut']) => {
    switch (statut) {
      case 'paid':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PAYÉ (CinetPay)</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">EN PRÉPARATION</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">EXPÉDIÉ</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">LIVRÉ</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">ANNULÉ</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">EN ATTENTE</span>;
    }
  };

  const columns: Column<Order>[] = [
    {
      header: 'Réf. Commande',
      render: (o) => (
        <div>
          <div className="font-mono font-bold text-white text-xs">{o.reference}</div>
          <div className="text-[10px] text-slate-500">{formatDate(o.created_at)}</div>
        </div>
      ),
    },
    {
      header: 'Client & Téléphone',
      render: (o) => (
        <div>
          <div className="font-bold text-white text-xs">{o.client_nom}</div>
          <div className="text-[10px] text-slate-400">{o.client_telephone} • {o.client_email}</div>
          {o.client_entreprise && <div className="text-[10px] text-emerald-400 font-medium">{o.client_entreprise}</div>}
        </div>
      ),
    },
    {
      header: 'Lieu de Livraison',
      render: (o) => (
        <div className="text-xs text-slate-300 max-w-[200px] truncate">
          <div>{o.ville}, {o.pays}</div>
          <div className="text-[10px] text-slate-500 truncate">{o.adresse_livraison}</div>
        </div>
      ),
    },
    {
      header: 'Montant Total',
      render: (o) => (
        <div>
          <div className="font-bold text-emerald-400 font-display text-xs">{formatFCFA(o.total_fcfa)}</div>
          <div className="text-[10px] text-slate-500 uppercase">{o.mode_paiement}</div>
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (o) => getStatusBadge(o.statut),
    },
    {
      header: 'Actions',
      render: (o) => (
        <button
          onClick={() => setSelectedOrder(o)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Détails</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Gestion des Commandes Clients</h2>
          <p className="text-xs text-slate-400">Suivi des paiements CinetPay/Stripe, préparation logistique et expédition.</p>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadOrders} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des commandes...</span>
        </div>
      ) : (
        <DataTable
          data={orders}
          columns={columns}
          searchPlaceholder="Rechercher par référence, client, email, ville..."
          searchFilter={(item, q) =>
            item.reference.toLowerCase().includes(q.toLowerCase()) ||
            item.client_nom.toLowerCase().includes(q.toLowerCase()) ||
            item.client_email.toLowerCase().includes(q.toLowerCase()) ||
            item.ville.toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="commandes-serein-ge.csv"
        />
      )}

      {/* Order Details Drawer / Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Détail de la Commande ${selectedOrder.reference}` : 'Détail'}
        subtitle="Historique client, articles commandés et changement d'état."
        maxWidth="max-w-3xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">

            {/* Status changer toolbar */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Statut actuel :</span>
                {getStatusBadge(selectedOrder.statut)}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Modifier statut :</span>
                <select
                  value={selectedOrder.statut}
                  disabled={updatingStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                >
                  <option value="pending">En attente (pending)</option>
                  <option value="paid">Payé (paid)</option>
                  <option value="processing">En préparation (processing)</option>
                  <option value="shipped">Expédié (shipped)</option>
                  <option value="delivered">Livré (delivered)</option>
                  <option value="cancelled">Annulé (cancelled)</option>
                </select>
              </div>
            </div>

            {/* Client Info Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div>
                <div className="text-slate-500 uppercase text-[10px] font-bold">Client Destinataire</div>
                <div className="font-bold text-white text-sm mt-0.5">{selectedOrder.client_nom}</div>
                <div className="text-slate-300 mt-1">{selectedOrder.client_telephone}</div>
                <div className="text-slate-400">{selectedOrder.client_email}</div>
                {selectedOrder.client_entreprise && (
                  <div className="text-emerald-400 font-semibold mt-1">Société : {selectedOrder.client_entreprise}</div>
                )}
              </div>

              <div>
                <div className="text-slate-500 uppercase text-[10px] font-bold">Adresse de Réception</div>
                <div className="font-semibold text-white mt-0.5">{selectedOrder.adresse_livraison}</div>
                <div className="text-slate-300">{selectedOrder.ville}, {selectedOrder.pays}</div>
                <div className="text-slate-400 mt-2">
                  Passerelle : <strong className="text-white uppercase">{selectedOrder.mode_paiement}</strong>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <div className="font-bold text-white text-sm mb-3">Articles & Matériel Commandé</div>
              <div className="rounded-xl overflow-hidden border border-slate-800 divide-y divide-slate-800">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-950/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{item.product_nom}</div>
                      <div className="text-[10px] text-slate-500">Marque : {item.product_marque} • Qté : {item.quantite}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400 font-display">{formatFCFA(item.total_ligne_fcfa)}</div>
                      <div className="text-[10px] text-slate-500">{formatFCFA(item.prix_unitaire_fcfa)} / u</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Montant Total Réglé :</span>
              <span className="text-xl font-extrabold font-display text-emerald-400">
                {formatFCFA(selectedOrder.total_fcfa)}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald hover:bg-emerald-400"
              >
                Fermer
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
