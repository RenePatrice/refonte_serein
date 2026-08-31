import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 py-8 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full ${maxWidth} max-h-[calc(100vh-4rem)] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col`}>

        {/* Header — reste toujours visible, ne défile jamais hors champ */}
        <div className="flex items-start justify-between p-6 sm:p-8 pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-lg font-bold font-display text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content — seule cette zone défile pour les formulaires longs */}
        <div className="overflow-y-auto min-h-0 p-6 sm:p-8 pt-6">{children}</div>

      </div>
    </div>
  );
}
