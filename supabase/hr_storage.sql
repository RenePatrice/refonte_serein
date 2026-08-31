-- ==============================================================================
-- SEREIN-GE : MODULE RH — STOCKAGE DES PHOTOS DE PROFIL EMPLOYÉ
-- Bucket privé : accès en écriture réservé à RH/Super Admin, lecture à tout
-- utilisateur authentifié du dashboard.
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES
    ('employee-photos', 'employee-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "RH et super admin upload photos employés" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'employee-photos' AND (public.has_role('rh') OR public.has_role('super_admin')));

CREATE POLICY "RH et super admin modifient photos employés" ON storage.objects
    FOR UPDATE USING (bucket_id = 'employee-photos' AND (public.has_role('rh') OR public.has_role('super_admin')));

CREATE POLICY "RH et super admin suppriment photos employés" ON storage.objects
    FOR DELETE USING (bucket_id = 'employee-photos' AND (public.has_role('rh') OR public.has_role('super_admin')));

CREATE POLICY "Lecture des photos employés par utilisateur authentifié" ON storage.objects
    FOR SELECT USING (bucket_id = 'employee-photos' AND auth.role() = 'authenticated');
