'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappNumber = '22670000000';
  const defaultMessage = encodeURIComponent(
    'Bonjour SEREIN-GE, je souhaite obtenir des renseignements sur vos prestations ou vos équipements topographiques.'
  );

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact direct WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-3 rounded-full shadow-2xl shadow-emerald-500/50 hover:scale-105 transition-all duration-300 group"
    >
      <MessageCircle className="w-6 h-6 text-white fill-slate-950" />
      <span className="hidden sm:inline text-xs tracking-wide">Conseiller WhatsApp</span>
    </a>
  );
}
