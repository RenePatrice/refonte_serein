// ==============================================================================
// SEREIN-GE : Edge Function Supabase pour la consultation du statut d'une commande
// Permet à un client anonyme (retour de passerelle de paiement) de vérifier le
// statut de sa commande par référence, sans exposer la table `orders` en lecture
// publique dans les politiques RLS.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const url = new URL(req.url);
    let reference = url.searchParams.get("ref");

    if (!reference && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      reference = body.reference ?? null;
    }

    if (!reference) {
      return new Response(JSON.stringify({ error: "Paramètre ref requis" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error } = await supabase
      .from("orders")
      .select("reference, statut, total_fcfa, mode_paiement, client_nom, client_email, paid_at")
      .eq("reference", reference)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ order }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error fetching order status:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
