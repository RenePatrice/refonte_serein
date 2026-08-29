import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import WhatsAppButton from '../components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'SEREIN-GE | Ingénierie Géomatique, Topographie & Distribution Matériel de Haute Précision',
  description: 'Société leader au Burkina Faso en études géodésiques, WebSIG, modélisation 3D et distributeur agréé de matériel topographique CHCNAV, Toknav et FOIF.',
  keywords: 'SEREIN-GE, Géomètre Burkina Faso, CHCNAV Burkina, Toknav T20, GNSS RTK Ouagadougou, Station Totale FOIF, Topographie, Géomatique, Cartographie par Drone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <CartDrawer />
        <WhatsAppButton />
        <Footer />
      </body>
    </html>
  );
}
