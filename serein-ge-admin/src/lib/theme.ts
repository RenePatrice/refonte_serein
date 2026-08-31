// ==============================================================================
// SEREIN-GE : Génération de la rampe de couleur de marque du back-office
// (module Apparence). Miroir de la logique utilisée côté site public.
// ==============================================================================

type RGB = [number, number, number];

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

const TINT_RATIOS: Record<string, number> = { '50': 0.95, '100': 0.88, '200': 0.72, '300': 0.54, '400': 0.28 };
const SHADE_RATIOS: Record<string, number> = { '600': 0.15, '700': 0.32, '800': 0.48, '900': 0.6, '950': 0.75 };

function hexToRgb(hex: string): RGB | null {
  const clean = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function mix(c: RGB, target: RGB, ratio: number): RGB {
  return [
    Math.round(c[0] + (target[0] - c[0]) * ratio),
    Math.round(c[1] + (target[1] - c[1]) * ratio),
    Math.round(c[2] + (target[2] - c[2]) * ratio),
  ];
}

export function buildBrandRamp(baseHex: string): Record<string, RGB> | null {
  const base = hexToRgb(baseHex);
  if (!base) return null;
  const ramp: Record<string, RGB> = { '500': base };
  for (const [step, ratio] of Object.entries(TINT_RATIOS)) ramp[step] = mix(base, WHITE, ratio);
  for (const [step, ratio] of Object.entries(SHADE_RATIOS)) ramp[step] = mix(base, BLACK, ratio);
  return ramp;
}

export function applyBrandColor(hex: string, prefix: string): void {
  const ramp = buildBrandRamp(hex);
  if (!ramp || typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [step, [r, g, b]] of Object.entries(ramp)) {
    root.style.setProperty(`--${prefix}-${step}`, `${r} ${g} ${b}`);
  }
}

export function applyCssVarColor(varName: string, hex: string): void {
  const rgb = hexToRgb(hex);
  if (!rgb || typeof document === 'undefined') return;
  document.documentElement.style.setProperty(varName, `${rgb[0]} ${rgb[1]} ${rgb[2]}`);
}
