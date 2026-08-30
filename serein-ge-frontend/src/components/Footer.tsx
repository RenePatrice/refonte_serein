'use client';

import React from 'react';
import { useSiteSettings } from './ThemeProvider';
import Link from 'next/link';
import { 
  Compass, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck,
  ArrowRight,
  Smartphone
} from 'lucide-react';

export default function Footer() {
  const { logo_url } = useSiteSettings();
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      {/* Pre-footer : Avantages & Engagements */}
      <div className="border-b border-slate-800/60 py-10 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Garantie & Authenticité</h4>
              <p className="text-xs text-slate-400 mt-1">Équipements certifiés d'origine CHCNAV & Toknav avec garantie constructeur de 2 ans.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">SAV & Étalonnage Local</h4>
              <p className="text-xs text-slate-400 mt-1">Atelier technique et banc d'étalonnage à Ouagadougou. Réparation et calibration rapides.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Commande Directe & Suivi Personnalisé</h4>
              <p className="text-xs text-slate-400 mt-1">Votre commande est transmise instantanément par WhatsApp et par email à un conseiller dédié.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Formation Terrain</h4>
              <p className="text-xs text-slate-400 mt-1">Prise en main et formation des opérateurs offertes pour chaque achat d'instrument.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              {logo_url ? (
                <img src={logo_url} alt="SEREIN-GE" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-secondary flex items-center justify-center">
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold font-display text-white">
                    SEREIN<span className="text-emerald-400">-GE</span>
                  </span>
                </>
              )}
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed pr-6">
              Société d'Études, de Recherches, d'Expertise et d'Ingénierie Géomatique. Leader au Burkina Faso et en Afrique de l'Ouest dans les levés géodésiques, le contrôle d'infrastructures et la distribution d'équipements de mesure de haute précision.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Bureaux ouverts: Lun - Ven (08h00 - 18h00)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Départements & Métiers */}
          <div>
            <h3 className="font-semibold text-white uppercase text-xs tracking-wider mb-4">Nos Pôles d'Expertise</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/departements#topographie" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>Topographie & Géodésie</span>
                </Link>
              </li>
              <li>
                <Link href="/departements#geomatique" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>Géomatique & WebSIG</span>
                </Link>
              </li>
              <li>
                <Link href="/departements#ingenierie" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>Infrastructures BTP / VRD</span>
                </Link>
              </li>
              <li>
                <Link href="/produits" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>Vente & Location Matériel</span>
                </Link>
              </li>
              <li>
                <Link href="/realisations" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>Nos Réalisations Phares</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Boutique & Équipements */}
          <div>
            <h3 className="font-semibold text-white uppercase text-xs tracking-wider mb-4">Boutique & Instruments</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/produits?cat=gnss" className="hover:text-emerald-400 transition">
                  Récepteurs GNSS RTK IMU
                </Link>
              </li>
              <li>
                <Link href="/produits?brand=CHCNAV" className="hover:text-emerald-400 transition">
                  Gamme CHCNAV (i90, i73+)
                </Link>
              </li>
              <li>
                <Link href="/produits?brand=Toknav" className="hover:text-emerald-400 transition">
                  Gamme Toknav (T20 Pro AR)
                </Link>
              </li>
              <li>
                <Link href="/produits?cat=stations" className="hover:text-emerald-400 transition">
                  Stations Totales FOIF
                </Link>
              </li>
              <li>
                <Link href="/produits?cat=drones" className="hover:text-emerald-400 transition">
                  Drones & Scanners LiDAR
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition">
                  Demande de Devis Matériel
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Siège */}
          <div>
            <h3 className="font-semibold text-white uppercase text-xs tracking-wider mb-4">Siège Social</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Avenue Pascal ZAGRÉ, Ouaga 2000, Ouagadougou, Burkina Faso</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">+226 25 30 00 00 / 70 00 00 00</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">contact@serein-ge.bf</span>
              </li>
              <li className="pt-2">
                <Link
                  href="/recrutement"
                  className="inline-block text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  Postuler à nos offres d'emploi &rarr;
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SEREIN-GE (Société d'Études, de Recherches et d'Ingénierie Géomatique). Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
