-- ==============================================================================
-- SEREIN-GE : DONNÉES INITIALES RÉALISTES (SEED DATA)
-- Cahier des charges v2.2 - 28 août 2026
-- ==============================================================================

-- 1. Départements SEREIN-GE
INSERT INTO public.departments (id, nom, slug, description, icone, image_url, ordre) VALUES
('d1111111-1111-1111-1111-111111111111', 'Topographie & Géodésie', 'topographie-geodesie', 'Travaux de haute précision géodésique, polygonation, nivellement de précision, auscultation d''ouvrages d''art et topographie minière.', 'Crosshair', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', 1),
('d2222222-2222-2222-2222-222222222222', 'Géomatique & Systèmes d''Information Géographique (SIG)', 'geomatique-sig', 'Cartographie thématique, modélisation 3D du territoire, bases de données spatiales, télédétection spatiale et cadastres numériques.', 'Layers', 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80', 2),
('d3333333-3333-3333-3333-333333333333', 'Ingénierie & Infrastructures BTP / VRD', 'ingenierie-btp-vrd', 'Études d''infrastructures routières, assainissement, aménagements hydro-agricoles, suivi et contrôle de chantiers de génie civil.', 'Building2', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', 3),
('d4444444-4444-4444-4444-444444444444', 'Distribution de Matériel & Support Technique', 'distribution-materiel', 'Distributeur officiel d''instruments topographiques et géodésiques de pointe (CHCNAV, Toknav, FOIF), SAV certifié et formation continue.', 'Cpu', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Membres de l'Équipe
INSERT INTO public.team (id, nom, poste, department_id, bio, photo_url, email, telephone, linkedin_url, ordre) VALUES
('t1111111-1111-1111-1111-111111111111', 'Ing. Patrice COMPAORÉ', 'Directeur Général & Ingénieur Géomètre', 'd1111111-1111-1111-1111-111111111111', 'Plus de 18 ans d''expérience en ingénierie géodésique, aménagement territorial et pilotage de grands projets d''infrastructures en Afrique de l''Ouest.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80', 'direction@serein-ge.bf', '+226 25 30 00 01', 'https://linkedin.com', 1),
('t2222222-2222-2222-2222-222222222222', 'Mme Aminata OUÉDRAOGO', 'Responsable Département SIG & Télédétection', 'd2222222-2222-2222-2222-222222222222', 'Spécialiste en géomatique appliquée, analyse spatiale avancée et conception de systèmes d''information géographiques décisionnels.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', 'sig@serein-ge.bf', '+226 25 30 00 02', 'https://linkedin.com', 2),
('t3333333-3333-3333-3333-333333333333', 'Ing. Moussa TRAORÉ', 'Chef de Projets BTP & Auscultation d''Ouvrages', 'd3333333-3333-3333-3333-333333333333', 'Expert en calculs de cubatures, modélisation numérique de terrain et contrôle géométrique de chantiers autoroutiers et barrages.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80', 'travaux@serein-ge.bf', '+226 25 30 00 03', 'https://linkedin.com', 3),
('t4444444-4444-4444-4444-444444444444', 'Yacouba SANOU', 'Responsable Ventes Instruments & Service Après-Vente', 'd4444444-4444-4444-4444-444444444444', 'Technicien supérieur certifié CHCNAV & Toknav, spécialiste de la calibration, maintenance et formation des utilisateurs terrain.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', 'commercial@serein-ge.bf', '+226 25 30 00 04', 'https://linkedin.com', 4)
ON CONFLICT (id) DO NOTHING;

-- 3. Partenaires
INSERT INTO public.partners (nom, logo_url, site_web, categorie, description, ordre) VALUES
('CHCNAV (Shanghai Huace Navigation)', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', 'https://chcnav.com', 'Constructeur', 'Leader mondial en solutions GNSS de haute précision, LiDAR aéroporté et photogrammétrie.', 1),
('Toknav Technology', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', 'https://toknav.com', 'Constructeur', 'Pionnier en récepteurs GNSS compacts intégrant la technologie IMU et caméra de réalité augmentée.', 2),
('FOIF', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', 'https://foif.com', 'Constructeur', 'Fabricant historique de stations totales robotisées, théodolites et niveaux optiques.', 3),
('DJI Enterprise', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', 'https://enterprise.dji.com', 'Constructeur', 'Drones professionnels pour la cartographie aérienne et l''inspection thermique et LiDAR.', 4),
('Ordre des Géomètres Experts du Burkina (OGEB)', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', 'https://ogeb.bf', 'Institutionnel', 'Partenaire institutionnel pour la conformité foncière et cadastrale.', 5)
ON CONFLICT DO NOTHING;

-- 4. Produits Électroniques & Matériel Topographique
INSERT INTO public.products (id, nom, slug, marque, categorie, description_courte, description_complete, prix_fcfa, prix_promo_fcfa, stock, stock_alerte, images, specs_techniques, en_vedette) VALUES
(
    'p1111111-1111-1111-1111-111111111111',
    'CHCNAV i90 GNSS RTK IMU',
    'chcnav-i90-gnss-rtk-imu',
    'CHCNAV',
    'Récepteurs GNSS RTK',
    'Récepteur GNSS multi-constellations haut de gamme avec centrale inertielle IMU sans étalonnage et modem 4G/UHF intégré.',
    'Le CHCNAV i90 intègre les dernières technologies GNSS de pointe avec 624 canaux de suivi toutes constellations (GPS, GLONASS, Galileo, BeiDou, QZSS, SBAS). Son IMU haute précision compense l''inclinaison de la canne jusqu''à 60° avec une précision centimétrique instantanée sans nécessiter d''étalonnage préalable. Idéal pour les levés en milieu encombré ou difficile.',
    4250000,
    3950000,
    6,
    2,
    ARRAY['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'],
    '{"Canaux": "624 canaux multi-constellations", "Précision RTK Hz": "8 mm + 1 ppm", "Précision RTK V": "15 mm + 1 ppm", "Compensation IMU": "Jusqu''à 60° (précision < 2 cm)", "Radio UHF": "Émetteur/Récepteur 1W / 2W", "Modem": "4G LTE multi-opérateurs", "Autonomie": "14 heures en RTK Rover", "Indice": "IP68 (résiste à l''eau et poussière)"}'::jsonb,
    true
),
(
    'p2222222-2222-2222-2222-222222222222',
    'Toknav T20 Pro GNSS avec Caméra AR & IMU',
    'toknav-t20-pro-gnss-ar-imu',
    'Toknav',
    'Récepteurs GNSS RTK',
    'Récepteur GNSS révolutionnaire avec double caméra pour implantation visuelle en réalité augmentée et levé photogrammétrique.',
    'Le Toknav T20 Pro redéfinit le travail de l''opérateur terrain grâce à son module de caméra haute définition intégrée permettant l''implantation visuelle en réalité augmentée (AR Stakeout). Plus besoin de regarder l''écran de manière abstraite : la cible s''affiche directement superposée au terrain réel. Muni de 1408 canaux et d''un boîtier en alliage de magnésium ultra-robuste.',
    4850000,
    null,
    4,
    1,
    ARRAY['https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
    '{"Canaux": "1408 canaux toutes constellations", "Technologie": "Visual AR Stakeout (Implantation caméra)", "Compensation IMU": "60° instantané 300Hz", "Précision RTK": "8 mm + 0.5 ppm RMS", "Poids": "790 g avec batterie", "Batterie": "Interne 6800 mAh charge rapide USB-C", "Connectivité": "Bluetooth 5.0, Wi-Fi, NFC, 4G, Radio UHF"}'::jsonb,
    true
),
(
    'p3333333-3333-3333-3333-333333333333',
    'CHCNAV i73+ GNSS Ultra-Compact',
    'chcnav-i73-plus-gnss-ultra-compact',
    'CHCNAV',
    'Récepteurs GNSS RTK',
    'Le récepteur GNSS RTK le plus léger et compact de sa catégorie (730g) avec IMU 60° et autonomie prolongée.',
    'Le récepteur de poche CHCNAV i73+ combine légèreté absolue et performance extrême. Avec son poids plume de seulement 730g, il réduit considérablement la fatigue de l''arpenteur durant les longues journées de levé topo. Compatible réseau CORS / Ntrip 4G via le carnet de terrain.',
    2850000,
    2650000,
    8,
    2,
    ARRAY['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
    '{"Canaux": "624 canaux", "Poids": "730 g", "Compensation IMU": "Oui, sans interférence magnétique", "Précision Ntrip": "8 mm + 1 ppm", "Étanchéité": "IP67"}'::jsonb,
    false
),
(
    'p4444444-4444-4444-4444-444444444444',
    'Station Totale FOIF RTS352 Reflectorless 1000m',
    'station-totale-foif-rts352-1000m',
    'FOIF',
    'Stations Totales',
    'Station totale de haute précision angulaire 2" avec mesure sans prisme jusqu''à 1000 mètres et double écran couleur.',
    'La station totale FOIF RTS352 est l''équipement de référence pour les chantiers de construction, le génie civil et les levés cadastraux de haute précision. Elle dispose d''un télémètre laser puissant autorisant des portées sans prisme jusqu''à 1000m et 5000m avec prisme simple.',
    3750000,
    null,
    3,
    1,
    ARRAY['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80'],
    '{"Précision angulaire": "2 secondes d''arc", "Portée sans prisme": "1000 m", "Portée avec prisme": "5000 m", "Écran": "Double écran LCD tactile rétroéclairé", "Mémoire": "Carte SD + USB", "Plomb": "Laser réglable"}'::jsonb,
    true
),
(
    'p5555555-5555-5555-5555-555555555555',
    'Drone DJI Matrice 350 RTK avec Zenmuse L2 LiDAR',
    'dji-matrice-350-rtk-zenmuse-l2-lidar',
    'DJI Enterprise',
    'Drones & LiDAR',
    'Solution de cartographie aérienne et scanner LiDAR 3D de précision centimétrique pour topographie grande échelle.',
    'Le combo DJI Matrice 350 RTK couplé au capteur LiDAR Zenmuse L2 permet de générer des modèles numériques de terrain (MNT) ultra-denses même sous couvert végétal dense. Idéal pour les études de corridors routiers, les carrières, les mines et les zones inondables.',
    18500000,
    17500000,
    2,
    1,
    ARRAY['https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'],
    '{"Autonomie": "Jusqu''à 55 minutes de vol", "Portée transmission": "20 km O3 Enterprise", "Portée LiDAR": "450 m (réflectivité 80%)", "Taux d''impulsion": "240 000 pts/s", "Caméra RGB": "Capteur 4/3 CMOS 20 MP pour colorisation 3D"}'::jsonb,
    true
),
(
    'p6666666-6666-6666-6666-666666666666',
    'Carnet de Terrain Robuste CHCNAV HCE600 Android',
    'carnet-de-terrain-chcnav-hce600-android',
    'CHCNAV',
    'Carnets & Logiciels',
    'Contrôleur de terrain durci 5.5" sous Android 10 avec clavier alphanumérique physique et logiciel LandStar 8 inclus.',
    'Le carnet HCE600 est conçu pour résister aux environnements les plus hostiles de chantier. Écran très lumineux lisible en plein soleil sahélien, batterie amovible 6240 mAh pour 14h de travail ininterrompu.',
    950000,
    890000,
    12,
    3,
    ARRAY['https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'],
    '{"Système": "Android 10 avec Google Play Store", "Processeur": "Octa-core 2.0 GHz", "Mémoire": "3 Go RAM + 32 Go Flash", "Écran": "5.5 pouces IPS tactile compatible gants et pluie", "Étanchéité": "IP67 et résistance aux chutes de 1.5m", "Logiciel": "Licence LandStar 8 complète incluse"}'::jsonb,
    false
)
ON CONFLICT (id) DO NOTHING;

-- 5. Réalisations / Projets
INSERT INTO public.realisations (id, titre, slug, client, date_realisation, lieu, categorie, description, details, images, a_la_une) VALUES
(
    'r1111111-1111-1111-1111-111111111111',
    'Levé Topographique & Modélisation 3D pour le Corridor Routier Ouaga-Kaya (105 km)',
    'leve-topo-corridor-ouaga-kaya',
    'Ministère des Infrastructures du Burkina Faso',
    '2025-11-15',
    'Région du Centre-Nord, Burkina Faso',
    'Topographie',
    'Réalisation des études topographiques détaillées d''axe routier, polygonation de précision rattachée au système géodésique national BF-WGS84, levé de profils en long et en travers et calcul des cubatures de terrassement.',
    '{"Longueur": "105 km", "Équipe": "4 brigades topographiques", "Instruments": "4 récepteurs CHCNAV i90 + 2 stations totales FOIF", "Livrables": "Plans au 1/1000, MNT, profils en long/travers, rapport géodésique"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'],
    true
),
(
    'r2222222-2222-2222-2222-222222222222',
    'Numérisation Cadastrale & Mise en Place du SIG Urbain de Bobo-Dioulasso',
    'sig-urbain-bobo-dioulasso',
    'Commune Urbaine de Bobo-Dioulasso / Projet Banque Mondiale',
    '2025-08-20',
    'Bobo-Dioulasso, Burkina Faso',
    'Géomatique',
    'Acquisition d''orthophotographies par drone haute résolution, vectorisation des parcelles fiscales et intégration dans un géoportail WebSIG PostgreSQL / PostGIS avec consultation sécurisée.',
    '{"Superficie": "4 500 hectares", "Parcelles": "plus de 32 000 parcelles géoréférencées", "Technologie": "Drone LiDAR, PostGIS, QGIS Server, Geoserver"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80'],
    true
),
(
    'r3333333-3333-3333-3333-333333333333',
    'Auscultation Géométrique & Suivi de Stabilité du Barrage Hydro-Agricole de Bagré',
    'auscultation-barrage-bagre',
    'Société d''Exploitation de Bagré (Bagrepôle)',
    '2026-02-10',
    'Bagré, Région du Centre-Est',
    'Hydraulique',
    'Surveillance géodésique de haute précision pour la détection millimétrique des déformations des ouvrages en béton et de la digue en terre par micro-triangulation et nivellement de très haute précision.',
    '{"Précision": "Sous-millimétrique", "Points de contrôle": "120 repères de nivellement de précision", "Fréquence": "Campagne biannuelle"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'],
    true
)
ON CONFLICT (id) DO NOTHING;

-- 6. Actualités
INSERT INTO public.actualites (id, titre, slug, extrait, contenu, image_couverture, categorie, statut, date_publication) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'SEREIN-GE devient distributeur agréé Toknav Technology au Burkina Faso',
    'serein-ge-distributeur-agreed-toknav-burkina',
    'Une nouvelle gamme de récepteurs GNSS à réalité augmentée et caméras d''implantation visuelle débarque à Ouagadougou.',
    'Nous sommes fiers d''annoncer la signature de notre partenariat de distribution exclusive avec le constructeur international Toknav Technology. Les géomètres et ingénieurs du Burkina Faso et de la sous-région bénéficient désormais d''un accès direct aux modèles innovants Toknav T20 Pro et T10, assortis d''une garantie constructeur de 2 ans et d''un support technique local assuré par nos ingénieurs certifiés.',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    'Partenariat & Innovation',
    'publie',
    timezone('utc'::text, now()) - interval '5 days'
),
(
    'a2222222-2222-2222-2222-222222222222',
    'Comment le GNSS avec centrale inertielle IMU révolutionne les cadences de levé sur le terrain',
    'impact-imu-gnss-sur-cadences-terrain',
    'Découvrez comment supprimer l''obligation de verticalité de la canne permet de gagner plus de 30% de temps en mission topographique.',
    'Pendant des décennies, le géomètre devait impérativement caler sa bulle de niveau avant chaque prise de point. L''avènement des capteurs IMU insensibles aux champs magnétiques (comme sur le CHCNAV i90 et le Toknav T20 Pro) autorise un levé précis jusqu''à 60 degrés d''inclinaison, y compris dans les fossés, sous les véhicules ou le long des façades...',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    'Expertise Technique',
    'publie',
    timezone('utc'::text, now()) - interval '12 days'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Offres d'Emploi
INSERT INTO public.job_offers (id, titre, slug, departement, type_contrat, lieu, salaire_indicatif, date_limite, description, missions, profil_recherche, avantages, statut) VALUES
(
    'j1111111-1111-1111-1111-111111111111',
    'Ingénieur Géomètre-Topographe Senior (H/F)',
    'ingenieur-geometre-topographe-senior',
    'Topographie & Géodésie',
    'CDI',
    'Ouagadougou avec déplacements fréquents sur les chantiers',
    'Selon profil et expérience (Grille SEREIN-GE)',
    '2026-10-31',
    'Dans le cadre de l''extension de nos activités d''infrastructures et de contrôle de grands ouvrages, SEREIN-GE recrute un(e) Ingénieur(e) Géomètre chevronné(e) pour diriger les brigades d''intervention et superviser les calculs géodésiques.',
    ARRAY['Planification et encadrement des brigades topographiques de terrain', 'Calculs géodésiques, compensations de réseaux et calculs de cubatures sur AutoCAD / Covadis / Mensura', 'Contrôle qualité des levés et rédaction des rapports techniques', 'Interface avec les chefs de projet clients et les bureaux de contrôle'],
    ARRAY['Diplôme d''Ingénieur Géomètre (ESGT, EAMAC, 2iE ou équivalent)', 'Minimum 5 ans d''expérience avérée dans des projets routiers, miniers ou d''aménagements hydro-agricoles', 'Maîtrise parfaite des récepteurs GNSS RTK, stations totales et logiciels de DAO/SIG', 'Permis de conduire B et aptitude aux missions sur toute l''étendue du territoire'],
    ARRAY['Véhicule de service pour les missions', 'Assurance santé complémentaire prise en charge à 80%', 'Formations continues certifiantes sur les technologies LiDAR et Drones'],
    'active'
),
(
    'j2222222-2222-2222-2222-222222222222',
    'Technico-Commercial Vente Matériel Topographique & Drones (H/F)',
    'technico-commercial-materiel-topo-drones',
    'Distribution de Matériel & Support Technique',
    'CDI',
    'Ouagadougou',
    'Fixe motivant + Commissions sur ventes',
    '2026-09-30',
    'Pour accompagner la forte croissance de notre département matériel, nous recherchons un(e) Technico-Commercial(e) passionné(e) par les nouvelles technologies de mesure et de positionnement.',
    ARRAY['Développement du portefeuille clients (entreprises BTP, bureaux d''études, géomètres, mines, administrations)', 'Démonstrations terrain des récepteurs CHCNAV, Toknav et drones DJI Enterprise', 'Élaboration des devis commerciaux et suivi des appels d''offres de fournitures', 'Animation du showroom et participation aux salons professionnels'],
    ARRAY['Formation BAC+2/3 en Topographie, Géomatique ou Génie Civil combinée à une fibre commerciale affirmée', 'Aisance relationnelle, négociation et sens du service client', 'Excellente maîtrise du français et pratique de l''anglais technique'],
    ARRAY['Ordinateur et smartphone de fonction', 'Prime mensuelle déplafonnée sur objectifs', 'Cadre de travail stimulant au sein d''une équipe dynamique'],
    'active'
)
ON CONFLICT (id) DO NOTHING;
