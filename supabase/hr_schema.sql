-- ==============================================================================
-- SEREIN-GE : MODULE RH & PROJETS — SCHÉMA (additif, ne modifie jamais public.users)
--
-- Un même compte peut cumuler plusieurs rôles d'accès via user_roles (ex :
-- super_admin + rh + responsable_projet). Un employé peut exister dans le
-- système RH sans avoir de compte de connexion (employees.user_id nullable).
--
-- IMPORTANT : employees.employee_type ('directeur', 'cadre', 'stagiaire', ...)
-- est un TITRE RH purement descriptif — il n'accorde AUCUN droit d'accès.
-- Les droits viennent uniquement de user_roles (roles.scope = 'site').
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. RÔLES D'ACCÈS (unifie super_admin/editeur existants + nouveaux rôles RH)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT 'general', -- 'site' (super_admin/editeur) ou 'rh'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Reprend exactement les codes existants dans users.role (super_admin, editeur)
-- pour ne jamais créer un second système de rôles parallèle et incompatible.
INSERT INTO public.roles (code, label, scope) VALUES
    ('super_admin', 'Super Administrateur', 'site'),
    ('editeur', 'Éditeur', 'site'),
    ('rh', 'Ressources Humaines', 'rh'),
    ('responsable_projet', 'Responsable de Projet', 'rh'),
    ('employe', 'Employé', 'rh')
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. TABLE PIVOT : user_roles (cumul de rôles par compte)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- ------------------------------------------------------------------------------
-- 3. EMPLOYÉS (existent indépendamment d'un compte de connexion)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    photo_url TEXT,
    birth_date DATE,
    birth_place TEXT,
    nationality TEXT,
    marital_status TEXT, -- celibataire, marie, divorce, veuf
    national_id_number TEXT,
    national_id_expiry DATE,
    driving_license_number TEXT,
    driving_license_expiry DATE,
    address TEXT,
    phone TEXT,
    personal_email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_relation TEXT,
    emergency_contact_phone TEXT,
    job_title TEXT NOT NULL,
    employee_type TEXT NOT NULL DEFAULT 'employe'
        CHECK (employee_type IN ('directeur', 'cadre', 'employe', 'stagiaire', 'prestataire', 'consultant', 'chauffeur')),
    department TEXT,
    manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'en_conge', 'suspendu', 'sorti')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_employees_user ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON public.employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);

-- ------------------------------------------------------------------------------
-- 4. DIPLÔMES & LANGUES (relations 1-N)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.employee_diplomas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    institution TEXT,
    year INT
);

CREATE TABLE IF NOT EXISTS public.employee_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    level TEXT -- debutant, intermediaire, courant, natif
);

CREATE INDEX IF NOT EXISTS idx_employee_diplomas_employee ON public.employee_diplomas(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_languages_employee ON public.employee_languages(employee_id);

-- ------------------------------------------------------------------------------
-- 5. CONTRATS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    contract_type TEXT NOT NULL CHECK (contract_type IN ('CDI', 'CDD', 'stage', 'prestation', 'consultation', 'freelance')),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL si CDI
    base_salary NUMERIC(12,2),
    currency TEXT NOT NULL DEFAULT 'XOF',
    status TEXT NOT NULL DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'renouvele', 'resilie', 'expire')),
    end_reason TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_contracts_employee ON public.contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);

-- ------------------------------------------------------------------------------
-- 6. PROJETS, MEMBRES, JALONS, RAPPORTS HEBDOMADAIRES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'en_cours' CHECK (status IN ('planifie', 'en_cours', 'termine', 'suspendu')),
    responsible_id UUID NOT NULL REFERENCES public.employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    role_in_project TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (project_id, employee_id)
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'a_venir' CHECK (status IN ('a_venir', 'en_cours', 'termine', 'en_retard'))
);

CREATE TABLE IF NOT EXISTS public.project_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES public.employees(id),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    progress_percent INT CHECK (progress_percent BETWEEN 0 AND 100),
    achievements TEXT,
    blockers TEXT,
    next_steps TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_projects_responsible ON public.projects(responsible_id);
CREATE INDEX IF NOT EXISTS idx_project_members_employee ON public.project_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_reports_project ON public.project_reports(project_id);

-- ------------------------------------------------------------------------------
-- 7. NOTIFICATIONS (alertes d'expiration & rapports manquants)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_role TEXT NOT NULL CHECK (target_role IN ('rh', 'super_admin')),
    type TEXT NOT NULL, -- contrat_expire, piece_identite_expire, permis_expire, rapport_manquant
    message TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON public.notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type_reference ON public.notifications(type, reference_id, created_at);
-- Pas d'index UNIQUE sur (type, reference_id, date) : un cast de date dans un
-- index doit être IMMUTABLE, ce que ::date n'est pas (dépend du fuseau de la
-- session). La déduplication "déjà notifié aujourd'hui" est donc faite côté
-- edge function check-expirations (SELECT avant INSERT), pas en contrainte DB.

-- ------------------------------------------------------------------------------
-- 8. VUE : ÉCHÉANCES À VENIR (contrats, pièce d'identité, permis — 1 mois avant)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.upcoming_expirations AS
SELECT
    e.id AS employee_id,
    e.first_name,
    e.last_name,
    'contrat' AS expiration_type,
    c.end_date AS expiration_date,
    c.id AS reference_id
FROM public.employees e
JOIN public.contracts c ON c.employee_id = e.id
WHERE c.status = 'en_cours'
  AND c.end_date IS NOT NULL
  AND c.end_date <= (CURRENT_DATE + INTERVAL '1 month')
  AND c.end_date >= CURRENT_DATE

UNION ALL

SELECT
    e.id, e.first_name, e.last_name,
    'piece_identite' AS expiration_type,
    e.national_id_expiry AS expiration_date,
    e.id AS reference_id
FROM public.employees e
WHERE e.national_id_expiry IS NOT NULL
  AND e.national_id_expiry <= (CURRENT_DATE + INTERVAL '1 month')
  AND e.national_id_expiry >= CURRENT_DATE

UNION ALL

SELECT
    e.id, e.first_name, e.last_name,
    'permis_conduire' AS expiration_type,
    e.driving_license_expiry AS expiration_date,
    e.id AS reference_id
FROM public.employees e
WHERE e.driving_license_expiry IS NOT NULL
  AND e.driving_license_expiry <= (CURRENT_DATE + INTERVAL '1 month')
  AND e.driving_license_expiry >= CURRENT_DATE;

-- ------------------------------------------------------------------------------
-- 9. TRIGGER updated_at POUR LES NOUVELLES TABLES QUI EN ONT
-- ------------------------------------------------------------------------------

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'updated_at'
          AND table_name IN ('employees')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_updated_at ON public.%I;', t);
        EXECUTE format('CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();', t);
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 10. MIGRATION ONE-SHOT : bascule users.role -> user_roles (idempotente)
-- Ne supprime jamais users.role ; le champ reste en lecture seule pour
-- compatibilité jusqu'à ce que tout le code applicatif utilise user_roles.
-- ------------------------------------------------------------------------------

INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u
JOIN public.roles r ON r.code = u.role
ON CONFLICT (user_id, role_id) DO NOTHING;
