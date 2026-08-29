'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  Layers,
  Building2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Send,
  Zap,
  MapPin
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import RealisationCard from '../components/RealisationCard';
import ArticleCard from '../components/ArticleCard';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_PRODUCTS,
  INITIAL_REALISATIONS,
  INITIAL_NEWS,
  INITIAL_PARTNERS
} from '../lib/mock-data';
import { useSupabaseList } from '../lib/useSupabaseData';

export default function HomePage() {
  const { data: departments } = useSupabaseList('departments', INITIAL_DEPARTMENTS, { orderColumn: 'ordre' });
  const { data: products } = useSupabaseList('products', INITIAL_PRODUCTS, { orderColumn: 'created_at', ascending: false });
  const { data: realisations } = useSupabaseList('realisations', INITIAL_REALISATIONS, { orderColumn: 'created_at', ascending: false });
  const { data: news } = useSupabaseList('actualites', INITIAL_NEWS, { orderColumn: 'date_publication', ascending: false });
  const { data: partners } = useSupabaseList('partners', INITIAL_PARTNERS, { orderColumn: 'ordre' });

  const featured = products.filter((p) => p.en_vedette);
  const featuredProducts = (featured.length > 0 ? featured : products).slice(0, 3);

  const highlighted = realisations.filter((r) => r.a_la_une);
  const featuredRealisations = (highlighted.length > 0 ? highlighted : realisations).slice(0, 3);

  const latestNews = news.slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-slate-950 overflow-hidden bg-grid-pattern pt-10 pb-20">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-glow-emerald animate-pulse-slow">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Excellence Géodésique, Ingénierie & Distribution High-Tech</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
            La Référence en <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Ingénierie Géomatique</span> & Solutions de Précision.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Études topographiques de haute précision, modélisation 3D du territoire et distributeur agréé des instruments <strong>CHCNAV</strong>, <strong>Toknav</strong> et <strong>FOIF</strong> au Burkina Faso et en Afrique de l'Ouest.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/produits"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base shadow-glow-emerald transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Explorer la Boutique d'Instruments</span>
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700 hover:border-emerald-500/50 backdrop-blur-md transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Demander un Devis d'Étude</span>
            </Link>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <div className="text-3xl sm:text-4xl font-extrabold font-display text-emerald-400">18+</div>
              <div className="text-xs text-slate-400 mt-1">Années d'Expérience</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <div className="text-3xl sm:text-4xl font-extrabold font-display text-teal-400">550+</div>
              <div className="text-xs text-slate-400 mt-1">Projets Réalisés</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <div className="text-3xl sm:text-4xl font-extrabold font-display text-cyan-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">SAV & Calibration Locale</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <div className="text-3xl sm:text-4xl font-extrabold font-display text-emerald-400">2 Ans</div>
              <div className="text-xs text-slate-400 mt-1">Garantie Constructeur</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. DEPARTEMENTS / NOS PÔLES D'EXPERTISE */}
      <section className="py-24 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Nos Domaines d'Intervention</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
              Une Synergie Complète au Service du Territoire
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-4">
              De l'arpentage foncier à la modélisation spatiale avancée, nous accompagnons les institutions publiques, entreprises BTP et sociétés minières.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {departments.map((dept, idx) => {
              const icons = [
                <Compass className="w-7 h-7 text-emerald-400" key="1" />,
                <Layers className="w-7 h-7 text-teal-400" key="2" />,
                <Building2 className="w-7 h-7 text-cyan-400" key="3" />,
                <Cpu className="w-7 h-7 text-amber-400" key="4" />,
              ];
              return (
                <div 
                  key={dept.id}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-slate-800 group hover:border-emerald-500/50"
                >
                  <div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 w-fit mb-5 group-hover:scale-110 transition-transform">
                      {icons[idx % icons.length]}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {dept.nom}
                    </h3>
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                      {dept.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <Link
                      href={`/departements/${dept.slug}/`}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. VEDETTES BOUTIQUE / INSTRUMENTS TOPOGRAPHIQUES */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Matériel & Instruments</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
                Équipements Topographiques en Vedette
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                Commandez vos récepteurs GNSS RTK, stations totales et carnets durcis avec livraison immédiate à Ouagadougou et expédition en sous-région.
              </p>
            </div>
            <Link
              href="/produits"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 group"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Brand partnership banner */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Besoin d'une démonstration sur votre chantier ?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Nos ingénieurs d'application viennent tester le matériel directement sur vos points de contrôle.</p>
              </div>
            </div>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition shrink-0"
            >
              Réserver une Démonstration
            </Link>
          </div>

        </div>
      </section>

      {/* 4. RÉALISATIONS PHARES */}
      <section className="py-24 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Portfolio & Projets</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
                Nos Dernières Réalisations
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                Découvrez comment nous mettons la haute précision géométrique au service des grands ouvrages de développement.
              </p>
            </div>
            <Link
              href="/realisations"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 group"
            >
              <span>Toutes les réalisations</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRealisations.map((realisation) => (
              <RealisationCard key={realisation.id} realisation={realisation} />
            ))}
          </div>

        </div>
      </section>

      {/* 5. POURQUOI CHOISIR SEREIN-GE ? */}
      <section className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Nos Atouts Différenciateurs</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2 leading-tight">
                Une Expertise Reconnue par les Plus Grands Donneurs d'Ordres
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
                SEREIN-GE combine rigueur académique d'ingénieurs géomètres assermentés et technologies de mesure de dernière génération pour des résultats fiables, conformes et reproductibles.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Parc d'Instruments Étalonné Régulièrement</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Certificats de calibration délivrés sur banc optique de référence.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Intégration WebSIG & Télédétection Drone</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Livraison de géoportails interactifs avec consultation cartographique sécurisée.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Disponibilité Immédiate de Pièces & SAV</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Batteries, câbles, cannes carbone, prismes et trépieds en stock permanent à Ouagadougou.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  href="/a-propos"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition inline-flex items-center gap-2"
                >
                  <span>Découvrir l'Histoire & l'Équipe</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
                <Image
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
                  alt="Équipe SEREIN-GE sur le terrain"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Précision Centimétrique Garantie</div>
                      <div className="text-[11px] text-slate-400">Rattachement géodésique conforme ITRF/WGS84</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. ACTUALITÉS & INSIGHTS */}
      <section className="py-24 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Veille & Blog</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
                Actualités & Innovations Techniques
              </h2>
            </div>
            <Link
              href="/actualites"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 group"
            >
              <span>Tous les articles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {latestNews.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. PARTENAIRES & CONSTRUCTEURS */}
      <section className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nos Partenaires Technologiques Mondiaux</span>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {partners.map((partner) => (
              <div 
                key={partner.id} 
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col items-center justify-center hover:border-emerald-500/30 transition group"
              >
                <span className="font-display font-bold text-lg text-slate-300 group-hover:text-emerald-400 transition">
                  {partner.nom}
                </span>
                <span className="text-[10px] text-slate-500 uppercase mt-1">{partner.categorie}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BANNIÈRE FINALE / CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
            Prêt à Réussir Vos Projets avec une Précision Absolue ?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light">
            Contactez nos ingénieurs géomètres à Ouagadougou pour une étude personnalisée ou commandez directement votre équipement en ligne.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-glow-emerald transition transform hover:-translate-y-0.5"
            >
              Demander un Devis en Ligne
            </Link>
            <Link
              href="/produits"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition"
            >
              Consulter le Catalogue Produits
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
