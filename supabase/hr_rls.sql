-- ==============================================================================
-- SEREIN-GE : MODULE RH & PROJETS — ROW LEVEL SECURITY
--
-- Le contrôle d'accès applicatif (menu, routes) n'est qu'un confort ; la
-- sécurité réelle est ici, au niveau base de données, pour couvrir tout
-- appel direct au client Supabase depuis le front-end.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. FONCTION UTILITAIRE : l'utilisateur courant a-t-il ce rôle ?
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.has_role(role_code TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid() AND r.code = role_code
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Raccourci : l'employé lié au compte courant (NULL si aucun)
CREATE OR REPLACE FUNCTION public.current_employee_id()
RETURNS UUID AS $$
    SELECT id FROM public.employees WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- IMPORTANT : cette fonction existe pour éviter qu'une policy sur
-- project_members interroge project_members dans sa propre clause USING,
-- ce qui provoque une récursion infinie ("infinite recursion detected in
-- policy for relation project_members"). SECURITY DEFINER exécute la
-- requête avec les privilèges du propriétaire de la fonction (qui
-- contourne RLS), donc l'appel ne re-déclenche jamais les policies de
-- project_members.
CREATE OR REPLACE FUNCTION public.current_employee_project_ids()
RETURNS SETOF UUID AS $$
    SELECT project_id FROM public.project_members WHERE employee_id = public.current_employee_id();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_diplomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. ROLES & USER_ROLES
-- ------------------------------------------------------------------------------

CREATE POLICY "Lecture des rôles par tout utilisateur connecté" ON public.roles
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gestion des rôles par super admin" ON public.roles
    FOR ALL USING (public.has_role('super_admin'));

CREATE POLICY "Un utilisateur voit ses propres rôles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "RH et super admin voient toutes les affectations" ON public.user_roles
    FOR SELECT USING (public.has_role('super_admin') OR public.has_role('rh'));
CREATE POLICY "Affectation des rôles par super admin uniquement" ON public.user_roles
    FOR INSERT WITH CHECK (public.has_role('super_admin'));
CREATE POLICY "Modification des affectations par super admin uniquement" ON public.user_roles
    FOR UPDATE USING (public.has_role('super_admin'));
CREATE POLICY "Suppression des affectations par super admin uniquement" ON public.user_roles
    FOR DELETE USING (public.has_role('super_admin'));

-- ------------------------------------------------------------------------------
-- 2. EMPLOYEES
-- ------------------------------------------------------------------------------

CREATE POLICY "RH et super admin accès complet employés" ON public.employees
    FOR ALL USING (public.has_role('rh') OR public.has_role('super_admin'));

CREATE POLICY "Un employé voit sa propre fiche" ON public.employees
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Un responsable de projet voit son équipe" ON public.employees
    FOR SELECT USING (
        public.has_role('responsable_projet') AND
        id IN (
            SELECT pm.employee_id FROM public.project_members pm
            JOIN public.projects p ON p.id = pm.project_id
            WHERE p.responsible_id = public.current_employee_id()
        )
    );

-- ------------------------------------------------------------------------------
-- 3. DIPLÔMES & LANGUES (même visibilité que la fiche employé parente)
-- ------------------------------------------------------------------------------

CREATE POLICY "RH et super admin accès complet diplômes" ON public.employee_diplomas
    FOR ALL USING (public.has_role('rh') OR public.has_role('super_admin'));
CREATE POLICY "Un employé voit ses propres diplômes" ON public.employee_diplomas
    FOR SELECT USING (employee_id = public.current_employee_id());

CREATE POLICY "RH et super admin accès complet langues" ON public.employee_languages
    FOR ALL USING (public.has_role('rh') OR public.has_role('super_admin'));
CREATE POLICY "Un employé voit ses propres langues" ON public.employee_languages
    FOR SELECT USING (employee_id = public.current_employee_id());

-- ------------------------------------------------------------------------------
-- 4. CONTRATS
-- ------------------------------------------------------------------------------

CREATE POLICY "RH et super admin accès complet contrats" ON public.contracts
    FOR ALL USING (public.has_role('rh') OR public.has_role('super_admin'));

CREATE POLICY "Un employé voit ses propres contrats" ON public.contracts
    FOR SELECT USING (employee_id = public.current_employee_id());

-- ------------------------------------------------------------------------------
-- 5. PROJETS
-- ------------------------------------------------------------------------------

CREATE POLICY "RH et super admin accès complet projets" ON public.projects
    FOR ALL USING (public.has_role('rh') OR public.has_role('super_admin'));

CREATE POLICY "Le responsable gère ses propres projets" ON public.projects
    FOR ALL USING (responsible_id = public.current_employee_id());

CREATE POLICY "Un membre voit les projets auxquels il participe" ON public.projects
    FOR SELECT USING (
        id IN (SELECT public.current_employee_project_ids())
    );

-- ------------------------------------------------------------------------------
-- 6. MEMBRES DE PROJET
-- ------------------------------------------------------------------------------

CREATE POLICY "RH et super admin accès complet membres" ON public.project_members
    FOR ALL USING (public.has_role('rh') OR public.has_role('super_admin'));

CREATE POLICY "Le responsable gère les membres de ses projets" ON public.project_members
    FOR ALL USING (
        project_id IN (SELECT id FROM public.projects WHERE responsible_id = public.current_employee_id())
    );

CREATE POLICY "Un membre voit la composition de ses projets" ON public.project_members
    FOR SELECT USING (
        project_id IN (SELECT public.current_employee_project_ids())
    );

-- ------------------------------------------------------------------------------
-- 7. JALONS DE PROJET
-- ------------------------------------------------------------------------------

CREATE POLICY "RH et super admin accès complet jalons" ON public.project_milestones
    FOR ALL USING (public.has_role('rh') OR public.has_role('super_admin'));

CREATE POLICY "Le responsable gère les jalons de ses projets" ON public.project_milestones
    FOR ALL USING (
        project_id IN (SELECT id FROM public.projects WHERE responsible_id = public.current_employee_id())
    );

CREATE POLICY "Un membre voit les jalons de ses projets" ON public.project_milestones
    FOR SELECT USING (
        project_id IN (SELECT public.current_employee_project_ids())
    );

-- ------------------------------------------------------------------------------
-- 8. RAPPORTS HEBDOMADAIRES
-- ------------------------------------------------------------------------------

CREATE POLICY "RH et super admin accès complet rapports" ON public.project_reports
    FOR ALL USING (public.has_role('rh') OR public.has_role('super_admin'));

CREATE POLICY "Le responsable rédige ses rapports" ON public.project_reports
    FOR INSERT WITH CHECK (author_id = public.current_employee_id());

CREATE POLICY "Le responsable modifie ses propres rapports" ON public.project_reports
    FOR UPDATE USING (author_id = public.current_employee_id());

CREATE POLICY "Les parties prenantes du projet lisent les rapports" ON public.project_reports
    FOR SELECT USING (
        project_id IN (SELECT public.current_employee_project_ids())
        OR project_id IN (SELECT id FROM public.projects WHERE responsible_id = public.current_employee_id())
    );

-- ------------------------------------------------------------------------------
-- 9. NOTIFICATIONS (alertes d'expiration & rapports manquants)
-- Écriture réservée à l'edge function check-expirations (clé service_role,
-- qui contourne RLS) ; ici on ne couvre que la lecture par les destinataires.
-- ------------------------------------------------------------------------------

CREATE POLICY "RH et super admin lisent leurs notifications" ON public.notifications
    FOR SELECT USING (
        (target_role = 'rh' AND public.has_role('rh'))
        OR (target_role = 'super_admin' AND public.has_role('super_admin'))
    );

CREATE POLICY "RH et super admin marquent leurs notifications comme lues" ON public.notifications
    FOR UPDATE USING (
        (target_role = 'rh' AND public.has_role('rh'))
        OR (target_role = 'super_admin' AND public.has_role('super_admin'))
    );
