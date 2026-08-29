import React, { useEffect, useState } from 'react';
import { Eye, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { QuoteRequest } from '../types';
import { formatDate } from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const INITIAL_QUOTES_DEMO: QuoteRequest[] = [
  {
    id: 'q1',
    reference: 'DEV-26-58213',
    service_type: 'Topographie & Géodésie',
    location: 'Ouagadougou',
    timeframe: 'Urgent (< 2 semaines)',
    client_nom: 'OUÉDRAOGO',
    client_prenom: 'Issa',
    client_email: 'issa.ouedraogo@example.bf',
    client_telephone: '+226 70 11 22 33',
    description: 'Levé topographique pour un lotissement de 5 hectares.',
    statut: 'nouveau',
    created_at: new Date().toISOString(),
  },
];

export default function QuotesManager() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadQuotes = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setQuotes(INITIAL_QUOTES_DEMO);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('quote_requests').select('*').order('created_at', { ascending: false });

    if (error) {
      setLoadError('Impossible de charger les demandes de devis : ' + error.message);
    } else {
      setQuotes((data || []) as QuoteRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDetails = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setInternalNotes(quote.notes_internes || '');
  };

  const handleUpdateStatus = async (quoteId: string, newStatus: QuoteRequest['statut']): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setQuotes(quotes.map((q) => (q.id === quoteId ? { ...q, statut: newStatus, notes_internes: internalNotes } : q)));
      if (selectedQuote && selectedQuote.id === quoteId) {
        setSelectedQuote({ ...selectedQuote, statut: newStatus, notes_internes: internalNotes });
      }
      return true;
    }

    setSaving(true);
    const { error } = await supabase
      .from('quote_requests')
      .update({ statut: newStatus, notes_internes: internalNotes })
      .eq('id', quoteId);
    setSaving(false);

    if (error) {
      alert('Échec de la mise à jour : ' + error.message);
      return false;
    }

    setQuotes(quotes.map((q) => (q.id === quoteId ? { ...q, statut: newStatus, notes_internes: internalNotes } : q)));
    if (selectedQuote && selectedQuote.id === quoteId) {
      setSelectedQuote({ ...selectedQuote, statut: newStatus, notes_internes: internalNotes });
    }
    return true;
  };

  const handleSaveAndClose = async () => {
    if (!selectedQuote) return;
    const success = await handleUpdateStatus(selectedQuote.id, selectedQuote.statut);
    if (success) setSelectedQuote(null);
  };

  const getStatusBadge = (statut: QuoteRequest['statut']) => {
    switch (statut) {
      case 'traite':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">TRAITÉ</span>;
      case 'en_cours':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">EN COURS</span>;
      case 'annule':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">ANNULÉ</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">NOUVEAU</span>;
    }
  };

  const columns: Column<QuoteRequest>[] = [
    {
      header: 'Référence & Date',
      render: (q) => (
        <div>
          <div className="font-mono font-bold text-white text-xs">{q.reference}</div>
          <div className="text-[10px] text-slate-500">{formatDate(q.created_at)}</div>
        </div>
      ),
    },
    {
      header: 'Client',
      render: (q) => (
        <div>
          <div className="font-bold text-white text-xs">{q.client_prenom} {q.client_nom}</div>
          <div className="text-[10px] text-slate-400">{q.client_telephone} • {q.client_email}</div>
        </div>
      ),
    },
    {
      header: 'Prestation',
      render: (q) => (
        <div>
          <div className="font-semibold text-white text-xs truncate max-w-[200px]">{q.service_type}</div>
          <div className="text-[10px] text-slate-500">{q.location}</div>
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (q) => getStatusBadge(q.statut),
    },
    {
      header: 'Actions',
      render: (q) => (
        <button
          onClick={() => handleOpenDetails(q)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Examiner</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Demandes de Devis</h2>
          <p className="text-xs text-slate-400">Demandes soumises via le formulaire de devis du site public.</p>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadQuotes} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des demandes de devis...</span>
        </div>
      ) : (
        <DataTable
          data={quotes}
          columns={columns}
          searchPlaceholder="Rechercher par référence, client, prestation..."
          searchFilter={(item, q) =>
            item.reference.toLowerCase().includes(q.toLowerCase()) ||
            item.client_nom.toLowerCase().includes(q.toLowerCase()) ||
            item.client_prenom.toLowerCase().includes(q.toLowerCase()) ||
            item.service_type.toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="devis-serein-ge.csv"
        />
      )}

      <Modal
        isOpen={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        title={selectedQuote ? `Devis ${selectedQuote.reference}` : 'Détail'}
        subtitle="Détail de la demande et suivi commercial."
        maxWidth="max-w-2xl"
      >
        {selectedQuote && (
          <div className="space-y-6 text-xs">

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Statut :</span>
                {getStatusBadge(selectedQuote.statut)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Faire évoluer :</span>
                <select
                  value={selectedQuote.statut}
                  disabled={saving}
                  onChange={(e) => handleUpdateStatus(selectedQuote.id, e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en_cours">En cours</option>
                  <option value="traite">Traité</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div>
                <div className="text-slate-500 uppercase text-[10px] font-bold">Client</div>
                <div className="font-bold text-white text-sm mt-0.5">{selectedQuote.client_prenom} {selectedQuote.client_nom}</div>
                {selectedQuote.client_entreprise && <div className="text-slate-300">{selectedQuote.client_entreprise}</div>}
                <div className="text-slate-300 mt-1">📞 {selectedQuote.client_telephone}</div>
                <div className="text-slate-400">✉️ {selectedQuote.client_email}</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase text-[10px] font-bold">Prestation Demandée</div>
                <div className="font-semibold text-white mt-0.5">{selectedQuote.service_type}</div>
                {selectedQuote.project_scope && <div className="text-slate-300">{selectedQuote.project_scope}</div>}
                <div className="text-slate-400 mt-1">{selectedQuote.location}{selectedQuote.surface_area ? ` • ${selectedQuote.surface_area}` : ''}</div>
                {selectedQuote.timeframe && <div className="text-emerald-400 font-medium mt-1">Délai : {selectedQuote.timeframe}</div>}
              </div>
            </div>

            {selectedQuote.description && (
              <div>
                <div className="font-bold text-white text-sm mb-1.5">Description du besoin</div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedQuote.description}
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Notes internes</label>
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Suivi commercial, montant proposé, relances..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleSaveAndClose}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald hover:bg-emerald-400 flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enregistrer et Fermer</span>
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
