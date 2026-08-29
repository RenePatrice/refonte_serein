import React from 'react';
import Link from 'next/link';
import {
  Target,
  Eye,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import TeamGrid from './TeamGrid';

export const metadata = {
  title: 'À Propos de SEREIN-GE | Histoire, Vision & Équipe d\'Ingénieurs',
  description: 'Découvrez la Société d\'Études, de Recherches, d\'Expertise et d\'Ingénierie Géomatique (SEREIN-GE) : notre vision, nos valeurs et nos experts à Ouagadougou.',
};

export default function AboutPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Header Banner */}
      <section className="relative py-20 bg-slate-900/60 border-b border-slate-800 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Qui sommes-nous ?</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-3">
            L'Excellence Géomatique & l'Ingénierie de Haute Précision
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            SEREIN-GE est un cabinet d'ingénierie multidisciplinaire pionnier en Afrique de l'Ouest, spécialisé dans la mesure spatiale de précision, l'aménagement du territoire et la fourniture de solutions technologiques de pointe.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Valeurs */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Notre Mission</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Fournir aux décideurs publics, industriels miniers et bâtisseurs des données spatiales et géométriques infaillibles, garantissant la pérennité et la sécurité optimale de leurs investissements d'infrastructures.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold">
              Rigueur • Fiabilité • Rapidité
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Notre Vision</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Être le partenaire technologique incontournable de la transition numérique du territoire au Sahel, en démocratisant les technologies GNSS RTK, les scanners LiDAR 3D et les géoportails WebSIG.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-teal-400 font-semibold">
              Innovation • Digitalisation • Impact
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Nos Valeurs</h3>
              <ul className="text-xs sm:text-sm text-slate-400 space-y-2.5">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Précision :</strong> Tolérance zéro à l'approximation.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Éthique & Intégrité :</strong> Démarche assermentée.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Accompagnement :</strong> Transfert de compétences et SAV.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-cyan-400 font-semibold">
              Assermentation • Excellence
            </div>
          </div>

        </div>
      </section>

      {/* Leadership & Équipe */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Capital Humain & Expertise</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
              L'Équipe Dirigeante & Technique
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Des ingénieurs géomètres assermentés, experts en géomatique et techniciens supérieurs certifiés.
            </p>
          </div>

          <TeamGrid />

        </div>
      </section>

      {/* CTA Contact */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold font-display text-white">
            Vous avez un projet ou souhaitez rejoindre nos équipes ?
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Nous sommes à votre disposition pour analyser vos besoins et mobiliser nos brigades d'ingénierie.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-glow-emerald transition"
            >
              Prendre Contact
            </Link>
            <Link
              href="/recrutement"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition"
            >
              Rejoindre l'Équipe
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
