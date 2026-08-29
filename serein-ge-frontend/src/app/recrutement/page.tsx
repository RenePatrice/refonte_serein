'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Upload, 
  Send, 
  X, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { INITIAL_JOB_OFFERS } from '../../lib/mock-data';
import { JobOffer } from '../../types';
import { formatDate } from '../../lib/formatters';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useSupabaseList } from '../../lib/useSupabaseData';

export default function RecruitmentPage() {
  const { data: jobOffers } = useSupabaseList('job_offers', INITIAL_JOB_OFFERS, { orderColumn: 'created_at', ascending: false });
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [applicationType, setApplicationType] = useState<'sur_offre' | 'spontanee'>('sur_offre');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    civilite: 'M.',
    nom: '',
    prenom: '',
    email: '',
    telephone: '+226 ',
    poste_souhaite: '',
    niveau_etude: 'Ingénieur (BAC+5)',
    annees_experience: 3,
    message: '',
    cvFile: null as File | null,
  });

  const handleApplyClick = (offer: JobOffer) => {
    setSelectedOffer(offer);
    setApplicationType('sur_offre');
    setFormData((prev) => ({
      ...prev,
      poste_souhaite: offer.titre,
    }));
  };

  const handleSpontaneousClick = () => {
    setSelectedOffer(null);
    setApplicationType('spontanee');
    setFormData((prev) => ({
      ...prev,
      poste_souhaite: 'Candidature Spontanée',
    }));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cvFile) {
      setSubmitError('Merci de joindre votre CV avant de soumettre votre candidature.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Mode démo hors-ligne : Supabase non configuré, on simule la confirmation
    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
      }, 1200);
      return;
    }

    try {
      const cvPath = `cvs/${Date.now()}_${formData.cvFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(cvPath, formData.cvFile);

      if (uploadError) {
        throw new Error("Échec de l'envoi du CV : " + uploadError.message);
      }

      const applicationPayload = {
        job_offer_id: selectedOffer ? selectedOffer.id : null,
        type_candidature: applicationType,
        poste_souhaite: formData.poste_souhaite || (selectedOffer ? selectedOffer.titre : 'Spontanée'),
        civilite: formData.civilite,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        niveau_etude: formData.niveau_etude,
        annees_experience: formData.annees_experience,
        cv_url: cvPath,
        message: formData.message || null,
        statut: 'nouveau',
      };

      const { error: insertError } = await supabase.from('applications').insert(applicationPayload);
      if (insertError) {
        throw new Error("Échec de l'enregistrement de la candidature : " + insertError.message);
      }

      // Email de confirmation : best-effort, ne bloque jamais la candidature
      // elle-même si le SMTP n'est pas encore configuré côté Supabase.
      supabase.functions
        .invoke('send-notification-email', {
          body: {
            type: 'application',
            posteSouhaite: applicationPayload.poste_souhaite,
            civilite: formData.civilite,
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            telephone: formData.telephone,
          },
        })
        .catch((err) => console.error('Email de confirmation non envoyé :', err));

      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Erreur soumission candidature:', err);
      setIsSubmitting(false);
      setSubmitError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Header Banner */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800 bg-grid-pattern text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Carrières & Recrutement</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-3">
            Rejoignez les Bâtisseurs de Précision de SEREIN-GE
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Vous êtes ingénieur géomètre, spécialiste SIG, topographe de chantier ou commercial high-tech ? Développez vos compétences au sein d'une équipe passionnée par l'innovation spatiale.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleSpontaneousClick}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              Déposer une Candidature Spontanée
            </button>
          </div>
        </div>
      </section>

      {/* Main Content: Offers List */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
          <h2 className="text-2xl font-bold font-display text-white">Offres d'Emploi Actuelles</h2>
          <p className="text-xs text-slate-400 mt-1">Consultez nos postes ouverts et postulez directement en ligne.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {jobOffers.map((offer) => (
            <div
              key={offer.id}
              className="glass-panel rounded-3xl p-8 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {offer.type_contrat}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Limite: {formatDate(offer.date_limite)}</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 font-display">
                  {offer.titre}
                </h3>
                
                <div className="text-xs text-slate-400 flex items-center gap-2 mb-4">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{offer.departement}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{offer.lieu}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-6">
                  {offer.description}
                </p>

                {offer.missions && (
                  <div className="space-y-1.5 mb-6">
                    <div className="text-xs font-semibold text-white">Missions principales :</div>
                    {offer.missions.slice(0, 2).map((m, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400 truncate">{offer.salaire_indicatif}</span>
                <button
                  onClick={() => handleApplyClick(offer)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Postuler à cette Offre</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Application Modal / Drawer */}
      {(selectedOffer || applicationType === 'spontanee') && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
            
            <button
              onClick={() => {
                setSelectedOffer(null);
                setApplicationType('sur_offre');
                setSubmitted(false);
                setSubmitError(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Candidature Transmise !</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Merci {formData.prenom}. Votre dossier pour le poste de <strong>{formData.poste_souhaite}</strong> a été transmis à la direction des ressources humaines de SEREIN-GE.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSelectedOffer(null);
                      setApplicationType('sur_offre');
                      setSubmitted(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs uppercase"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {applicationType === 'spontanee' ? 'Candidature Spontanée' : 'Postuler au poste'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                    {selectedOffer ? selectedOffer.titre : 'Dépôt de Candidature Spontanée'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Civilité</label>
                    <select
                      value={formData.civilite}
                      onChange={(e) => setFormData({ ...formData, civilite: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="M.">Monsieur (M.)</option>
                      <option value="Mme">Madame (Mme)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Niveau d'étude</label>
                    <select
                      value={formData.niveau_etude}
                      onChange={(e) => setFormData({ ...formData, niveau_etude: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="Ingénieur (BAC+5)">Ingénieur (BAC+5)</option>
                      <option value="Master / DESS (BAC+5)">Master / DESS (BAC+5)</option>
                      <option value="Licence / Technicien Supérieur (BAC+3)">Licence / Technicien Supérieur (BAC+3)</option>
                      <option value="DUT / BTS (BAC+2)">DUT / BTS (BAC+2)</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* CV File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Curriculum Vitae (PDF, DOCX) *
                  </label>
                  <div className="border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center hover:border-emerald-500/50 transition bg-slate-950/50">
                    <input
                      type="file"
                      id="cv-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFormData({ ...formData, cvFile: e.target.files[0] });
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 text-emerald-400 mb-1.5" />
                      <span className="text-xs text-slate-200 font-semibold">
                        {formData.cvFile ? formData.cvFile.name : 'Cliquez pour sélectionner votre CV'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Format PDF recommandé (max 10 Mo)</span>
                    </label>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message / Lettre de motivation</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Présentez vos motivations principales..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                    {submitError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer ma Candidature'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
