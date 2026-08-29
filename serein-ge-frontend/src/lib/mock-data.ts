import { Department, TeamMember, Realisation, Article, Partner, Product, JobOffer } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    nom: 'Topographie & Géodésie',
    slug: 'topographie-geodesie',
    description: 'Levés géodésiques de haute précision, polygonation, nivellement de haute précision, auscultation d\'ouvrages d\'art et topographie minière.',
    icone: 'Crosshair',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    ordre: 1,
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    nom: 'Géomatique & SIG',
    slug: 'geomatique-sig',
    description: 'Cartographie thématique, modélisation 3D du territoire, bases de données spatiales, télédétection spatiale et cadastres numériques.',
    icone: 'Layers',
    image_url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    ordre: 2,
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    nom: 'Ingénierie & BTP / VRD',
    slug: 'ingenierie-btp-vrd',
    description: 'Études d\'infrastructures routières, assainissement, aménagements hydro-agricoles, suivi et contrôle géométrique de chantiers.',
    icone: 'Building2',
    image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    ordre: 3,
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    nom: 'Distribution de Matériel & SAV',
    slug: 'distribution-materiel',
    description: 'Distributeur officiel agréé CHCNAV, Toknav et FOIF au Burkina Faso. Calibration, garantie certifiée et formation continue.',
    icone: 'Cpu',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    ordre: 4,
  },
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 't1111111-1111-1111-1111-111111111111',
    nom: 'Ing. Patrice COMPAORÉ',
    poste: 'Directeur Général & Ingénieur Géomètre',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    bio: 'Plus de 18 ans d\'expérience en ingénierie géodésique, aménagement territorial et pilotage de grands projets d\'infrastructures en Afrique de l\'Ouest.',
    photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    email: 'direction@serein-ge.bf',
    telephone: '+226 25 30 00 01',
    linkedin_url: 'https://linkedin.com',
    ordre: 1,
    is_active: true,
  },
  {
    id: 't2222222-2222-2222-2222-222222222222',
    nom: 'Mme Aminata OUÉDRAOGO',
    poste: 'Responsable Département SIG & Télédétection',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    bio: 'Spécialiste en géomatique appliquée, analyse spatiale avancée et conception de systèmes d\'information géographiques décisionnels.',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    email: 'sig@serein-ge.bf',
    telephone: '+226 25 30 00 02',
    linkedin_url: 'https://linkedin.com',
    ordre: 2,
    is_active: true,
  },
  {
    id: 't3333333-3333-3333-3333-333333333333',
    nom: 'Ing. Moussa TRAORÉ',
    poste: 'Chef de Projets BTP & Auscultation d\'Ouvrages',
    department_id: 'd3333333-3333-3333-3333-333333333333',
    bio: 'Expert en calculs de cubatures, modélisation numérique de terrain et contrôle géométrique de chantiers autoroutiers et barrages.',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    email: 'travaux@serein-ge.bf',
    telephone: '+226 25 30 00 03',
    linkedin_url: 'https://linkedin.com',
    ordre: 3,
    is_active: true,
  },
  {
    id: 't4444444-4444-4444-4444-444444444444',
    nom: 'Yacouba SANOU',
    poste: 'Responsable Ventes & Support Technique',
    department_id: 'd4444444-4444-4444-4444-444444444444',
    bio: 'Technicien supérieur certifié CHCNAV & Toknav, spécialiste de la calibration, maintenance et formation des utilisateurs.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    email: 'commercial@serein-ge.bf',
    telephone: '+226 25 30 00 04',
    linkedin_url: 'https://linkedin.com',
    ordre: 4,
    is_active: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    nom: 'CHCNAV i90 GNSS RTK IMU',
    slug: 'chcnav-i90-gnss-rtk-imu',
    marque: 'CHCNAV',
    categorie: 'Récepteurs GNSS RTK',
    description_courte: 'Récepteur GNSS multi-constellations haut de gamme avec centrale inertielle IMU sans étalonnage et modem 4G/UHF intégré.',
    description_complete: 'Le CHCNAV i90 intègre les dernières technologies GNSS de pointe avec 624 canaux de suivi toutes constellations (GPS, GLONASS, Galileo, BeiDou, QZSS, SBAS). Son IMU haute précision compense l\'inclinaison de la canne jusqu\'à 60° avec une précision centimétrique instantanée sans nécessiter d\'étalonnage préalable. Idéal pour les levés en milieu encombré ou difficile.',
    prix_fcfa: 4250000,
    prix_promo_fcfa: 3950000,
    stock: 6,
    stock_alerte: 2,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ],
    specs_techniques: {
      'Canaux': '624 canaux multi-constellations',
      'Précision RTK Hz': '8 mm + 1 ppm',
      'Précision RTK V': '15 mm + 1 ppm',
      'Compensation IMU': 'Jusqu\'à 60° (précision < 2 cm)',
      'Radio UHF': 'Émetteur/Récepteur 1W / 2W',
      'Modem': '4G LTE multi-opérateurs',
      'Autonomie': '14 heures en RTK Rover',
      'Indice': 'IP68 (résiste à l\'eau et poussière)'
    },
    en_vedette: true,
    is_active: true,
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    nom: 'Toknav T20 Pro GNSS avec Caméra AR & IMU',
    slug: 'toknav-t20-pro-gnss-ar-imu',
    marque: 'Toknav',
    categorie: 'Récepteurs GNSS RTK',
    description_courte: 'Récepteur GNSS révolutionnaire avec double caméra pour implantation visuelle en réalité augmentée et levé photogrammétrique.',
    description_complete: 'Le Toknav T20 Pro redéfinit le travail de l\'opérateur terrain grâce à son module de caméra haute définition intégrée permettant l\'implantation visuelle en réalité augmentée (AR Stakeout). Plus besoin de chercher à tâtons : la cible s\'affiche directement superposée au terrain réel sur l\'écran.',
    prix_fcfa: 4850000,
    prix_promo_fcfa: null,
    stock: 4,
    stock_alerte: 1,
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    ],
    specs_techniques: {
      'Canaux': '1408 canaux toutes constellations',
      'Technologie': 'Visual AR Stakeout (Implantation caméra)',
      'Compensation IMU': '60° instantané 300Hz',
      'Précision RTK': '8 mm + 0.5 ppm RMS',
      'Poids': '790 g avec batterie',
      'Batterie': 'Interne 6800 mAh charge rapide USB-C',
      'Connectivité': 'Bluetooth 5.0, Wi-Fi, NFC, 4G, Radio UHF'
    },
    en_vedette: true,
    is_active: true,
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    nom: 'CHCNAV i73+ GNSS Ultra-Compact',
    slug: 'chcnav-i73-plus-gnss-ultra-compact',
    marque: 'CHCNAV',
    categorie: 'Récepteurs GNSS RTK',
    description_courte: 'Le récepteur GNSS RTK le plus léger et compact de sa catégorie (730g) avec IMU 60° et autonomie prolongée.',
    description_complete: 'Le récepteur de poche CHCNAV i73+ combine légèreté absolue et performance extrême. Avec son poids plume de seulement 730g, il réduit considérablement la fatigue de l\'arpenteur durant les longues journées de levé topo. Compatible réseau CORS / Ntrip 4G via le carnet.',
    prix_fcfa: 2850000,
    prix_promo_fcfa: 2650000,
    stock: 8,
    stock_alerte: 2,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    ],
    specs_techniques: {
      'Canaux': '624 canaux',
      'Poids': '730 g',
      'Compensation IMU': 'Oui, sans interférence magnétique',
      'Précision Ntrip': '8 mm + 1 ppm',
      'Étanchéité': 'IP67'
    },
    en_vedette: false,
    is_active: true,
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    nom: 'Station Totale FOIF RTS352 Reflectorless 1000m',
    slug: 'station-totale-foif-rts352-1000m',
    marque: 'FOIF',
    categorie: 'Stations Totales',
    description_courte: 'Station totale de haute précision angulaire 2" avec mesure sans prisme jusqu\'à 1000 mètres et double écran couleur.',
    description_complete: 'La station totale FOIF RTS352 est l\'équipement de référence pour les chantiers de construction, le génie civil et les levés cadastraux de haute précision. Elle dispose d\'un télémètre laser puissant autorisant des portées sans prisme jusqu\'à 1000m et 5000m avec prisme simple.',
    prix_fcfa: 3750000,
    prix_promo_fcfa: null,
    stock: 3,
    stock_alerte: 1,
    images: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80'
    ],
    specs_techniques: {
      'Précision angulaire': '2 secondes d\'arc',
      'Portée sans prisme': '1000 m',
      'Portée avec prisme': '5000 m',
      'Écran': 'Double écran LCD tactile rétroéclairé',
      'Mémoire': 'Carte SD + USB',
      'Plomb': 'Laser réglable'
    },
    en_vedette: true,
    is_active: true,
  },
  {
    id: 'p5555555-5555-5555-5555-555555555555',
    nom: 'Drone DJI Matrice 350 RTK avec Zenmuse L2 LiDAR',
    slug: 'dji-matrice-350-rtk-zenmuse-l2-lidar',
    marque: 'DJI Enterprise',
    categorie: 'Drones & LiDAR',
    description_courte: 'Solution de cartographie aérienne et scanner LiDAR 3D de précision centimétrique pour topographie grande échelle.',
    description_complete: 'Le combo DJI Matrice 350 RTK couplé au capteur LiDAR Zenmuse L2 permet de générer des modèles numériques de terrain (MNT) ultra-denses même sous couvert végétal dense. Idéal pour les études de corridors routiers, les carrières, les mines et les zones inondables.',
    prix_fcfa: 18500000,
    prix_promo_fcfa: 17500000,
    stock: 2,
    stock_alerte: 1,
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'
    ],
    specs_techniques: {
      'Autonomie': 'Jusqu\'à 55 minutes de vol',
      'Portée transmission': '20 km O3 Enterprise',
      'Portée LiDAR': '450 m (réflectivité 80%)',
      'Taux d\'impulsion': '240 000 pts/s',
      'Caméra RGB': 'Capteur 4/3 CMOS 20 MP pour colorisation 3D'
    },
    en_vedette: true,
    is_active: true,
  },
  {
    id: 'p6666666-6666-6666-6666-666666666666',
    nom: 'Carnet de Terrain Robuste CHCNAV HCE600 Android',
    slug: 'carnet-de-terrain-chcnav-hce600-android',
    marque: 'CHCNAV',
    categorie: 'Carnets & Logiciels',
    description_courte: 'Contrôleur de terrain durci 5.5" sous Android 10 avec clavier alphanumérique physique et logiciel LandStar 8 inclus.',
    description_complete: 'Le carnet HCE600 est conçu pour résister aux environnements les plus hostiles de chantier. Écran très lumineux lisible en plein soleil sahélien, batterie amovible 6240 mAh pour 14h de travail ininterrompu.',
    prix_fcfa: 950000,
    prix_promo_fcfa: 890000,
    stock: 12,
    stock_alerte: 3,
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ],
    specs_techniques: {
      'Système': 'Android 10 avec Google Play Store',
      'Processeur': 'Octa-core 2.0 GHz',
      'Mémoire': '3 Go RAM + 32 Go Flash',
      'Écran': '5.5 pouces IPS tactile compatible gants',
      'Étanchéité': 'IP67 et résistance aux chutes de 1.5m',
      'Logiciel': 'Licence LandStar 8 complète incluse'
    },
    en_vedette: false,
    is_active: true,
  }
];

export const INITIAL_REALISATIONS: Realisation[] = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    titre: 'Levé Topographique & Modélisation 3D pour le Corridor Routier Ouaga-Kaya (105 km)',
    slug: 'leve-topo-corridor-ouaga-kaya',
    client: 'Ministère des Infrastructures du Burkina Faso',
    date_realisation: '2025-11-15',
    lieu: 'Région du Centre-Nord, Burkina Faso',
    categorie: 'Topographie',
    description: 'Réalisation des études topographiques détaillées d\'axe routier, polygonation de précision rattachée au système géodésique national BF-WGS84, levé de profils en long et en travers et calcul des cubatures de terrassement.',
    details: {
      'Longueur': '105 km',
      'Équipe': '4 brigades topographiques mobilisées',
      'Instruments': '4 récepteurs CHCNAV i90 + 2 stations totales FOIF',
      'Livrables': 'Plans au 1/1000, MNT, profils en long/travers, rapport géodésique'
    },
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'
    ],
    a_la_une: true,
    is_published: true,
  },
  {
    id: 'r2222222-2222-2222-2222-222222222222',
    titre: 'Numérisation Cadastrale & Mise en Place du SIG Urbain de Bobo-Dioulasso',
    slug: 'sig-urbain-bobo-dioulasso',
    client: 'Commune Urbaine de Bobo-Dioulasso / Projet Banque Mondiale',
    date_realisation: '2025-08-20',
    lieu: 'Bobo-Dioulasso, Burkina Faso',
    categorie: 'Géomatique',
    description: 'Acquisition d\'orthophotographies par drone haute résolution, vectorisation des parcelles fiscales et intégration dans un géoportail WebSIG PostgreSQL / PostGIS avec consultation sécurisée.',
    details: {
      'Superficie': '4 500 hectares couverts',
      'Parcelles': 'Plus de 32 000 parcelles géoréférencées',
      'Technologie': 'Drone LiDAR, PostGIS, QGIS Server, Geoserver'
    },
    images: [
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80'
    ],
    a_la_une: true,
    is_published: true,
  },
  {
    id: 'r3333333-3333-3333-3333-333333333333',
    titre: 'Auscultation Géométrique & Suivi de Stabilité du Barrage Hydro-Agricole de Bagré',
    slug: 'auscultation-barrage-bagre',
    client: 'Société d\'Exploitation de Bagré (Bagrepôle)',
    date_realisation: '2026-02-10',
    lieu: 'Bagré, Région du Centre-Est',
    categorie: 'Hydraulique',
    description: 'Surveillance géodésique de haute précision pour la détection millimétrique des déformations des ouvrages en béton et de la digue en terre par micro-triangulation et nivellement de très haute précision.',
    details: {
      'Précision': 'Sous-millimétrique',
      'Points de contrôle': '120 repères de nivellement de précision',
      'Fréquence': 'Campagne biannuelle de surveillance'
    },
    images: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'
    ],
    a_la_une: true,
    is_published: true,
  }
];

export const INITIAL_NEWS: Article[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    titre: 'SEREIN-GE devient distributeur agréé Toknav Technology au Burkina Faso',
    slug: 'serein-ge-distributeur-agreed-toknav-burkina',
    extrait: 'Une nouvelle gamme de récepteurs GNSS à réalité augmentée et caméras d\'implantation visuelle débarque à Ouagadougou.',
    contenu: `Nous sommes particulièrement fiers d'annoncer la signature de notre partenariat officiel de distribution avec le constructeur international Toknav Technology.

Les géomètres, topographes et bureaux d'études du Burkina Faso et de la sous-région ouest-africaine bénéficient désormais d'un accès privilégié aux récepteurs nouvelle génération Toknav T20 Pro et T10.

Ce partenariat garantit à nos clients :
- Des équipements certifiés d'origine avec 2 ans de garantie constructeur.
- Un stock disponible immédiatement dans notre showroom à Ouagadougou.
- Un service après-vente (SAV), calibration et réparation sur place.
- Des sessions de formation pratique personnalisées offertes à chaque acquisition.`,
    image_couverture: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    categorie: 'Partenariat & Innovation',
    statut: 'publie',
    date_publication: '2026-08-20',
    vues: 342,
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    titre: 'Comment le GNSS avec centrale inertielle IMU optimise les cadences de levé sur le terrain',
    slug: 'impact-imu-gnss-sur-cadences-terrain',
    extrait: 'Découvrez comment supprimer l\'obligation de verticalité de la canne permet de gagner plus de 30% de temps en mission topographique.',
    contenu: `Pendant des décennies, l'arpenteur devait impérativement caler sa bulle de niveau à chaque point mesuré avant d'enregistrer la coordonnée. 

Avec l'avènement des centrales inertielles IMU de 5e génération (présentes sur le CHCNAV i90 et Toknav T20 Pro), cette contrainte appartient désormais au passé.

Avantages majeurs :
1. Prise de point instantanée en marchant.
2. Accès à des points inaccessibles (angles de bâtiments, sous les véhicules, bordures de fossés dangereux).
3. Insensibilité totale aux perturbations magnétiques des lignes haute tension et des armatures métalliques de béton armé.`,
    image_couverture: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    categorie: 'Expertise Technique',
    statut: 'publie',
    date_publication: '2026-08-12',
    vues: 518,
  }
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'par1',
    nom: 'CHCNAV (Huace Navigation)',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    site_web: 'https://chcnav.com',
    categorie: 'Constructeur',
    description: 'Leader mondial en solutions GNSS de haute précision et LiDAR aéroporté.',
    ordre: 1,
    is_active: true,
  },
  {
    id: 'par2',
    nom: 'Toknav Technology',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    site_web: 'https://toknav.com',
    categorie: 'Constructeur',
    description: 'Pionnier des récepteurs GNSS compacts à réalité augmentée visuelle.',
    ordre: 2,
    is_active: true,
  },
  {
    id: 'par3',
    nom: 'FOIF Precision Instruments',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    site_web: 'https://foif.com',
    categorie: 'Constructeur',
    description: 'Fabricant de stations totales de haute précision et théodolites.',
    ordre: 3,
    is_active: true,
  },
  {
    id: 'par4',
    nom: 'DJI Enterprise',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    site_web: 'https://enterprise.dji.com',
    categorie: 'Constructeur',
    description: 'Vecteurs aériens et capteurs photogrammétriques et LiDAR professionnels.',
    ordre: 4,
    is_active: true,
  }
];

export const INITIAL_JOB_OFFERS: JobOffer[] = [
  {
    id: 'j1111111-1111-1111-1111-111111111111',
    titre: 'Ingénieur Géomètre-Topographe Senior (H/F)',
    slug: 'ingenieur-geometre-topographe-senior',
    departement: 'Topographie & Géodésie',
    type_contrat: 'CDI',
    lieu: 'Ouagadougou avec déplacements chantiers',
    salaire_indicatif: 'Selon profil et expérience (Grille SEREIN-GE)',
    date_limite: '2026-10-31',
    description: 'Dans le cadre de l\'extension de nos activités d\'infrastructures et de contrôle de grands ouvrages, SEREIN-GE recrute un(e) Ingénieur(e) Géomètre chevronné(e) pour diriger les brigades d\'intervention et superviser les calculs géodésiques.',
    missions: [
      'Planification et encadrement des brigades topographiques de terrain',
      'Calculs géodésiques, compensations de réseaux et calculs de cubatures sur AutoCAD / Covadis / Mensura',
      'Contrôle qualité des levés et rédaction des rapports techniques',
      'Interface avec les chefs de projet clients et les bureaux de contrôle'
    ],
    profil_recherche: [
      'Diplôme d\'Ingénieur Géomètre (ESGT, EAMAC, 2iE ou équivalent)',
      'Minimum 5 ans d\'expérience avérée dans des projets routiers, miniers ou d\'aménagements hydro-agricoles',
      'Maîtrise parfaite des récepteurs GNSS RTK, stations totales et logiciels de DAO/SIG',
      'Permis de conduire B et aptitude aux missions sur le terrain'
    ],
    avantages: [
      'Véhicule de service pour les missions terrain',
      'Assurance santé complémentaire prise en charge à 80%',
      'Formations continues certifiantes sur les technologies LiDAR et Drones'
    ],
    statut: 'active',
  },
  {
    id: 'j2222222-2222-2222-2222-222222222222',
    titre: 'Technico-Commercial Vente Matériel Topographique & Drones (H/F)',
    slug: 'technico-commercial-materiel-topo-drones',
    departement: 'Distribution de Matériel & SAV',
    type_contrat: 'CDI',
    lieu: 'Ouagadougou',
    salaire_indicatif: 'Fixe motivant + Commissions sur ventes',
    date_limite: '2026-09-30',
    description: 'Pour accompagner la forte croissance de notre département matériel, nous recherchons un(e) Technico-Commercial(e) passionné(e) par les nouvelles technologies de mesure et de positionnement.',
    missions: [
      'Développement du portefeuille clients (entreprises BTP, bureaux d\'études, géomètres, mines)',
      'Démonstrations terrain des récepteurs CHCNAV, Toknav et drones DJI Enterprise',
      'Élaboration des devis commerciaux et suivi des appels d\'offres de fournitures',
      'Animation du showroom et participation aux salons professionnels'
    ],
    profil_recherche: [
      'Formation BAC+2/3 en Topographie, Géomatique ou Génie Civil combinée à une fibre commerciale affirmée',
      'Aisance relationnelle, négociation et sens du service client',
      'Excellente maîtrise du français et pratique de l\'anglais technique'
    ],
    avantages: [
      'Ordinateur et smartphone de fonction',
      'Prime mensuelle déplafonnée sur objectifs',
      'Cadre de travail stimulant au sein d\'une équipe dynamique'
    ],
    statut: 'active',
  }
];
