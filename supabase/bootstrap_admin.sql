-- ==============================================================================
-- SEREIN-GE : Provisionnement du premier compte Super Admin
-- ==============================================================================
-- Il n'existe volontairement aucune inscription publique pour le dashboard admin :
-- la politique RLS sur public.users n'autorise l'INSERT qu'aux super_admins déjà
-- actifs (voir rls.sql). Le tout premier compte doit donc être créé manuellement,
-- une seule fois, par le propriétaire du projet Supabase, avec un mot de passe
-- déjà défini (pas d'invitation par email pour ce tout premier compte).
--
-- Étapes :
-- 1. Dashboard Supabase → Authentication → Users → "Add user" → "Create new user".
--    Renseigner l'email et un mot de passe respectant la règle SEREIN-GE
--    (8 caractères minimum, au moins un chiffre, un caractère spécial, une
--    majuscule et une minuscule — ex: "Serein-GE#2026"). Cocher "Auto Confirm
--    User" pour éviter l'envoi d'un email de confirmation.
--    Copier l'UUID généré pour cet utilisateur.
-- 2. Exécuter la requête ci-dessous dans le SQL Editor Supabase (contexte
--    service role, qui contourne RLS), en remplaçant les valeurs d'exemple.
-- 3. Se connecter au dashboard admin avec cet email/mot de passe : les comptes
--    Super Admin n'ont pas de 2e facteur, l'accès est accordé dès le mot de
--    passe validé. Changer le mot de passe dès la première connexion.

insert into public.users (id, email, nom_complet, role, is_active)
values (
  '00000000-0000-0000-0000-000000000000', -- UUID copié depuis Authentication > Users
  'admin@serein-ge.bf',
  'Administrateur Principal',
  'super_admin',
  true
);

-- Les comptes suivants (Éditeurs, etc.) peuvent ensuite être créés directement
-- depuis le module "Utilisateurs & Rôles" du dashboard admin par ce Super Admin,
-- avec un mot de passe défini à la création (plus d'invitation par email).

-- ==============================================================================
-- Configuration requise côté projet Supabase pour le code à 6 chiffres (2FA)
-- Ce 2e facteur ne s'applique qu'aux comptes rôle "editeur" — les comptes
-- Super Admin s'y connectent au mot de passe seul (voir App.tsx).
-- ==============================================================================
-- Dashboard Supabase → Authentication → Settings → Email OTP Expiration :
-- régler sur 300 (secondes) pour respecter la durée de validité de 5 minutes.
--
-- Dashboard Supabase → Authentication → Settings → SMTP Settings :
-- configurer le même SMTP que celui utilisé par l'edge function
-- send-notification-email (voir supabase/functions/.env.example) pour que les
-- emails de code de vérification partent depuis l'adresse SEREIN-GE plutôt que
-- l'adresse générique Supabase (limitée en volume sur le plan gratuit).
