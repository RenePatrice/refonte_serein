import React from 'react';
import { Bell, Search, ExternalLink, ShieldCheck, Globe, Wifi } from 'lucide-react';
import { AdminUser } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  currentUser: AdminUser;
}

export default function Header({ title, subtitle, currentUser }: HeaderProps) {
  return (
    <header className="h-18 bg-gray-950/95 backdrop-blur-md border-b border-gray-800 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold font-display text-gray-50">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Local Network Info */}
        {/* <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/40 border border-gray-800 text-xs text-gray-300 font-mono">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Poste LAN : <strong>0.0.0.0:5173</strong></span>
        </div> */}

        {/* Frontend link */}
        <a
          href="https://refonte-serein.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition"
          title="Ouvrir le site public"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Voir le Site Public</span>
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </a>

        {/* Notifications badge */}
        {/*<div className="relative">
          <button className="p-2.5 rounded-xl bg-black/40 border border-gray-800 text-gray-300 hover:text-gray-50 transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>*/}
      </div>
    </header>
  );
}
