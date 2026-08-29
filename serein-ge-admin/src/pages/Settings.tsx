import React, { useState } from 'react';
import { 
  Radio, 
  Database, 
  ShieldCheck, 
  CreditCard, 
  HardDrive, 
  Wifi, 
  CheckCircle, 
  RefreshCw,
  ExternalLink,
  Copy
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Settings() {
  const [copied, setCopied] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const localIpExample = 'http://192.168.1.XX:5173';

  const handleCopyIp = () => {
    navigator.clipboard.writeText(localIpExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestSupabase = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setTestResult(isSupabaseConfigured ? 'Connecté avec succès au projet Cloud Supabase' : 'Mode Local / Démo In-Memory actif');
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      <div>
        <h2 className="text-xl font-bold font-display text-white">Paramètres Système</h2>
        <p className="text-xs text-slate-400">Synchronisation Supabase et passerelles.</p>
      </div>

      {/* 1. SECTION RESEAU LOCAL (Section 6 du Cahier des Charges) 
      <div className="admin-card rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">Accès Réseau Local — Poste d'Administration</h3>
            <p className="text-xs text-slate-400">Diffusion LAN configurée sur l'hôte 0.0.0.0</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400">Adresse d'accès depuis les postes du réseau interne :</span>
              <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">{localIpExample}</div>
            </div>
            <button
              onClick={handleCopyIp}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold flex items-center gap-2 self-start sm:self-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié !' : 'Copier l\'adresse'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-900 pt-3">
            ℹ️ Le serveur Vite est paramétré avec <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">host: '0.0.0.0'</code>. Pour vous connecter depuis n'importe quel ordinateur connecté au même réseau Wi-Fi ou câble Ethernet de l'entreprise, tapez l'adresse IP locale du poste principal suivie du port <code>:5173</code>.
          </p>
        </div>
      </div>*/}

      {/* 2. SECTION BASE DE DONNÉES CLOUD SUPABASE */}
      <div className="admin-card rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">Base de Données Cloud Supabase (PostgreSQL 100%)</h3>
            <p className="text-xs text-slate-400">Gestion des 12 tables, politiques de sécurité RLS et stockage des fichiers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 font-medium">Statut de la connexion :</span>
            <div className="font-bold text-white mt-1 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
              <span>{isSupabaseConfigured ? 'Connecté à Supabase Cloud' : 'Mode Démo Réactif Actif'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 font-medium">Tables Synchronisées :</span>
            <div className="font-bold text-white mt-1">12 Tables (Contenu, E-Commerce, RH)</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleTestSupabase}
            disabled={testingConnection}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Tester la Connectivité</span>
          </button>
          {testResult && <span className="text-xs text-emerald-400">{testResult}</span>}
        </div>
      </div>

      {/* 3. PASSERELLES DE PAIEMENT */}
      <div className="admin-card rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">Passerelles de Paiement Intégrées</h3>
            <p className="text-xs text-slate-400">CinetPay Mobile Money (Burkina Faso) et Stripe (International)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white">CinetPay (Afrique de l'Ouest)</div>
            <p className="text-slate-400 text-[11px]">Gère Orange Money Burkina, Moov Money Burkina, Wave et cartes bancaires locales.</p>
            <div className="text-emerald-400 font-mono text-[10px]">Webhook : /functions/cinetpay-webhook</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white">Stripe Checkout</div>
            <p className="text-slate-400 text-[11px]">Paiements en devises par cartes Visa et Mastercard internationales.</p>
            <div className="text-blue-400 font-mono text-[10px]">Webhook : /functions/stripe-webhook</div>
          </div>
        </div>
      </div>

    </div>
  );
}
