'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { applyBrandColor, applyCssVarColor } from '../lib/theme';
import { applyFontPreset } from '../lib/fontPresets';

interface SiteSettings {
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  site_tagline: string | null;
  font_family: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  primary_color: '#CA9100',
  secondary_color: '#0F766E',
  logo_url: null,
  site_tagline: null,
  font_family: 'default',
};

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let cancelled = false;

    supabase
      .from('site_settings')
      .select('primary_color, secondary_color, logo_url, site_tagline, font_family')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setSettings(data as SiteSettings);
        if (data.primary_color) applyBrandColor(data.primary_color);
        if (data.secondary_color) applyCssVarColor('--brand-secondary', data.secondary_color);
        applyFontPreset(data.font_family, '--font-sans', '--font-display');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}
