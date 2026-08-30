// ==============================================================================
// SEREIN-GE : Edge Function Supabase pour la gestion des comptes administrateurs
// Les opérations de création/suppression d'un compte Supabase Auth nécessitent
// la clé service_role (jamais exposée au navigateur) : c'est pourquoi elles ne
// peuvent pas passer par une simple requête depuis le client admin, et transitent
// ici. Les mises à jour de profil (rôle, téléphone, actif/inactif) restent gérées
// directement par le client via RLS (is_super_admin), sans passer par cette
// fonction.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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

// Règle de mot de passe SEREIN-GE : 8 caractères minimum, au moins un
// chiffre, un caractère spécial, une majuscule et une minuscule. Validée ici
// aussi (pas seulement côté client) car c'est cette fonction qui détient le
// privilège de créer le compte Supabase Auth.
function passwordRuleErrors(password: string): string[] {
  const errors: string[] = [];
  if (!password || password.length < 8) errors.push("8 caractères minimum");
  if (!/[0-9]/.test(password || "")) errors.push("au moins un chiffre");
  if (!/[^A-Za-z0-9]/.test(password || "")) errors.push("au moins un caractère spécial");
  if (!/[A-Z]/.test(password || "")) errors.push("au moins une majuscule");
  if (!/[a-z]/.test(password || "")) errors.push("au moins une minuscule");
  return errors;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return jsonResponse({ error: "Authentification requise" }, 401);
    }

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: callerData, error: callerError } = await anonClient.auth.getUser(token);
    if (callerError || !callerData.user) {
      return jsonResponse({ error: "Session invalide" }, 401);
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: callerProfile } = await serviceClient
      .from("users")
      .select("role, is_active")
      .eq("id", callerData.user.id)
      .single();

    if (!callerProfile || callerProfile.role !== "super_admin" || !callerProfile.is_active) {
      return jsonResponse({ error: "Action réservée aux Super Admins" }, 403);
    }

    const { action, ...payload } = await req.json();

    if (action === "create") {
      const { email, nom_complet, role, telephone, password } = payload;
      if (!email || !nom_complet || !role || !password) {
        return jsonResponse({ error: "email, nom_complet, role et password sont requis" }, 400);
      }

      const pwErrors = passwordRuleErrors(password);
      if (pwErrors.length > 0) {
        return jsonResponse({ error: "Mot de passe invalide : " + pwErrors.join(", ") }, 400);
      }

      const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError || !created.user) {
        return jsonResponse({ error: createError?.message || "Échec de la création du compte" }, 502);
      }

      const { data: profile, error: profileError } = await serviceClient
        .from("users")
        .insert({
          id: created.user.id,
          email,
          nom_complet,
          role,
          telephone: telephone || null,
          is_active: true,
        })
        .select()
        .single();

      if (profileError || !profile) {
        // Nettoyage : on annule la création du compte Auth si le profil échoue
        await serviceClient.auth.admin.deleteUser(created.user.id);
        return jsonResponse({ error: profileError?.message || "Échec de la création du profil" }, 500);
      }

      // Miroir dans user_roles (module RH) : garde le nouveau système de
      // rôles cumulables synchronisé avec le rôle de base dès la création,
      // sans quoi le compte n'apparaîtrait dans user_roles qu'après une
      // première modification.
      const { data: roleRow } = await serviceClient.from("roles").select("id").eq("code", role).maybeSingle();
      if (roleRow) {
        await serviceClient.from("user_roles").insert({ user_id: created.user.id, role_id: roleRow.id });
      }

      return jsonResponse({ user: profile });
    }

    if (action === "delete") {
      const { userId } = payload;
      if (!userId) {
        return jsonResponse({ error: "userId requis" }, 400);
      }
      if (userId === callerData.user.id) {
        return jsonResponse({ error: "Vous ne pouvez pas supprimer votre propre compte" }, 400);
      }

      const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId);
      if (deleteError) {
        return jsonResponse({ error: deleteError.message }, 500);
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Action inconnue" }, 400);
  } catch (err: any) {
    console.error("Error in admin-users function:", err);
    return jsonResponse({ error: err.message }, 500);
  }
});
