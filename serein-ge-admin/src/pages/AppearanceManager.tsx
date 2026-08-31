import React, { useEffect, useState } from 'react';
import { Palette, Loader2, AlertTriangle, RefreshCw, Save, Image as ImageIcon, Globe, LayoutDashboard, Type } from 'lucide-react';
import { SiteSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FONT_PRESETS } from '../lib/fontPresets';

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'demo',
  primary_color: '#CA9100',
  secondary_color: '#0F766E',
  admin_primary_color: '#3E9B63',
  admin_secondary_color: '#5EB37D',
  font_family: 'default',
  admin_font_family: 'default',
  logo_url: '',
  site_tagline: '',
};

const FRONTEND_PRESETS = ['#CA9100', '#B45309', '#1D4ED8', '#7C3AED', '#BE123C', '#0F766E'];
const ADMIN_PRESETS = ['#3E9B63', '#0F766E', '#2563EB', '#7C3AED', '#DC2626', '#CA9100'];

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  presets: string[];
}

function ColorField({ label, value, onChange, presets }: ColorFieldProps) {
  return (
    <div>
      <label className="block font-semibold text-slate-300 mb-2">{label}</label>
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#CA9100"
          className="w-28 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
        />
        <div className="flex items-center gap-1.5">
          {presets.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => onChange(hex)}
              style={{ backgroundColor: hex }}
              className="w-6 h-6 rounded-full border border-slate-700 hover:scale-110 transition-transform"
              title={hex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FontFieldProps {
  label: string;
  value: string;
  onChange: (key: string) => void;
}

function FontField({ label, value, onChange }: FontFieldProps) {
  return (
    <div>
      <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
        <Type className="w-3.5 h-3.5" />
        <span>{label}</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
      >
        {FONT_PRESETS.map((preset) => (
          <option key={preset.key} value={preset.key} style={{ fontFamily: preset.family }}>
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  );
}

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
      setSettings({ ...DEFAULT_SETTINGS, ...data } as SiteSettings);
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
      secondary_color: settings.secondary_color,
      admin_primary_color: settings.admin_primary_color,
      admin_secondary_color: settings.admin_secondary_color,
      font_family: settings.font_family,
      admin_font_family: settings.admin_font_family,
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
    setSettings({ ...DEFAULT_SETTINGS, ...data } as SiteSettings);
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
          <span>Apparence</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Couleurs et police appliquées en direct, sans redéploiement. Les couleurs de statut (vert = succès, rouge = échec) du tableau de bord restent fixes.
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

      <form onSubmit={handleSave} className="space-y-6 text-xs">

        {/* Logo & Slogan — partagés entre les deux applications */}
        <div className="admin-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Logo & Identité</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">URL du Logo</label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={settings.logo_url || ''}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                placeholder="https://.../logo.png"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
              {settings.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Aperçu logo"
                  className="w-16 h-16 rounded-full object-cover border border-slate-800 shrink-0"
                />
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Affiché en cercle (jusqu'à 56px de diamètre) dans la navbar du site public et la barre latérale du back-office. Une image carrée donne le meilleur rendu. Laisser vide pour garder l'icône par défaut.
            </p>
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
        </div>

        {/* Site Public */}
        <div className="admin-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Site Public</span>
          </div>

          <ColorField
            label="Couleur Primaire"
            value={settings.primary_color}
            onChange={(hex) => setSettings({ ...settings, primary_color: hex })}
            presets={FRONTEND_PRESETS}
          />
          <ColorField
            label="Couleur Secondaire"
            value={settings.secondary_color}
            onChange={(hex) => setSettings({ ...settings, secondary_color: hex })}
            presets={FRONTEND_PRESETS}
          />
          <FontField
            label="Police du Site Public"
            value={settings.font_family}
            onChange={(key) => setSettings({ ...settings, font_family: key })}
          />
        </div>

        {/* Back-office */}
        <div className="admin-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Tableau de Bord (Back-office)</span>
          </div>

          <ColorField
            label="Couleur Primaire (boutons, actions)"
            value={settings.admin_primary_color}
            onChange={(hex) => setSettings({ ...settings, admin_primary_color: hex })}
            presets={ADMIN_PRESETS}
          />
          <ColorField
            label="Couleur Secondaire"
            value={settings.admin_secondary_color}
            onChange={(hex) => setSettings({ ...settings, admin_secondary_color: hex })}
            presets={ADMIN_PRESETS}
          />
          <FontField
            label="Police du Back-office"
            value={settings.admin_font_family}
            onChange={(key) => setSettings({ ...settings, admin_font_family: key })}
          />
          <p className="text-[10px] text-slate-500">
            Ces couleurs pilotent les boutons et accents du tableau de bord. Les badges de statut (actif/payé/retenu en vert, échec/rejeté en rouge) restent inchangés quelle que soit la couleur choisie ici.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
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
