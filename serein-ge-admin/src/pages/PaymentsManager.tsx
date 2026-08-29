import React, { useEffect, useState } from 'react';
import { CreditCard, Smartphone, Terminal, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { PaymentLog } from '../types';
import { INITIAL_PAYMENT_LOGS } from '../lib/mock-admin-data';
import { formatFCFA, formatDate } from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function PaymentsManager() {
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<PaymentLog | null>(null);

  const loadLogs = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLogs(INITIAL_PAYMENT_LOGS);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('payment_logs')
      .select('*, orders(reference)')
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError('Impossible de charger le journal des paiements : ' + error.message);
    } else {
      const mapped = (data || []).map((row: any) => ({
        ...row,
        order_ref: row.orders?.reference || '—',
      }));
      setLogs(mapped as PaymentLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Column<PaymentLog>[] = [
    {
      header: 'ID Transaction',
      render: (pl) => (
        <div>
          <div className="font-mono font-bold text-white text-xs">{pl.transaction_id}</div>
          <div className="text-[10px] text-slate-500">{formatDate(pl.created_at)}</div>
        </div>
      ),
    },
    {
      header: 'Réf. Commande',
      render: (pl) => (
        <span className="font-mono text-emerald-400 font-semibold">{pl.order_ref}</span>
      ),
    },
    {
      header: 'Passerelle & Opérateur',
      render: (pl) => (
        <div className="flex items-center space-x-2">
          {pl.provider === 'cinetpay' ? (
            <Smartphone className="w-4 h-4 text-emerald-400" />
          ) : (
            <CreditCard className="w-4 h-4 text-blue-400" />
          )}
          <div>
            <div className="font-semibold text-white uppercase text-[11px]">{pl.provider}</div>
            <div className="text-[10px] text-slate-400">{pl.operateur}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Montant Encaissé',
      render: (pl) => (
        <span className="font-bold text-emerald-400 font-display text-xs">
          {formatFCFA(pl.montant_fcfa)}
        </span>
      ),
    },
    {
      header: 'Statut',
      render: (pl) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          pl.statut === 'SUCCESS'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {pl.statut}
        </span>
      ),
    },
    {
      header: 'Payload Raw',
      render: (pl) => (
        <button
          onClick={() => setSelectedLog(pl)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono flex items-center gap-1.5"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Inspecter</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Journal des Transactions & Paiements</h2>
          <p className="text-xs text-slate-400">Historique complet des encaissements CinetPay (Mobile Money Burkina) et Stripe.</p>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadLogs} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement du journal des paiements...</span>
        </div>
      ) : (
        <DataTable
          data={logs}
          columns={columns}
          searchPlaceholder="Rechercher par ID transaction, référence..."
          searchFilter={(item, q) =>
            item.transaction_id.toLowerCase().includes(q.toLowerCase()) ||
            item.order_ref.toLowerCase().includes(q.toLowerCase()) ||
            (item.operateur || '').toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="paiements-serein-ge.csv"
        />
      )}

      {/* Raw Payload Inspector Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? `Callback IPN - ${selectedLog.transaction_id}` : 'Callback'}
        subtitle="Données brutes reçues de la passerelle de paiement."
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-emerald-400 overflow-x-auto max-h-72 border border-slate-800">
              <pre>{JSON.stringify(selectedLog.callback_raw || { info: 'Virement manuel confirmé' }, null, 2)}</pre>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800"
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
