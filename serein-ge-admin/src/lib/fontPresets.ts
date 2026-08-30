// ==============================================================================
// SEREIN-GE : Préréglages de police du back-office (module Apparence).
// 'default' correspond à la police actuelle (Inter/Outfit, déjà chargée dans
// index.html) — aucun chargement dynamique nécessaire pour ce préréglage.
// ==============================================================================

export interface FontPreset {
  key: string;
  label: string;
  family: string;
  googleFontsHref?: string;
}

export const FONT_PRESETS: FontPreset[] = [
  { key: 'default', label: 'Inter / Outfit (par défaut)', family: 'Inter, Outfit' },
  { key: 'poppins', label: 'Poppins', family: 'Poppins', googleFontsHref: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap' },
  { key: 'manrope', label: 'Manrope', family: 'Manrope', googleFontsHref: 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap' },
  { key: 'jakarta', label: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans', googleFontsHref: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap' },
  { key: 'sora', label: 'Sora', family: 'Sora', googleFontsHref: 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap' },
  { key: 'roboto', label: 'Roboto', family: 'Roboto', googleFontsHref: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap' },
];

export function getFontPreset(key: string | null | undefined): FontPreset {
  return FONT_PRESETS.find((p) => p.key === key) || FONT_PRESETS[0];
}

const injectedLinks = new Set<string>();

export function applyFontPreset(key: string | null | undefined, sansVar: string, displayVar: string): void {
  if (typeof document === 'undefined') return;
  const preset = getFontPreset(key);

  if (preset.key === 'default') {
    document.documentElement.style.setProperty(sansVar, 'Inter');
    document.documentElement.style.setProperty(displayVar, 'Outfit');
    return;
  }

  if (preset.googleFontsHref && !injectedLinks.has(preset.key)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = preset.googleFontsHref;
    document.head.appendChild(link);
    injectedLinks.add(preset.key);
  }

  document.documentElement.style.setProperty(sansVar, `'${preset.family}'`);
  document.documentElement.style.setProperty(displayVar, `'${preset.family}'`);
}
