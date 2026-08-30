// ==============================================================================
// SEREIN-GE : Tracking comportemental anonyme (panneau "Intelligence" du
// back-office). Best-effort uniquement : ne bloque jamais l'expérience
// utilisateur si Supabase est indisponible ou non configuré.
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase';

export type AnalyticsEventType = 'page_view' | 'product_view' | 'add_to_cart' | 'search' | 'order_submitted';

const SESSION_KEY = 'serein_analytics_session_id';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackEvent(
  eventType: AnalyticsEventType,
  options: { path?: string; productId?: string; metadata?: Record<string, unknown> } = {}
): void {
  if (typeof window === 'undefined' || !isSupabaseConfigured || !supabase) return;

  supabase
    .from('analytics_events')
    .insert({
      event_type: eventType,
      session_id: getSessionId(),
      path: options.path ?? window.location.pathname,
      product_id: options.productId ?? null,
      metadata: options.metadata ?? {},
    })
    .then(() => {}, () => {}); // best-effort : on ignore silencieusement les échecs
}
