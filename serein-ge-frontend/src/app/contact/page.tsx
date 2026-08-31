'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Compass,
  Layers,
  Building2,
  Cpu,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { generateQuoteReference } from '../../lib/formatters';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Leaflet accède à `window` à l'import : le rendu doit rester strictement
// côté client, y compris pendant le pré-rendu statique de `next build`.
const ContactMap = dynamic(() => import('../../components/ContactMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500">
      Chargement de la carte...
    </div>
  ),
});

export default function ContactAndQuotePage() {
  const [wizardStep, setWizardStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [quoteData, setQuoteData] = useState({
    serviceType: 'Topographie & Géodésie',
    projectScope: 'Levé topographique classique',
    surfaceArea: '',
    location: 'Ouagadougou',
    timeframe: 'Urgent (< 2 semaines)',
    budgetEstimate: 'Standard',
    nom: '',
    prenom: '',
    entreprise: '',
    email: '',
    telephone: '+226 ',
    description: '',
  });

  const handleNextStep = () => {
    setWizardStep((prev) => Math.min(3, prev + 1));
  };

  const handlePrevStep = () => {
    setWizardStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    const reference = generateQuoteReference();

    const payload = {
      reference,
      service_type: quoteData.serviceType,
      project_scope: quoteData.projectScope || null,
      surface_area: quoteData.surfaceArea || null,
      location: quoteData.location,
      timeframe: quoteData.timeframe || null,
      budget_estimate: quoteData.budgetEstimate || null,
      client_nom: quoteData.nom,
      client_prenom: quoteData.prenom,
      client_entreprise: quoteData.entreprise || null,
      client_email: quoteData.email,
      client_telephone: quoteData.telephone,
      description: quoteData.description || null,
      statut: 'nouveau',
    };

    // Mode démo hors-ligne : Supabase non configuré, on simule la confirmation
    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => {
        setIsSubmitting(false);
        setQuoteSubmitted(true);
      }, 1200);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('quote_requests').insert(payload);
      if (insertError) {
        throw new Error("Échec de l'enregistrement de la demande : " + insertError.message);
      }

      // Email de confirmation : best-effort, ne bloque jamais la demande de
      // devis elle-même si le SMTP n'est pas encore configuré.
      supabase.functions
        .invoke('send-notification-email', {
          body: {
            type: 'quote',
            reference,
            posteSouhaite: quoteData.serviceType,
            nom: quoteData.nom,
            prenom: quoteData.prenom,
            email: quoteData.email,
            telephone: quoteData.telephone,
          },
        })
        .catch((err) => console.error('Email de confirmation non envoyé :', err));

      setIsSubmitting(false);
      setQuoteSubmitted(true);
    } catch (err: any) {
      console.error('Erreur soumission devis:', err);
      setIsSubmitting(false);
      setSubmitError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Header Banner */}
      <section className="py-16 bg-slate-900/60 border-b border-slate-800 bg-grid-pattern text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Contact & Assistance</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-3">
            Demande de Devis & Coordonnées
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Obtenez une estimation technique et financière personnalisée sous 24h ou contactez nos ingénieurs à Ouagadougou.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Column : Contact Details & Interactive Headquarters Card */}
          <div className="space-y-6">
            
            <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
              <h2 className="text-xl font-bold font-display text-white">Nos Bureaux à Ouagadougou</h2>
              
              <ul className="space-y-4 text-xs sm:text-sm">
                <li className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Siège Social SEREIN-GE</div>
                    <div className="text-slate-400 mt-0.5 leading-relaxed">
                      Dassasgho, Ouagadougou, Burkina Faso
                    </div>
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Téléphone Standard</div>
                    <div className="text-slate-400 mt-0.5">+226 25 30 00 00 / +226 70 00 00 00</div>
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Courrier Électronique</div>
                    <div className="text-slate-400 mt-0.5">contact@serein-ge.bf</div>
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Heures d'Ouverture</div>
                    <div className="text-slate-400 mt-0.5">Lundi au Vendredi : 08h00 - 12h30 / 15h00 - 18h00</div>
                  </div>
                </li>
              </ul>

              <div className="pt-2">
                <a
                  href="https://wa.me/22677880445"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Discussion Instantanée WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Interactive Map Card */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Localisation GPS du Siège</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">12°22'36.62"N, 1°28'0.07"O</span>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <ContactMap />
              </div>
              <div className="text-center">
                <div className="text-[11px] text-slate-400">Non loin du CHU Charles De Gaule</div>
                <a
                  href="https://maps.app.goo.gl/xEMAM5pSkH8GHfta6"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-1 text-[10px] text-emerald-400 underline"
                >
                  Ouvrir dans Google Maps &rarr;
                </a>
              </div>
            </div>

          </div>

          {/* Right Column : Multi-Step Quote Wizard */}
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl">
              
              {quoteSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">Demande de Devis Enregistrée !</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Merci <strong>{quoteData.nom} {quoteData.prenom}</strong>. Nos ingénieurs géomètres étudient votre demande pour la prestation <em>{quoteData.serviceType}</em> et vous recontacteront par téléphone/email avec des informations précises.
                  </p>
                  <div className="pt-6">
                    <button
                      onClick={() => {
                        setQuoteSubmitted(false);
                        setWizardStep(1);
                      }}
                      className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider"
                    >
                      Nouvelle Demande
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuote}>
                  
                  {/* Wizard Step Progress */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Étape {wizardStep} sur 3
                      </span>
                      <h2 className="text-xl font-bold font-display text-white mt-0.5">
                        {wizardStep === 1 && 'Choix de la Prestation ou Équipement'}
                        {wizardStep === 2 && 'Caractéristiques du Projet & Délais'}
                        {wizardStep === 3 && 'Vos Coordonnées & Validation'}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${wizardStep >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                      <span className={`w-3 h-3 rounded-full ${wizardStep >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                      <span className={`w-3 h-3 rounded-full ${wizardStep >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    </div>
                  </div>

                  {/* STEP 1 */}
                  {wizardStep === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <label className="block text-xs font-semibold text-slate-300">
                        Sélectionnez la nature principale de votre besoin :
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { title: 'Topographie & Géodésie', desc: 'Levés polygonaux, bornage, nivellement de précision', icon: <Compass className="w-5 h-5 text-emerald-400" /> },
                          { title: 'Cartographie par Drone & LiDAR', desc: 'Orthophotos haute résolution, MNT/MNS, cubatures', icon: <Layers className="w-5 h-5 text-teal-400" /> },
                          { title: 'Infrastructures BTP / VRD', desc: 'Tracé routier, assainissement, contrôle de remblais', icon: <Building2 className="w-5 h-5 text-cyan-400" /> },
                          { title: 'Achat d\'Instruments CHCNAV / Toknav', desc: 'Récepteurs GNSS RTK, stations totales, carnets durcis', icon: <Cpu className="w-5 h-5 text-amber-400" /> },
                        ].map((srv) => (
                          <div
                            key={srv.title}
                            onClick={() => setQuoteData({ ...quoteData, serviceType: srv.title })}
                            className={`p-5 rounded-2xl border cursor-pointer transition flex items-start space-x-3.5 ${
                              quoteData.serviceType === srv.title
                                ? 'bg-emerald-950/40 border-emerald-500 shadow-glow-emerald'
                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                              {srv.icon}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">{srv.title}</div>
                              <div className="text-xs text-slate-400 mt-1">{srv.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition flex items-center gap-2"
                        >
                          <span>Suivant</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {wizardStep === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Superficie ou Longueur estimée</label>
                          <input
                            type="text"
                            value={quoteData.surfaceArea}
                            onChange={(e) => setQuoteData({ ...quoteData, surfaceArea: e.target.value })}
                            placeholder="Ex: 50 hectares ou 25 km"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Localisation du Projet</label>
                          <input
                            type="text"
                            value={quoteData.location}
                            onChange={(e) => setQuoteData({ ...quoteData, location: e.target.value })}
                            placeholder="Ex: Ouagadougou, Bobo-Dioulasso, Koudougou..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Délai souhaité d'intervention</label>
                          <select
                            value={quoteData.timeframe}
                            onChange={(e) => setQuoteData({ ...quoteData, timeframe: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Urgent (< 2 semaines)">Urgent (&lt; 2 semaines)</option>
                            <option value="Dans le mois">Dans le mois</option>
                            <option value="Dans les 3 mois">Dans les 3 mois</option>
                            <option value="Phase d'étude / Appel d'offres">Phase d'étude / Appel d'offres</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description détaillée de vos attentes</label>
                          <textarea
                            rows={4}
                            value={quoteData.description}
                            onChange={(e) => setQuoteData({ ...quoteData, description: e.target.value })}
                            placeholder="Précisez le type de livrables attendus (plans DWG, MNT, nuage de points LiDAR, rapport géodésique...)"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="pt-6 flex justify-between">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Retour</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition flex items-center gap-2"
                        >
                          <span>Suivant</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {wizardStep === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nom *</label>
                          <input
                            type="text"
                            required
                            value={quoteData.nom}
                            onChange={(e) => setQuoteData({ ...quoteData, nom: e.target.value })}
                            placeholder="Votre nom"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Prénom *</label>
                          <input
                            type="text"
                            required
                            value={quoteData.prenom}
                            onChange={(e) => setQuoteData({ ...quoteData, prenom: e.target.value })}
                            placeholder="Votre prénom"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Entreprise / Institution</label>
                          <input
                            type="text"
                            value={quoteData.entreprise}
                            onChange={(e) => setQuoteData({ ...quoteData, entreprise: e.target.value })}
                            placeholder="Nom de l'entité"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Numéro de Téléphone *</label>
                          <input
                            type="tel"
                            required
                            value={quoteData.telephone}
                            onChange={(e) => setQuoteData({ ...quoteData, telephone: e.target.value })}
                            placeholder="+226 70 00 00 00"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adresse Email *</label>
                          <input
                            type="email"
                            required
                            value={quoteData.email}
                            onChange={(e) => setQuoteData({ ...quoteData, email: e.target.value })}
                            placeholder="contact@domaine.com"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Summary Strip */}
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1 text-slate-400">
                        <div>Prestation : <strong className="text-emerald-400">{quoteData.serviceType}</strong></div>
                        <div>Localisation : <strong className="text-white">{quoteData.location}</strong> ({quoteData.timeframe})</div>
                      </div>

                      {submitError && (
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                          {submitError}
                        </div>
                      )}

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Retour</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isSubmitting ? 'Transmission...' : 'Envoyer la Demande de Devis'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                </form>
              )}

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
