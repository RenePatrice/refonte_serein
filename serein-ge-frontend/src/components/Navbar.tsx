'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Compass, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useCartStore } from '../lib/cart-store';
import { useSiteSettings } from './ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { logo_url } = useSiteSettings();

  const totalCount = useCartStore((state) => state.getTotalCount());
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'À Propos', href: '/a-propos' },
    { name: 'Départements', href: '/departements' },
    { name: 'Réalisations', href: '/realisations' },
    { name: 'Boutique & Équipements', href: '/produits', highlight: true },
    { name: 'Actualités', href: '/actualites' },
    { name: 'Recrutement', href: '/recrutement' },
    { name: 'Contact & Devis', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Topbar informative */}
      <div className="bg-slate-900/90 text-slate-300 text-xs border-b border-slate-800 py-1.5 px-4 sm:px-8 hidden md:block">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Distributeur Agréé CHCNAV & Toknav • Burkina Faso</span>
            </span>
            <span className="flex items-center space-x-1.5 hover:text-white transition">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Quartier Dassasgho, Ouagadougou, Burkina Faso</span>
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="tel:+22625300000" className="flex items-center space-x-1.5 hover:text-emerald-400 transition">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>(226) 25 36 42 94</span>
            </a>
            <a href="mailto:contact@serein-ge.bf" className="flex items-center space-x-1.5 hover:text-emerald-400 transition">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>contact@serein-ge.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className={`transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-lg border-b border-slate-800/80 py-3' : 'bg-slate-950/80 backdrop-blur-sm py-4'}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            {logo_url ? (
              <img
                src={logo_url}
                alt="SEREIN-GE"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-glow-emerald group-hover:scale-105 transition-transform duration-300 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-secondary flex items-center justify-center shadow-glow-emerald group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Compass className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                SEREIN<span className="text-emerald-400">-GE</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase whitespace-nowrap">
                Ingénierie & Géomatique
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 min-w-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 2xl:px-3 py-2 rounded-lg text-[13px] 2xl:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : link.highlight
                      ? 'text-emerald-300 hover:text-emerald-200 hover:bg-slate-900 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Cart & Quick Quote */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              aria-label="Ouvrir le panier"
              className="relative p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-emerald-400 transition flex items-center justify-center group shrink-0"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-glow-emerald animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Quick Quote CTA */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-glow-emerald transition-all hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
            >
              <span>Devis Rapide</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-[110px] bg-slate-950/98 backdrop-blur-xl border-b border-slate-800 p-6 shadow-2xl animate-in slide-in-from-top duration-200 z-50">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-glow-emerald"
              >
                Demander un Devis Gratuit
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
