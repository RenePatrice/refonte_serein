import React, { useEffect, useState } from 'react';
import { Bot, Loader2, AlertTriangle, RefreshCw, Save, Sparkles } from 'lucide-react';
import { ChatbotSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEFAULT_SETTINGS: ChatbotSettings = {
  id: 'demo',
  is_enabled: false,
  welcome_message: "Bonjour ! Je suis l'assistant SEREIN-GE, comment puis-je vous aider ?",
  system_prompt:
    "Tu es l'assistant virtuel de SEREIN-GE, distributeur agréé CHCNAV et Toknav au Burkina Faso, spécialisé en topographie, géomatique et ingénierie BTP. Réponds de façon concise, professionnelle et en français.",
};

export default function ChatbotManager() {
  const [settings, setSettings] = useState<ChatbotSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('chatbot_settings').select('*').limit(1).maybeSingle();

    if (error) {
      setLoadError('Impossible de charger la configuration du chatbot : ' + error.message);
    } else if (data) {
      setSettings(data as ChatbotSettings);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    setSaving(true);
    const payload = {
      is_enabled: settings.is_enabled,
      welcome_message: settings.welcome_message,
      system_prompt: settings.system_prompt,
    };

    const { data, error } = settings.id && settings.id !== 'demo'
      ? await supabase.from('chatbot_settings').update(payload).eq('id', settings.id).select().single()
      : await supabase.from('chatbot_settings').insert(payload).select().single();

    setSaving(false);
    if (error || !data) {
      alert('Échec de l\'enregistrement : ' + (error?.message || 'inconnu'));
      return;
    }
    setSettings(data as ChatbotSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Chargement de la configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">

      <div>
        <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400" />
          <span>Assistant IA & Chatbot</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configuration du chatbot de réponse en temps réel destiné aux visiteurs du site public.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
        <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Le widget de conversation est actif sur le site public dès que "Activer le chatbot" est coché ci-dessous. Les changements sont visibles immédiatement, sans redéploiement.
        </span>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadSettings} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="admin-card rounded-2xl p-6 border border-slate-800 space-y-6 text-xs">
        <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
          <div>
            <div className="font-semibold text-white">Activer le chatbot sur le site public</div>
            <div className="text-slate-400 mt-0.5">Affiche le bouton de conversation IA aux visiteurs.</div>
          </div>
          <input
            type="checkbox"
            checked={settings.is_enabled}
            onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
            className="w-5 h-5 rounded accent-emerald-500"
          />
        </label>

        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">Message d'Accueil</label>
          <textarea
            rows={2}
            value={settings.welcome_message}
            onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">Instructions de l'Assistant (Ton, Périmètre, Connaissances)</label>
          <textarea
            rows={6}
            value={settings.system_prompt}
            onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">Ces instructions cadrent les réponses de l'assistant IA une fois le moteur de conversation branché.</p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          {saved && <span className="text-emerald-400">Configuration enregistrée !</span>}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold shadow-glow-emerald flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Enregistrer</span>
          </button>
        </div>
      </form>

    </div>
  );
}
