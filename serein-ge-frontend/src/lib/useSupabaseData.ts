'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// Charge une liste depuis Supabase et remplace le fallback (mock-data) dès que
// la réponse arrive. RLS filtre déjà côté serveur les lignes publiques
// (is_active / is_published / statut), donc un simple select('*') suffit.
export function useSupabaseList<T>(
  table: string,
  fallback: T[],
  options?: { orderColumn?: string; ascending?: boolean }
) {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const client = supabase;

    (async () => {
      let query = client.from(table).select('*');
      if (options?.orderColumn) {
        query = query.order(options.orderColumn, { ascending: options?.ascending ?? true });
      }
      const { data: rows, error } = await query;
      if (!cancelled && !error && rows && rows.length > 0) {
        setData(rows as T[]);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  return { data, loading };
}

// Recharge un item unique par slug depuis Supabase par-dessus une valeur de
// repli (mock-data ou données déjà connues au build) déjà correcte pour
// l'affichage initial et le 404 côté serveur.
export function useSupabaseItem<T>(table: string, slug: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let cancelled = false;
    const client = supabase;

    (async () => {
      const { data: row, error } = await client.from(table).select('*').eq('slug', slug).single();
      if (!cancelled && !error && row) {
        setData(row as T);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, slug]);

  return data;
}
