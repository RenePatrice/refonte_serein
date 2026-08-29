// ==============================================================================
// SEREIN-GE : Edge Function Supabase pour l'initialisation d'un paiement Stripe
// Crée une Checkout Session Stripe (cartes internationales) pour une commande
// déjà enregistrée, et renvoie l'URL de paiement hébergée par Stripe.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Encode un objet imbriqué au format x-www-form-urlencoded attendu par l'API Stripe
// (ex: line_items[0][price_data][unit_amount]=1000)
function encodeFormParams(params: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === "object") {
          parts.push(...encodeFormParams(item as Record<string, unknown>, `${fullKey}[${index}]`));
        } else {
          parts.push(`${encodeURIComponent(`${fullKey}[${index}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof value === "object") {
      parts.push(...encodeFormParams(value as Record<string, unknown>, fullKey));
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
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

    const { orderReference, baseUrl } = await req.json();

    if (!orderReference || !baseUrl) {
      return new Response(JSON.stringify({ error: "orderReference et baseUrl sont requis" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, reference, total_fcfa, client_email, statut")
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

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_nom, quantite, prix_unitaire_fcfa")
      .eq("order_id", order.id);

    // Le XOF est une devise "zéro décimale" pour Stripe : le montant s'exprime
    // directement en FCFA, sans multiplication par 100.
    const lineItems = (orderItems && orderItems.length > 0
      ? orderItems
      : [{ product_nom: `Commande ${order.reference}`, quantite: 1, prix_unitaire_fcfa: order.total_fcfa }]
    ).map((item) => ({
      price_data: {
        currency: "xof",
        product_data: { name: item.product_nom },
        unit_amount: item.prix_unitaire_fcfa,
      },
      quantity: item.quantite,
    }));

    const formBody = encodeFormParams({
      mode: "payment",
      success_url: `${baseUrl}/checkout/success/?ref=${encodeURIComponent(order.reference)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/?cancelled=1`,
      client_reference_id: order.reference,
      customer_email: order.client_email,
      line_items: lineItems,
      metadata: { order_reference: order.reference },
    }).join("&");

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok || !session.url) {
      console.error("Stripe init error:", session);
      return new Response(JSON.stringify({ error: session.error?.message || "Échec de l'initialisation du paiement Stripe" }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    await supabase.from("payment_logs").insert({
      order_id: order.id,
      provider: "stripe",
      transaction_id: session.id,
      montant_fcfa: order.total_fcfa,
      statut: "PENDING",
      operateur: "STRIPE_CARD",
    });

    return new Response(JSON.stringify({ checkout_url: session.url }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error initiating Stripe payment:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
