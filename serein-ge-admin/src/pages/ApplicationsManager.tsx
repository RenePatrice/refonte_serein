import React, { useEffect, useState } from 'react';
import { FileText, Download, Eye, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { Application } from '../types';
import { INITIAL_APPLICATIONS } from '../lib/mock-admin-data';
import { formatDate } from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function ApplicationsManager() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [cvDownloading, setCvDownloading] = useState(false);

  const loadApplications = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setApplications(INITIAL_APPLICATIONS);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });

    if (error) {
      setLoadError('Impossible de charger les candidatures : ' + error.message);
    } else {
      setApplications((data || []) as Application[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDetails = (app: Application) => {
    setSelectedApp(app);
    setRecruiterNotes(app.notes_recruteur || '');
  };

  const handleUpdateStatus = async (appId: string, newStatus: Application['statut']): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setApplications(
        applications.map((a) => (a.id === appId ? { ...a, statut: newStatus, notes_recruteur: recruiterNotes } : a))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, statut: newStatus, notes_recruteur: recruiterNotes });
      }
      return true;
    }

    setSaving(true);
    const { error } = await supabase
      .from('applications')
      .update({ statut: newStatus, notes_recruteur: recruiterNotes })
      .eq('id', appId);
    setSaving(false);

    if (error) {
      alert('Échec de la mise à jour : ' + error.message);
      return false;
    }

    setApplications(
      applications.map((a) => (a.id === appId ? { ...a, statut: newStatus, notes_recruteur: recruiterNotes } : a))
    );
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, statut: newStatus, notes_recruteur: recruiterNotes });
    }
    return true;
  };

  const handleSaveAndClose = async () => {
    if (!selectedApp) return;
    const success = await handleUpdateStatus(selectedApp.id, selectedApp.statut);
    if (success) {
      setSelectedApp(null);
    }
  };

  const handleDownloadCV = async (app: Application) => {
    if (!isSupabaseConfigured || !supabase) {
      window.open(app.cv_url, '_blank');
      return;
    }

    setCvDownloading(true);
    const { data, error } = await supabase.storage.from('cvs').createSignedUrl(app.cv_url, 300);
    setCvDownloading(false);

    if (error || !data?.signedUrl) {
      alert('Échec de la génération du lien de téléchargement : ' + (error?.message || 'inconnu'));
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const getStatusBadge = (statut: Application['statut']) => {
    switch (statut) {
      case 'retenu':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">RETENU</span>;
      case 'entretien':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">ENTRETIEN</span>;
      case 'en_revue':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">EN REVUE</span>;
      case 'rejete':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">REJETÉ</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">NOUVEAU</span>;
    }
  };

  const columns: Column<Application>[] = [
    {
      header: 'Candidat & Contact',
      render: (a) => (
        <div>
          <div className="font-bold text-white text-xs">{a.civilite} {a.prenom} {a.nom}</div>
          <div className="text-[10px] text-slate-400">{a.telephone} • {a.email}</div>
        </div>
      ),
    },
    {
      header: 'Poste / Offre',
      render: (a) => (
        <div>
          <div className="font-semibold text-white text-xs truncate max-w-[200px]">{a.poste_souhaite}</div>
          <span className="text-[10px] text-emerald-400 font-mono uppercase">{a.type_candidature}</span>
        </div>
      ),
    },
    {
      header: 'Formation & Expérience',
      render: (a) => (
        <div className="text-xs text-slate-300">
          <div>{a.niveau_etude}</div>
          <div className="text-[10px] text-slate-500">{a.annees_experience} an(s) d'expérience</div>
        </div>
      ),
    },
    {
      header: 'Statut Pipeline',
      render: (a) => getStatusBadge(a.statut),
    },
    {
      header: 'CV & Examen',
      render: (a) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenDetails(a)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Examiner</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Gestion des Candidatures & Recrutement</h2>
          <p className="text-xs text-slate-400">Examen des CV reçus, suivi du pipeline de recrutement et annotation interne.</p>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadApplications} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des candidatures...</span>
        </div>
      ) : (
        <DataTable
          data={applications}
          columns={columns}
          searchPlaceholder="Rechercher par nom, poste, email..."
          searchFilter={(item, q) =>
            item.nom.toLowerCase().includes(q.toLowerCase()) ||
            item.prenom.toLowerCase().includes(q.toLowerCase()) ||
            item.poste_souhaite.toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="candidatures-serein-ge.csv"
        />
      )}

      {/* Candidate Review Modal */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp ? `Dossier de Candidature : ${selectedApp.prenom} ${selectedApp.nom}` : 'Détail'}
        subtitle="Examen des pièces jointes et mise à jour du statut."
        maxWidth="max-w-3xl"
      >
        {selectedApp && (
          <div className="space-y-6 text-xs">

            {/* Status change bar */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Statut RH :</span>
                {getStatusBadge(selectedApp.statut)}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Faire évoluer le statut :</span>
                <select
                  value={selectedApp.statut}
                  disabled={saving}
                  onChange={(e) => handleUpdateStatus(selectedApp.id, e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                >
                  <option value="nouveau">Nouveau dossier</option>
                  <option value="en_revue">En cours d'examen</option>
                  <option value="entretien">Entretien planifié</option>
                  <option value="retenu">Candidature Retenue</option>
                  <option value="rejete">Candidature Rejetée</option>
                </select>
              </div>
            </div>

            {/* Candidate summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div>
                <div className="text-slate-500 uppercase text-[10px] font-bold">Identité & Coordonnées</div>
                <div className="font-bold text-white text-sm mt-0.5">{selectedApp.civilite} {selectedApp.prenom} {selectedApp.nom}</div>
                <div className="text-slate-300 mt-1">📞 {selectedApp.telephone}</div>
                <div className="text-slate-400">✉️ {selectedApp.email}</div>
              </div>

              <div>
                <div className="text-slate-500 uppercase text-[10px] font-bold">Profil & Qualification</div>
                <div className="font-semibold text-white mt-0.5">{selectedApp.niveau_etude}</div>
                <div className="text-slate-300">{selectedApp.annees_experience} an(s) d'expérience professionnelle</div>
                <div className="text-emerald-400 font-medium mt-1">Poste ciblé : {selectedApp.poste_souhaite}</div>
              </div>
            </div>

            {/* Message / Motivation */}
            {selectedApp.message && (
              <div>
                <div className="font-bold text-white text-sm mb-1.5">Message / Lettre de motivation</div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedApp.message}
                </div>
              </div>
            )}

            {/* CV Download Strip */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">Curriculum Vitae (CV)</div>
                  <div className="text-[10px] text-slate-400">Document PDF déposé par le candidat</div>
                </div>
              </div>
              <button
                onClick={() => handleDownloadCV(selectedApp)}
                disabled={cvDownloading}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {cvDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Télécharger le CV</span>
              </button>
            </div>

            {/* Recruiter Notes */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Notes internes du Recruteur</label>
              <textarea
                rows={3}
                value={recruiterNotes}
                onChange={(e) => setRecruiterNotes(e.target.value)}
                placeholder="Ajoutez vos remarques après entretien ou analyse du dossier..."
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
