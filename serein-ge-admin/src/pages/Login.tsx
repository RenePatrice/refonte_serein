import React, { useState } from 'react';
import { Compass, Lock, Mail, ShieldCheck, ArrowRight, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { AdminUser } from '../types';
import { INITIAL_USERS } from '../lib/mock-admin-data';
import { isSupabaseConfigured } from '../lib/supabase';

interface LoginProps {
  onPasswordLogin: (email: string, password: string) => Promise<void>;
  onVerifyOtp: (email: string, code: string) => Promise<void>;
  onResendOtp: (email: string) => Promise<void>;
  onCancelOtp: () => void;
  pendingOtpEmail: string | null;
  onQuickDemoLogin?: (user: AdminUser) => void;
  initialError?: string | null;
}

export default function Login({
  onPasswordLogin,
  onVerifyOtp,
  onResendOtp,
  onCancelOtp,
  pendingOtpEmail,
  onQuickDemoLogin,
  initialError,
}: LoginProps) {
  const [email, setEmail] = useState(isSupabaseConfigured ? '' : 'admin@serein-ge.bf');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(initialError || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resent, setResent] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onPasswordLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingOtpEmail) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onVerifyOtp(pendingOtpEmail, code);
    } catch (err: any) {
      setError(err.message || 'Code invalide.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!pendingOtpEmail) return;
    setError('');
    try {
      await onResendOtp(pendingOtpEmail);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err: any) {
      setError(err.message || "Échec de l'envoi du code.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden">

      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md admin-card rounded-3xl p-8 sm:p-10 border border-slate-800 relative z-10 shadow-2xl space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto shadow-glow-emerald">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white">SEREIN-GE Admin</h1>
            <p className="text-xs text-slate-400 mt-1">Supervision & Tableau de Bord d'Entreprise</p>
          </div>
        </div>

        {pendingOtpEmail ? (
          <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs">
            <button
              type="button"
              onClick={onCancelOtp}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour</span>
            </button>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              Un code à 6 chiffres a été envoyé à <strong className="text-white">{pendingOtpEmail}</strong>. Il expire au bout de 5 minutes.
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Code de Vérification</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-center tracking-[0.5em] font-mono focus:outline-none focus:border-emerald-500"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Vérifier le Code</span><ArrowRight className="w-4 h-4" /></>}
            </button>

            <button
              type="button"
              onClick={handleResend}
              className="w-full text-center text-slate-400 hover:text-emerald-400 transition"
            >
              {resent ? 'Code renvoyé !' : 'Renvoyer le code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Adresse Email Professionnelle</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@serein-ge.bf"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Mot de Passe</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Connexion Sécurisée</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* Quick Demo Access Buttons — uniquement en mode démo hors-ligne */}
        {onQuickDemoLogin && !pendingOtpEmail && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="text-[11px] text-slate-400 text-center font-medium">Connexion rapide démo (Supabase non configuré) :</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onQuickDemoLogin(INITIAL_USERS[0])}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left transition group"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-400">Super Admin</div>
                <div className="text-[10px] text-slate-500">Patrice COMPAORÉ</div>
              </button>
              <button
                onClick={() => onQuickDemoLogin(INITIAL_USERS[1])}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left transition group"
              >
                <div className="text-xs font-bold text-white group-hover:text-teal-400">Éditeur</div>
                <div className="text-[10px] text-slate-500">Yacouba SANOU</div>
              </button>
            </div>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isSupabaseConfigured ? 'Mot de passe + code de vérification (Supabase Auth)' : 'Mode démo hors-ligne — Supabase non configuré'}</span>
        </div>

      </div>

    </div>
  );
}
