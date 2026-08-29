/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode production dynamique : nécessite un hébergeur Node.js (Vercel,
  // Netlify, ou un serveur Node classique) — plus compatible avec un hébergement
  // 100% statique (GitHub Pages). Permet le rendu à la demande des nouvelles
  // pages [slug] (produits, réalisations, actualités, départements) créées
  // depuis l'admin, sans attendre un nouveau build.
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
