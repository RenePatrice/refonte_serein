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
        // Palette de marque SEREIN-GE (or/olive) — remplace l'accent émeraude
        // d'origine. emerald/teal/cyan pointent tous vers cette même échelle
        // pour unifier l'identité visuelle sur un seul ton.
        emerald: {
          50: '#FDF8ED',
          100: '#FBEDCE',
          200: '#F4D89A',
          300: '#EABE5C',
          400: '#DFA430',
          500: '#CA9100',
          600: '#A87400',
          700: '#855C08',
          800: '#6B4A11',
          900: '#593E14',
          950: '#302008',
        },
        teal: {
          50: '#FDF8ED',
          100: '#FBEDCE',
          200: '#F4D89A',
          300: '#EABE5C',
          400: '#DFA430',
          500: '#CA9100',
          600: '#A87400',
          700: '#855C08',
          800: '#6B4A11',
          900: '#593E14',
          950: '#302008',
        },
        cyan: {
          50: '#FDF8ED',
          100: '#FBEDCE',
          200: '#F4D89A',
          300: '#EABE5C',
          400: '#DFA430',
          500: '#CA9100',
          600: '#A87400',
          700: '#855C08',
          800: '#6B4A11',
          900: '#593E14',
          950: '#302008',
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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
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
