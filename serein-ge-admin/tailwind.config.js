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
        // emerald/teal/cyan pointent tous vers cette même échelle verte
        // puisque ce sont les classes déjà utilisées partout pour ces usages.
        emerald: {
          50: '#F0F9F4',
          100: '#DCF2E3',
          200: '#B8E3C7',
          300: '#8CCFA3',
          400: '#5EB37D',
          500: '#3E9B63',
          600: '#2F7A4D',
          700: '#26623E',
          800: '#1F4F32',
          900: '#193F28',
          950: '#0F2818',
        },
        teal: {
          50: '#F0F9F4',
          100: '#DCF2E3',
          200: '#B8E3C7',
          300: '#8CCFA3',
          400: '#5EB37D',
          500: '#3E9B63',
          600: '#2F7A4D',
          700: '#26623E',
          800: '#1F4F32',
          900: '#193F28',
          950: '#0F2818',
        },
        cyan: {
          50: '#F0F9F4',
          100: '#DCF2E3',
          200: '#B8E3C7',
          300: '#8CCFA3',
          400: '#5EB37D',
          500: '#3E9B63',
          600: '#2F7A4D',
          700: '#26623E',
          800: '#1F4F32',
          900: '#193F28',
          950: '#0F2818',
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
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -6px rgba(62, 155, 99, 0.3)',
      },
    },
  },
  plugins: [],
};
