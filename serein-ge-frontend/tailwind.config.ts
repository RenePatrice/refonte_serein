import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette de marque SEREIN-GE (or/olive), pilotable en direct depuis
        // le module "Apparence" du back-office (table site_settings). Chaque
        // teinte lit une variable CSS "R G B" définie dans globals.css (avec
        // la valeur actuelle en repli), via le motif rgb(var(...) / alpha)
        // qui préserve les modificateurs d'opacité Tailwind (bg-emerald-500/20
        // etc.) utilisés dans tout le site. emerald/teal/cyan pointent toutes
        // vers la même échelle pour unifier l'identité visuelle sur un seul ton.
        emerald: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
          950: 'rgb(var(--brand-950) / <alpha-value>)',
        },
        teal: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
          950: 'rgb(var(--brand-950) / <alpha-value>)',
        },
        cyan: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
          950: 'rgb(var(--brand-950) / <alpha-value>)',
        },
        // Thème clair : slate-950 devient le fond le plus clair (au lieu du
        // plus sombre) puisque tout le site utilise ces classes comme base
        // de fond/texte/bordure — on inverse l'échelle plutôt que de
        // réécrire chaque composant. Tons adoucis (moins saturés) pour
        // réduire la fatigue visuelle par rapport à la première version.
        slate: {
          50: '#241C0F',
          100: '#332815',
          200: '#3F331D',
          300: '#574526',
          400: '#6B5734',
          500: '#8A6F3B',
          600: '#A88750',
          700: '#CBAF78',
          800: '#E4D3AC',
          900: '#F3EBDA',
          950: '#FAF7EF',
        },
        white: '#2E2415',
        serein: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Émeraude géomatique vibrant
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        navy: {
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#090d16',
        },
        accent: {
          gold: '#CA9100',
          amber: '#d97706',
          cyan: '#06b6d4',
          blue: '#2563eb',
        },
        // Couleur secondaire de marque (module Apparence), utilisée pour les
        // dégradés (logo, boutons) en complément de la couleur primaire.
        secondary: 'rgb(var(--brand-secondary) / <alpha-value>)',
      },
      fontFamily: {
        // Pilotable en direct depuis le module Apparence (préréglages Google
        // Fonts). Valeurs par défaut définies dans globals.css :root.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 24px -6px rgba(202, 145, 0, 0.4)',
        'glow-gold': '0 0 24px -6px rgba(202, 145, 0, 0.4)',
        'glass': '0 8px 32px 0 rgba(69, 54, 32, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
