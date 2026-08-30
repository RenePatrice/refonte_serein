import React, { useEffect, useState } from 'react';
import { Palette, Loader2, AlertTriangle, RefreshCw, Save, Image as ImageIcon } from 'lucide-react';
import { SiteSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'demo',
  primary_color: '#CA9100',
  logo_url: '',
  site_tagline: '',
};

const SWATCH_PRESETS = ['#CA9100', '#B45309', '#0F766E', '#1D4ED8', '#7C3AED', '#BE123C'];

export default function AppearanceManager() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
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
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();

    if (error) {
      setLoadError("Impossible de charger les paramètres d'apparence : " + error.message);
    } else if (data) {
      setSettings(data as SiteSettings);
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
      primary_color: settings.primary_color,
      logo_url: settings.logo_url || null,
      site_tagline: settings.site_tagline || null,
    };

    const { data, error } = settings.id && settings.id !== 'demo'
      ? await supabase.from('site_settings').update(payload).eq('id', settings.id).select().single()
      : await supabase.from('site_settings').insert(payload).select().single();

    setSaving(false);
    if (error || !data) {
      alert("Échec de l'enregistrement : " + (error?.message || 'inconnu'));
      return;
    }
    setSettings(data as SiteSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Chargement des paramètres d'apparence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">

      <div>
        <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-400" />
          <span>Apparence du Site Public</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Couleur de marque et logo affichés en direct sur le site public. N'affecte pas les couleurs de statut (vert/rouge) du tableau de bord.
        </p>
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

        <div>
          <label className="block font-semibold text-slate-300 mb-2">Couleur Principale de la Marque</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primary_color}
              onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
              className="w-12 h-10 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer"
            />
            <input
              type="text"
              value={settings.primary_color}
              onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
              placeholder="#CA9100"
              className="w-32 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <div className="flex items-center gap-1.5">
              {SWATCH_PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setSettings({ ...settings, primary_color: hex })}
                  style={{ backgroundColor: hex }}
                  className="w-6 h-6 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                  title={hex}
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Pilote les boutons, badges et accents du site public (menu, navbar, CTA). Appliquée en direct dès l'enregistrement, sans redéploiement.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>URL du Logo</span>
          </label>
          <input
            type="text"
            value={settings.logo_url || ''}
            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            placeholder="https://.../logo.png"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">Remplace l'icône par défaut dans la barre de navigation du site public. Laisser vide pour garder l'icône par défaut.</p>
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">Slogan / Signature</label>
          <input
            type="text"
            value={settings.site_tagline || ''}
            onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
            placeholder="Ingénierie & Géomatique"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          {saved && <span className="text-emerald-400">Apparence enregistrée !</span>}
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
