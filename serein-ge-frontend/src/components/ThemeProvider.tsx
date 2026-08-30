'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { applyBrandColor } from '../lib/theme';

interface SiteSettings {
  primary_color: string;
  logo_url: string | null;
  site_tagline: string | null;
}

const DEFAULT_SETTINGS: SiteSettings = {
  primary_color: '#CA9100',
  logo_url: null,
  site_tagline: null,
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
      .select('primary_color, logo_url, site_tagline')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setSettings(data as SiteSettings);
        if (data.primary_color) applyBrandColor(data.primary_color);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}
