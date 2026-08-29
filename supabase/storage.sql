-- ==============================================================================
-- SEREIN-GE : CONFIGURATION DU STOCKAGE SUPABASE (STORAGE BUCKETS & POLICIES)
-- Cahier des charges v2.2 - 28 août 2026
-- ==============================================================================

-- 1. Création des 6 Buckets de Stockage
INSERT INTO storage.buckets (id, name, public) VALUES
    ('products', 'products', true),
    ('team', 'team', true),
    ('realisations', 'realisations', true),
    ('actualites', 'actualites', true),
    ('partners', 'partners', true),
    ('cvs', 'cvs', false) -- Privé : contient des données personnelles (CV, lettres de motivation)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques d'accès pour les Buckets publics (Consultation publique, écriture admin)
CREATE POLICY "Public Read Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admin Upload Products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Modify Products" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Products" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Public Read Team" ON storage.objects FOR SELECT USING (bucket_id = 'team');
CREATE POLICY "Admin Upload Team" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Modify Team" ON storage.objects FOR UPDATE USING (bucket_id = 'team' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Team" ON storage.objects FOR DELETE USING (bucket_id = 'team' AND auth.role() = 'authenticated');

CREATE POLICY "Public Read Realisations" ON storage.objects FOR SELECT USING (bucket_id = 'realisations');
CREATE POLICY "Admin Upload Realisations" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'realisations' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Modify Realisations" ON storage.objects FOR UPDATE USING (bucket_id = 'realisations' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Realisations" ON storage.objects FOR DELETE USING (bucket_id = 'realisations' AND auth.role() = 'authenticated');

CREATE POLICY "Public Read Actualites" ON storage.objects FOR SELECT USING (bucket_id = 'actualites');
CREATE POLICY "Admin Upload Actualites" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'actualites' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Modify Actualites" ON storage.objects FOR UPDATE USING (bucket_id = 'actualites' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Actualites" ON storage.objects FOR DELETE USING (bucket_id = 'actualites' AND auth.role() = 'authenticated');

CREATE POLICY "Public Read Partners" ON storage.objects FOR SELECT USING (bucket_id = 'partners');
CREATE POLICY "Admin Upload Partners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'partners' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Modify Partners" ON storage.objects FOR UPDATE USING (bucket_id = 'partners' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Partners" ON storage.objects FOR DELETE USING (bucket_id = 'partners' AND auth.role() = 'authenticated');

-- 3. Politiques pour le Bucket privé CVS (Candidatures)
-- Les candidats anonymes peuvent uploader un CV
CREATE POLICY "Anonymous Upload CV" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cvs');
-- Seuls les administrateurs peuvent lire et supprimer les CVs
CREATE POLICY "Admin Read CV" ON storage.objects FOR SELECT USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete CV" ON storage.objects FOR DELETE USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');
