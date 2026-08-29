// ==============================================================================
// SEREIN-GE : Edge Function Supabase pour Webhook CinetPay
// Reçoit la notification IPN de CinetPay (Orange Money, Moov, Wave, Carte)
// Met à jour la commande et logue la transaction
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const CINETPAY_API_KEY = Deno.env.get("CINETPAY_API_KEY") ?? "";
const CINETPAY_SITE_ID = Deno.env.get("CINETPAY_SITE_ID") ?? "";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    console.log("CinetPay Webhook Received:", body);

    const {
      cpm_trans_id,      // Référence commande SEREIN-GE
      cpm_site_id,
      cpm_amount,
      cpm_trans_status,  // 'ACCEPTED' | 'REFUSED' | 'CANCELLED'
      cpm_payment_method, // 'ORANGE_MONEY_BF', 'MOOV_MONEY_BF', 'WAVE_BF', etc.
      cpm_payid,
      signature
    } = body;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Vérifier l'existence de la commande
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, reference, total_fcfa, statut")
      .eq("reference", cpm_trans_id)
      .single();

    if (orderError || !order) {
      console.error("Order not found for transaction:", cpm_trans_id);
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
    }

    const isSuccess = cpm_trans_status === "ACCEPTED";
    const newOrderStatus = isSuccess ? "paid" : "cancelled";

    // Mettre à jour le statut de la commande
    await supabase
      .from("orders")
      .update({
        statut: newOrderStatus,
        paid_at: isSuccess ? new Date().toISOString() : null,
      })
      .eq("id", order.id);

    // Enregistrer dans payment_logs
    await supabase.from("payment_logs").insert({
      order_id: order.id,
      provider: "cinetpay",
      transaction_id: cpm_payid || cpm_trans_id,
      montant_fcfa: parseInt(cpm_amount || `${order.total_fcfa}`, 10),
      statut: isSuccess ? "SUCCESS" : "FAILED",
      operateur: cpm_payment_method || "CINETPAY_GATEWAY",
      callback_raw: body,
      ip_source: req.headers.get("x-forwarded-for") || "unknown",
    });

    return new Response(JSON.stringify({ success: true, message: "Order processed successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error processing CinetPay webhook:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
