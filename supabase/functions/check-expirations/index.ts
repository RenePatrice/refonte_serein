// ==============================================================================
// SEREIN-GE : Edge Function pour les alertes d'expiration RH (module RH).
//
// Exécutée quotidiennement à 07h00 UTC via pg_cron (job "daily-hr-expiration-check",
// déjà planifié en production), elle lit la vue public.upcoming_expirations
// (contrats, pièces d'identité, permis de conduire expirant sous 1 mois) et
// crée une notification pour RH et pour Super Admin — sauf si une
// notification identique existe déjà aujourd'hui (déduplication faite ici
// car un index UNIQUE sur une date castée depuis timestamptz ne peut pas
// être IMMUTABLE en PostgreSQL).
//
// Pour reproduire la planification sur un autre projet Supabase (pg_cron et
// pg_net doivent être activés au préalable) :
//
// select cron.schedule(
//   'daily-hr-expiration-check',
//   '0 7 * * *',
//   $$ select net.http_post(
//        url := 'https://<project-ref>.supabase.co/functions/v1/check-expirations',
//        headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
//      ); $$
// );
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const NOTIFICATION_TYPE: Record<string, string> = {
  contrat: "contrat_expire",
  piece_identite: "piece_identite_expire",
  permis_conduire: "permis_expire",
};

const LABEL: Record<string, string> = {
  contrat: "Le contrat de",
  piece_identite: "La pièce d'identité de",
  permis_conduire: "Le permis de conduire de",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: expirations, error: viewError } = await supabase
      .from("upcoming_expirations")
      .select("*");

    if (viewError) {
      console.error("Error reading upcoming_expirations:", viewError);
      return jsonResponse({ error: viewError.message }, 500);
    }

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    let created = 0;

    for (const row of expirations || []) {
      const notifType = NOTIFICATION_TYPE[row.expiration_type];
      if (!notifType) continue;

      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("type", notifType)
        .eq("reference_id", row.reference_id)
        .gte("created_at", todayStart.toISOString())
        .limit(1);

      if (existing && existing.length > 0) continue; // déjà notifié aujourd'hui

      const message = `${LABEL[row.expiration_type]} ${row.first_name} ${row.last_name} arrive à échéance le ${row.expiration_date}.`;

      const { error: insertError } = await supabase.from("notifications").insert([
        { target_role: "rh", type: notifType, message, reference_id: row.reference_id },
        { target_role: "super_admin", type: notifType, message, reference_id: row.reference_id },
      ]);

      if (insertError) {
        console.error("Error inserting notification:", insertError);
        continue;
      }
      created += 2;
    }

    return jsonResponse({ success: true, checked: (expirations || []).length, notifications_created: created });
  } catch (err: any) {
    console.error("Error in check-expirations function:", err);
    return jsonResponse({ error: err.message || "Erreur interne." }, 500);
  }
});
