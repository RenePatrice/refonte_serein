// ==============================================================================
// SEREIN-GE : Edge Function Supabase pour le widget de chat IA du site public.
//
// Reçoit l'historique de conversation depuis le widget, appelle Claude avec
// les instructions configurées dans chatbot_settings (table pilotée depuis
// le back-office), journalise l'échange dans chatbot_conversations, et
// renvoie la réponse de l'assistant.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.122.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

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

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY_TURNS = 20;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    if (!ANTHROPIC_API_KEY) {
      return jsonResponse({ error: "Assistant IA non configuré (ANTHROPIC_API_KEY manquant)." }, 503);
    }

    const body = await req.json();
    const { session_id, history } = body as { session_id?: string; history?: ChatTurn[] };

    if (!session_id || !Array.isArray(history) || history.length === 0) {
      return jsonResponse({ error: "session_id et history sont requis." }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: settings } = await supabase
      .from("chatbot_settings")
      .select("is_enabled, system_prompt")
      .limit(1)
      .maybeSingle();

    if (!settings?.is_enabled) {
      return jsonResponse({ error: "L'assistant IA est désactivé." }, 403);
    }

    const trimmedHistory = history.slice(-MAX_HISTORY_TURNS);

    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: settings.system_prompt,
      output_config: { effort: "low" },
      messages: trimmedHistory.map((turn) => ({ role: turn.role, content: turn.content })),
    });

    if (response.stop_reason === "refusal") {
      return jsonResponse({ error: "L'assistant n'a pas pu répondre à cette demande." }, 200);
    }

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "Désolé, je n'ai pas pu générer de réponse.";

    const fullConversation: ChatTurn[] = [...history, { role: "assistant", content: reply }];

    const { data: existing } = await supabase
      .from("chatbot_conversations")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("chatbot_conversations")
        .update({ messages: fullConversation })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("chatbot_conversations")
        .insert({ session_id, messages: fullConversation });
    }

    return jsonResponse({ reply });
  } catch (err: any) {
    console.error("Error in chatbot function:", err);
    return jsonResponse({ error: err.message || "Erreur interne de l'assistant." }, 500);
  }
});
