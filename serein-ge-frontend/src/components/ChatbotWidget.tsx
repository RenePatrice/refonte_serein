'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Loader2, MessageCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SESSION_KEY = 'serein_chatbot_session_id';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export default function ChatbotWidget() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Bonjour ! Je suis l'assistant SEREIN-GE, comment puis-je vous aider ?"
  );
  const [checked, setChecked] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setChecked(true);
      return;
    }
    supabase
      .from('chatbot_settings')
      .select('is_enabled, welcome_message')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setIsEnabled(Boolean(data.is_enabled));
          if (data.welcome_message) setWelcomeMessage(data.welcome_message);
        }
        setChecked(true);
      });
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [isOpen, welcomeMessage, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  if (!checked || !isEnabled) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setSending(true);

    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: "Mode démo : l'assistant IA n'est pas connecté à une base Supabase configurée." },
        ]);
        setSending(false);
      }, 800);
      return;
    }

    const { data, error: fnError } = await supabase.functions.invoke('chatbot', {
      body: { session_id: getSessionId(), message: text, history: nextMessages },
    });

    setSending(false);

    if (fnError || data?.error || !data?.reply) {
      setError(data?.error || fnError?.message || "L'assistant est momentanément indisponible.");
      return;
    }

    setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">Assistant SEREIN-GE</div>
                <div className="text-white/80 text-[10px]">Réponse instantanée par IA</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Fermer le chat"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-950">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-xs flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>L'assistant écrit...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="text-center text-[11px] text-red-400 px-3">{error}</div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message..."
              disabled={sending}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-40 transition shrink-0"
              aria-label="Envoyer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Fermer le chat' : "Ouvrir l'assistant SEREIN-GE"}
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-3 rounded-full shadow-2xl shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && <span className="hidden sm:inline text-xs tracking-wide">Mon Assistant</span>}
      </button>
    </>
  );
}
