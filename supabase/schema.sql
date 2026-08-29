-- ==============================================================================
-- SEREIN-GE : SCHÉMA COMPLET DE LA BASE DE DONNÉES SUPABASE (12 TABLES)
-- Cahier des charges v2.2 - 28 août 2026
-- ==============================================================================

-- Activation de l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. MODULE SYSTÈME & PROFILS UTILISATEURS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nom_complet TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editeur' CHECK (role IN ('super_admin', 'editeur')),
    avatar_url TEXT,
    telephone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. MODULE CONTENU DU SITE (ÉQUIPE, DÉPARTEMENTS, RÉALISATIONS, ACTUALITÉS, PARTENAIRES)
-- ==============================================================================

-- Table des Départements
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icone TEXT DEFAULT 'Compass',
    image_url TEXT,
    ordre INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table des Membres de l'Équipe
CREATE TABLE IF NOT EXISTS public.team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    poste TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    bio TEXT,
    photo_url TEXT,
    email TEXT,
    telephone TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    ordre INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table des Réalisations / Projets
CREATE TABLE IF NOT EXISTS public.realisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    client TEXT NOT NULL,
    date_realisation DATE,
    lieu TEXT NOT NULL DEFAULT 'Burkina Faso',
    categorie TEXT NOT NULL, -- 'Topographie', 'Géomatique', 'BTP / VRD', 'Hydraulique', 'Mines & Carrières'
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    a_la_une BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table des Actualités / Blog
CREATE TABLE IF NOT EXISTS public.actualites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    extrait TEXT NOT NULL,
    contenu TEXT NOT NULL,
    image_couverture TEXT,
    categorie TEXT NOT NULL DEFAULT 'Général',
    auteur_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    statut TEXT NOT NULL DEFAULT 'publie' CHECK (statut IN ('brouillon', 'publie', 'planifie')),
    date_publication TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    vues INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table des Partenaires & Marques représentées
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    site_web TEXT,
    categorie TEXT NOT NULL DEFAULT 'Technologique', -- 'Constructeur', 'Institutionnel', 'Client'
    description TEXT,
    ordre INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. MODULE E-COMMERCE (PRODUITS, COMMANDES, LIGNES, LOGS DE PAIEMENT)
-- ==============================================================================

-- Table des Produits (Équipements Topographiques, GNSS, Drones, Accessoires)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    marque TEXT NOT NULL, -- 'CHCNAV', 'Toknav', 'FOIF', 'DJI Enterprise', 'Garmin', 'Autre'
    categorie TEXT NOT NULL, -- 'Récepteurs GNSS RTK', 'Stations Totales', 'Niveaux Optiques / Numériques', 'Drones & LiDAR', 'Carnets & Logiciels', 'Accessoires'
    description_courte TEXT NOT NULL,
    description_complete TEXT NOT NULL,
    prix_fcfa BIGINT NOT NULL CHECK (prix_fcfa >= 0),
    prix_promo_fcfa BIGINT CHECK (prix_promo_fcfa < prix_fcfa),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_alerte INT NOT NULL DEFAULT 2,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    specs_techniques JSONB DEFAULT '{}'::jsonb, -- e.g. {"Canaux": "1408", "Précision RTK Hz": "8mm + 1ppm", "Batterie": "15h", "Poids": "950g"}
    brochure_url TEXT,
    en_vedette BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table des Commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE, -- e.g. 'SEREIN-2026-0001'
    client_nom TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_telephone TEXT NOT NULL,
    client_entreprise TEXT,
    adresse_livraison TEXT NOT NULL,
    ville TEXT NOT NULL DEFAULT 'Ouagadougou',
    pays TEXT NOT NULL DEFAULT 'Burkina Faso',
    notes_client TEXT,
    total_fcfa BIGINT NOT NULL CHECK (total_fcfa >= 0),
    frais_livraison_fcfa BIGINT NOT NULL DEFAULT 0,
    statut TEXT NOT NULL DEFAULT 'pending' CHECK (statut IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    mode_paiement TEXT NOT NULL DEFAULT 'whatsapp' CHECK (mode_paiement IN ('whatsapp', 'cinetpay', 'stripe', 'virement', 'especes_retrait')),
    cinetpay_token TEXT,
    stripe_session_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table des Articles commandés
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_nom TEXT NOT NULL,
    product_marque TEXT,
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire_fcfa BIGINT NOT NULL CHECK (prix_unitaire_fcfa >= 0),
    total_ligne_fcfa BIGINT NOT NULL CHECK (total_ligne_fcfa >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table des Logs de Paiement (CinetPay / Stripe / Orange / Moov / Wave)
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('cinetpay', 'stripe', 'direct')),
    transaction_id TEXT,
    montant_fcfa BIGINT NOT NULL,
    statut TEXT NOT NULL, -- 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PENDING'
    operateur TEXT, -- 'ORANGE_MONEY', 'MOOV_MONEY', 'MTN', 'WAVE', 'VISA_MASTERCARD'
    callback_raw JSONB DEFAULT '{}'::jsonb,
    ip_source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table des Demandes de Devis (formulaire wizard /contact)
CREATE TABLE IF NOT EXISTS public.quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE,
    service_type TEXT NOT NULL,
    project_scope TEXT,
    surface_area TEXT,
    location TEXT NOT NULL,
    timeframe TEXT,
    budget_estimate TEXT,
    client_nom TEXT NOT NULL,
    client_prenom TEXT NOT NULL,
    client_entreprise TEXT,
    client_email TEXT NOT NULL,
    client_telephone TEXT NOT NULL,
    description TEXT,
    statut TEXT NOT NULL DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'en_cours', 'traite', 'annule')),
    notes_internes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. MODULE RECRUTEMENT (OFFRES D'EMPLOI, CANDIDATURES)
-- ==============================================================================

-- Table des Offres d'Emploi
CREATE TABLE IF NOT EXISTS public.job_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    departement TEXT NOT NULL, -- 'Topographie & Géodésie', 'Géomatique & SIG', 'Ingénierie & BTP', 'Commercial & Support', 'Administration'
    type_contrat TEXT NOT NULL DEFAULT 'CDI' CHECK (type_contrat IN ('CDI', 'CDD', 'Stage', 'Prestation / Consultant')),
    lieu TEXT NOT NULL DEFAULT 'Ouagadougou, Burkina Faso',
    salaire_indicatif TEXT,
    date_limite DATE,
    description TEXT NOT NULL,
    missions TEXT[] DEFAULT ARRAY[]::TEXT[],
    profil_recherche TEXT[] DEFAULT ARRAY[]::TEXT[],
    avantages TEXT[] DEFAULT ARRAY[]::TEXT[],
    statut TEXT NOT NULL DEFAULT 'active' CHECK (statut IN ('active', 'archivee', 'brouillon')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table des Candidatures (Liées à une offre ou spontanées)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_offer_id UUID REFERENCES public.job_offers(id) ON DELETE SET NULL,
    type_candidature TEXT NOT NULL DEFAULT 'sur_offre' CHECK (type_candidature IN ('sur_offre', 'spontanee')),
    poste_souhaite TEXT,
    civilite TEXT DEFAULT 'M.',
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    adresse_ville TEXT DEFAULT 'Ouagadougou',
    niveau_etude TEXT,
    annees_experience INT DEFAULT 0,
    cv_url TEXT NOT NULL,
    lettre_motivation_url TEXT,
    message TEXT,
    statut TEXT NOT NULL DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'en_revue', 'entretien', 'retenu', 'rejete')),
    notes_recruteur TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. MODULE ASSISTANT IA (CONFIGURATION DU CHATBOT)
-- ==============================================================================

-- Ligne de configuration unique du chatbot (activation, ton, base de connaissance)
CREATE TABLE IF NOT EXISTS public.chatbot_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    welcome_message TEXT NOT NULL DEFAULT 'Bonjour ! Je suis l''assistant SEREIN-GE, comment puis-je vous aider ?',
    system_prompt TEXT NOT NULL DEFAULT 'Tu es l''assistant virtuel de SEREIN-GE, distributeur agréé CHCNAV et Toknav au Burkina Faso, spécialisé en topographie, géomatique et ingénierie BTP. Réponds de façon concise, professionnelle et en français.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Historique des conversations (préparation pour le widget client à venir)
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    visitor_email TEXT,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{role: 'user'|'assistant', content, created_at}]
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Événements comportementaux du site public (vues produits, clics, recherches)
-- Base de collecte pour le panneau "Intelligence" du dashboard.
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- 'page_view' | 'product_view' | 'add_to_cart' | 'search' | 'order_submitted'
    session_id TEXT NOT NULL,
    path TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEX POUR L'OPTIMISATION DES PERFORMANCES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_products_marque ON public.products(marque);
CREATE INDEX IF NOT EXISTS idx_products_categorie ON public.products(categorie);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_statut ON public.orders(statut);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON public.payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_transaction ON public.payment_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_realisations_slug ON public.realisations(slug);
CREATE INDEX IF NOT EXISTS idx_actualites_slug ON public.actualites(slug);
CREATE INDEX IF NOT EXISTS idx_job_offers_statut ON public.job_offers(statut);
CREATE INDEX IF NOT EXISTS idx_quote_requests_reference ON public.quote_requests(reference);
CREATE INDEX IF NOT EXISTS idx_quote_requests_statut ON public.quote_requests(statut);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session ON public.chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_applications_statut ON public.applications(statut);

-- ==============================================================================
-- TRIGGER POUR LA MISE À JOUR AUTOMATIQUE DU CHAMP updated_at
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('users', 'departments', 'team', 'realisations', 'actualites', 'partners', 'products', 'orders', 'job_offers', 'applications', 'chatbot_settings', 'chatbot_conversations', 'quote_requests')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_updated_at ON public.%I;', t);
        EXECUTE format('CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();', t);
    END LOOP;
END $$;
