// ==============================================================================
// SEREIN-GE : Edge Function Supabase pour Webhook Stripe
// Reçoit l'événement checkout.session.completed ou payment_intent.succeeded
// Met à jour la commande et logue la transaction
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = await req.text();
    const body = JSON.parse(payload);
    console.log("Stripe Event Type:", body.type);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (body.type === "checkout.session.completed") {
      const session = body.data.object;
      const orderRef = session.client_reference_id || session.metadata?.order_reference;

      if (orderRef) {
        const { data: order } = await supabase
          .from("orders")
          .select("id, total_fcfa")
          .eq("reference", orderRef)
          .single();

        if (order) {
          await supabase
            .from("orders")
            .update({
              statut: "paid",
              paid_at: new Date().toISOString(),
              stripe_session_id: session.id,
            })
            .eq("id", order.id);

          await supabase.from("payment_logs").insert({
            order_id: order.id,
            provider: "stripe",
            transaction_id: session.payment_intent || session.id,
            montant_fcfa: order.total_fcfa,
            statut: "SUCCESS",
            operateur: "STRIPE_CARD",
            callback_raw: session,
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error processing Stripe webhook:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
