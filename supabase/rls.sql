-- ==============================================================================
-- SEREIN-GE : POLITIQUES ROW LEVEL SECURITY (RLS) SUPABASE
-- Cahier des charges v2.2 - 28 août 2026
-- ==============================================================================

-- Activation de RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actualites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Helper function pour vérifier si l'utilisateur courant est administrateur
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
          AND is_active = true 
          AND role IN ('super_admin', 'editeur')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function pour vérifier si l'utilisateur courant est Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
          AND is_active = true 
          AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 1. POLITIQUES : USERS
-- ------------------------------------------------------------------------------
CREATE POLICY "Lecture profil par propriétaire ou admin" ON public.users
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Mise à jour profil par propriétaire ou super admin" ON public.users
    FOR UPDATE USING (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "Création et suppression par super admin uniquement" ON public.users
    FOR ALL USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 2. POLITIQUES : CONTENU PUBLIC DU SITE (Lecture ouverte, écriture admin)
-- ------------------------------------------------------------------------------

-- Departments
CREATE POLICY "Lecture publique des départements" ON public.departments
    FOR SELECT USING (true);
CREATE POLICY "Gestion départements par admin" ON public.departments
    FOR ALL USING (public.is_admin());

-- Team
CREATE POLICY "Lecture publique des membres actifs" ON public.team
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Gestion équipe par admin" ON public.team
    FOR ALL USING (public.is_admin());

-- Realisations
CREATE POLICY "Lecture publique des réalisations publiées" ON public.realisations
    FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Gestion réalisations par admin" ON public.realisations
    FOR ALL USING (public.is_admin());

-- Actualités
CREATE POLICY "Lecture publique des actualités publiées" ON public.actualites
    FOR SELECT USING (statut = 'publie' OR public.is_admin());
CREATE POLICY "Gestion actualités par admin" ON public.actualites
    FOR ALL USING (public.is_admin());

-- Partners
CREATE POLICY "Lecture publique des partenaires actifs" ON public.partners
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Gestion partenaires par admin" ON public.partners
    FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. POLITIQUES : E-COMMERCE (Produits, Commandes, Articles, Paiements)
-- ------------------------------------------------------------------------------

-- Products
CREATE POLICY "Lecture publique des produits actifs" ON public.products
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Gestion catalogue produits par admin" ON public.products
    FOR ALL USING (public.is_admin());

-- Orders
CREATE POLICY "Création de commande publique (clients non-connectés ou connectés)" ON public.orders
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Lecture commande par référence et email" ON public.orders
    FOR SELECT USING (public.is_admin() OR auth.uid() IS NOT NULL);
CREATE POLICY "Gestion commandes par admin" ON public.orders
    FOR ALL USING (public.is_admin());

-- Order Items
CREATE POLICY "Création publique de lignes de commande" ON public.order_items
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Lecture lignes de commande par admin" ON public.order_items
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Gestion lignes de commande par admin" ON public.order_items
    FOR ALL USING (public.is_admin());

-- Payment Logs
CREATE POLICY "Gestion logs de paiement réservée aux admins et webhooks de confiance" ON public.payment_logs
    FOR ALL USING (public.is_admin());

-- Quote Requests (demandes de devis)
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dépôt de demande de devis public" ON public.quote_requests
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Gestion des demandes de devis par admin" ON public.quote_requests
    FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. POLITIQUES : RECRUTEMENT (Offres & Candidatures)
-- ------------------------------------------------------------------------------

-- Job Offers
CREATE POLICY "Lecture publique des offres actives" ON public.job_offers
    FOR SELECT USING (statut = 'active' OR public.is_admin());
CREATE POLICY "Gestion offres d'emploi par admin" ON public.job_offers
    FOR ALL USING (public.is_admin());

-- Applications
CREATE POLICY "Dépôt de candidature public" ON public.applications
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Lecture et gestion des candidatures par admin" ON public.applications
    FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. POLITIQUES : ASSISTANT IA (Chatbot & Analytics)
-- ------------------------------------------------------------------------------

ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Chatbot Settings : lecture publique (le widget client doit savoir si le
-- chatbot est activé et connaître son message d'accueil), écriture admin
CREATE POLICY "Lecture publique de la configuration chatbot" ON public.chatbot_settings
    FOR SELECT USING (true);
CREATE POLICY "Gestion configuration chatbot par admin" ON public.chatbot_settings
    FOR ALL USING (public.is_admin());

-- Chatbot Conversations : écriture publique (le visiteur crée/alimente sa
-- propre conversation), lecture réservée à l'admin
CREATE POLICY "Création de conversation publique" ON public.chatbot_conversations
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Mise à jour de conversation publique" ON public.chatbot_conversations
    FOR UPDATE USING (true);
CREATE POLICY "Lecture des conversations par admin" ON public.chatbot_conversations
    FOR SELECT USING (public.is_admin());

-- Analytics Events : écriture publique (tracking anonyme du site), lecture
-- réservée à l'admin (panneau "Intelligence" du dashboard)
CREATE POLICY "Collecte d'événements publique" ON public.analytics_events
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Lecture des événements par admin" ON public.analytics_events
    FOR SELECT USING (public.is_admin());

-- Site Settings (apparence) : lecture publique (le site public doit pouvoir
-- appliquer la couleur de marque et le logo sans être authentifié), écriture
-- admin uniquement
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique de l'apparence du site" ON public.site_settings
    FOR SELECT USING (true);
CREATE POLICY "Gestion de l'apparence par admin" ON public.site_settings
    FOR ALL USING (public.is_admin());
