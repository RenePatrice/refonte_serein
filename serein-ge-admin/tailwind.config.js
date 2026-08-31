/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette d'administration : noir / blanc pour le châssis (sidebar,
        // header), vert pour tout ce qui est validation/statut/action
        // (boutons Enregistrer, badges "actif"/"payé"/"retenu", succès), et
        // rouge pour les échecs (voir la palette red par défaut de Tailwind).
        // emerald/teal/cyan pointent tous vers cette même échelle, pilotable
        // en direct depuis le module Apparence (site_settings.admin_primary_color)
        // via une variable CSS "R G B" — valeurs par défaut ci-dessous inchangées.
        emerald: {
          50: 'rgb(var(--admin-brand-50) / <alpha-value>)',
          100: 'rgb(var(--admin-brand-100) / <alpha-value>)',
          200: 'rgb(var(--admin-brand-200) / <alpha-value>)',
          300: 'rgb(var(--admin-brand-300) / <alpha-value>)',
          400: 'rgb(var(--admin-brand-400) / <alpha-value>)',
          500: 'rgb(var(--admin-brand-500) / <alpha-value>)',
          600: 'rgb(var(--admin-brand-600) / <alpha-value>)',
          700: 'rgb(var(--admin-brand-700) / <alpha-value>)',
          800: 'rgb(var(--admin-brand-800) / <alpha-value>)',
          900: 'rgb(var(--admin-brand-900) / <alpha-value>)',
          950: 'rgb(var(--admin-brand-950) / <alpha-value>)',
        },
        teal: {
          50: 'rgb(var(--admin-brand-50) / <alpha-value>)',
          100: 'rgb(var(--admin-brand-100) / <alpha-value>)',
          200: 'rgb(var(--admin-brand-200) / <alpha-value>)',
          300: 'rgb(var(--admin-brand-300) / <alpha-value>)',
          400: 'rgb(var(--admin-brand-400) / <alpha-value>)',
          500: 'rgb(var(--admin-brand-500) / <alpha-value>)',
          600: 'rgb(var(--admin-brand-600) / <alpha-value>)',
          700: 'rgb(var(--admin-brand-700) / <alpha-value>)',
          800: 'rgb(var(--admin-brand-800) / <alpha-value>)',
          900: 'rgb(var(--admin-brand-900) / <alpha-value>)',
          950: 'rgb(var(--admin-brand-950) / <alpha-value>)',
        },
        cyan: {
          50: 'rgb(var(--admin-brand-50) / <alpha-value>)',
          100: 'rgb(var(--admin-brand-100) / <alpha-value>)',
          200: 'rgb(var(--admin-brand-200) / <alpha-value>)',
          300: 'rgb(var(--admin-brand-300) / <alpha-value>)',
          400: 'rgb(var(--admin-brand-400) / <alpha-value>)',
          500: 'rgb(var(--admin-brand-500) / <alpha-value>)',
          600: 'rgb(var(--admin-brand-600) / <alpha-value>)',
          700: 'rgb(var(--admin-brand-700) / <alpha-value>)',
          800: 'rgb(var(--admin-brand-800) / <alpha-value>)',
          900: 'rgb(var(--admin-brand-900) / <alpha-value>)',
          950: 'rgb(var(--admin-brand-950) / <alpha-value>)',
        },
        // Thème clair : slate-950 devient le fond le plus clair (blanc) au
        // lieu du plus sombre, puisque tout le dashboard utilise ces classes
        // comme base de fond/texte/bordure — on inverse l'échelle plutôt que
        // de réécrire chaque composant.
        slate: {
          50: '#0D0B08',
          100: '#1A1712',
          200: '#272319',
          300: '#3A352C',
          400: '#524C40',
          500: '#736C5E',
          600: '#9C9587',
          700: '#C7C2B8',
          800: '#E5E2DC',
          900: '#F7F7F5',
          950: '#FFFFFF',
        },
        white: '#14110C',
        serein: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Émeraude géomatique
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        navy: {
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#090d16',
        },
        secondary: 'rgb(var(--admin-brand-secondary) / <alpha-value>)',
      },
      fontFamily: {
        // Corrige un bug préexistant : ces classes n'avaient jamais été
        // configurées, donc font-sans/font-display ne faisaient rien malgré
        // le chargement d'Inter/Outfit dans index.html. Pilotable en direct
        // depuis le module Apparence (site_settings.admin_font_family).
        sans: ['var(--admin-font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--admin-font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -6px rgba(62, 155, 99, 0.3)',
      },
    },
  },
  plugins: [],
};
