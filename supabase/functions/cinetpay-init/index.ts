// ==============================================================================
// SEREIN-GE : Edge Function Supabase pour l'initialisation d'un paiement CinetPay
// Crée la session de paiement (Orange Money, Moov Money, Wave, Carte) auprès de
// CinetPay pour une commande déjà enregistrée, et renvoie l'URL de paiement.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const CINETPAY_API_KEY = Deno.env.get("CINETPAY_API_KEY") ?? "";
const CINETPAY_SITE_ID = Deno.env.get("CINETPAY_SITE_ID") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CinetPay ne permet pas de forcer un opérateur mobile précis via l'API,
// seulement une catégorie de canal de paiement.
function resolveChannel(operator?: string): string {
  if (operator === "CARD") return "CREDIT_CARD";
  return "MOBILE_MONEY";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { orderReference, channel, baseUrl } = await req.json();

    if (!orderReference || !baseUrl) {
      return new Response(JSON.stringify({ error: "orderReference et baseUrl sont requis" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, reference, total_fcfa, client_nom, client_email, client_telephone, adresse_livraison, ville, statut")
      .eq("reference", orderReference)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (order.statut === "paid") {
      return new Response(JSON.stringify({ error: "Cette commande a déjà été payée" }), {
        status: 409,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const [customerSurname, ...rest] = order.client_nom.trim().split(" ");
    const customerName = rest.join(" ") || customerSurname;

    const payload = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: order.reference,
      amount: order.total_fcfa,
      currency: "XOF",
      description: `Commande SEREIN-GE ${order.reference}`,
      customer_name: customerName,
      customer_surname: customerSurname,
      customer_email: order.client_email,
      customer_phone_number: order.client_telephone,
      customer_address: order.adresse_livraison,
      customer_city: order.ville,
      customer_country: "BF",
      customer_state: "BF",
      customer_zip_code: "00000",
      notify_url: `${SUPABASE_URL}/functions/v1/cinetpay-webhook`,
      return_url: `${baseUrl}/checkout/success/?ref=${encodeURIComponent(order.reference)}`,
      channels: resolveChannel(channel),
      metadata: order.id,
      lang: "fr",
    };

    const cinetpayResponse = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await cinetpayResponse.json();

    if (result.code !== "201" || !result.data?.payment_url) {
      console.error("CinetPay init error:", result);
      return new Response(JSON.stringify({ error: result.message || "Échec de l'initialisation du paiement CinetPay" }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("orders")
      .update({ cinetpay_token: result.data.payment_token })
      .eq("id", order.id);

    await supabase.from("payment_logs").insert({
      order_id: order.id,
      provider: "cinetpay",
      transaction_id: result.data.payment_token,
      montant_fcfa: order.total_fcfa,
      statut: "PENDING",
      operateur: channel || "MOBILE_MONEY",
    });

    return new Response(JSON.stringify({ payment_url: result.data.payment_url }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error initiating CinetPay payment:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
