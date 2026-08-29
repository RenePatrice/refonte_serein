import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Users,
  Briefcase,
  Layers,
  Newspaper,
  Handshake,
  FileText,
  UserCog,
  Settings,
  Compass,
  Radio,
  LogOut,
  Bot,
  FileSignature
} from 'lucide-react';
import { AdminUser } from '../types';
import { isPathAllowed } from '../lib/permissions';

interface SidebarProps {
  currentUser: AdminUser;
  onLogout: () => void;
}

export default function Sidebar({ currentUser, onLogout }: SidebarProps) {
  const menuItems = [
    { label: 'Tableau de bord', path: '/', icon: LayoutDashboard },
    { label: 'Produits & Stock', path: '/produits', icon: Package, badge: 'Stock' },
    { label: 'Commandes', path: '/commandes', icon: ShoppingBag },
    { label: 'Demandes de Devis', path: '/devis', icon: FileSignature },
    { label: 'Paiements & Logs', path: '/paiements', icon: CreditCard },
    { label: 'Équipe & Experts', path: '/equipe', icon: Users },
    { label: 'Réalisations / Projets', path: '/realisations', icon: Layers },
    { label: 'Actualités & Blog', path: '/actualites', icon: Newspaper },
    { label: 'Partenaires & Marques', path: '/partenaires', icon: Handshake },
    { label: 'Offres d\'Emploi', path: '/offres', icon: Briefcase },
    { label: 'Candidatures (CV)', path: '/candidatures', icon: FileText, highlight: true },
    { label: 'Assistant IA & Chatbot', path: '/chatbot', icon: Bot },
    { label: 'Utilisateurs & Rôles', path: '/utilisateurs', icon: UserCog },
    { label: 'Paramètres & Réseau', path: '/parametres', icon: Settings },
  ];

  const visibleItems = menuItems.filter((item) => isPathAllowed(currentUser.role, item.path));

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">

      {/* Top Brand */}
      <div>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold font-display text-gray-50 tracking-tight flex items-center gap-1">
                SEREIN<span className="text-emerald-400">-GE</span>
              </span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold block">
                ADMINISTRATION
              </span>
            </div>
          </div>
        </div>

        {/* LAN Indicator */}
        <div className="px-4 py-2.5 bg-black/40 border-b border-gray-800 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Réseau Local Actif</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] text-gray-400 font-mono">
            :5173
          </span>
        </div>

        {/* Nav list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-500 text-white font-bold shadow-glow-emerald'
                      : 'text-gray-400 hover:text-gray-50 hover:bg-gray-800/70'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-gray-800 bg-black/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80'}
              alt={currentUser.nom_complet}
              className="w-9 h-9 rounded-xl object-cover border border-gray-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-50 truncate">{currentUser.nom_complet}</div>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                {currentUser.role === 'super_admin' ? 'Super Admin' : 'Éditeur'}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Se déconnecter"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
}
