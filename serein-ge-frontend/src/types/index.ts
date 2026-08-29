// ==============================================================================
// SEREIN-GE : TYPESCRIPT DEFINITIONS
// Cahier des charges v2.2
// ==============================================================================

export type Department = {
  id: string;
  nom: string;
  slug: string;
  description: string;
  icone: string;
  image_url?: string;
  ordre: number;
};

export type TeamMember = {
  id: string;
  nom: string;
  poste: string;
  department_id?: string;
  department?: Department;
  bio?: string;
  photo_url?: string;
  email?: string;
  telephone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  ordre: number;
  is_active: boolean;
};

export type Realisation = {
  id: string;
  titre: string;
  slug: string;
  client: string;
  date_realisation?: string;
  lieu: string;
  categorie: string; // 'Topographie' | 'Géomatique' | 'BTP / VRD' | 'Hydraulique' | 'Mines & Carrières'
  description: string;
  details?: Record<string, string>;
  images: string[];
  a_la_une: boolean;
  is_published: boolean;
  created_at?: string;
};

export type Article = {
  id: string;
  titre: string;
  slug: string;
  extrait: string;
  contenu: string;
  image_couverture?: string;
  categorie: string;
  statut: 'brouillon' | 'publie' | 'planifie';
  date_publication?: string;
  vues?: number;
};

export type Partner = {
  id: string;
  nom: string;
  logo_url: string;
  site_web?: string;
  categorie: string;
  description?: string;
  ordre: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  nom: string;
  slug: string;
  marque: 'CHCNAV' | 'Toknav' | 'FOIF' | 'DJI Enterprise' | 'Garmin' | string;
  categorie: string;
  description_courte: string;
  description_complete: string;
  prix_fcfa: number;
  prix_promo_fcfa?: number | null;
  stock: number;
  stock_alerte: number;
  images: string[];
  specs_techniques: Record<string, string>;
  brochure_url?: string;
  en_vedette: boolean;
  is_active: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  reference: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  client_entreprise?: string;
  adresse_livraison: string;
  ville: string;
  pays: string;
  notes_client?: string;
  total_fcfa: number;
  frais_livraison_fcfa: number;
  statut: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  mode_paiement: 'whatsapp' | 'cinetpay' | 'stripe' | 'virement' | 'especes_retrait';
  cinetpay_token?: string;
  stripe_session_id?: string;
  paid_at?: string;
  created_at?: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string;
  product_nom: string;
  product_marque?: string;
  quantite: number;
  prix_unitaire_fcfa: number;
  total_ligne_fcfa: number;
};

export type PaymentLog = {
  id: string;
  order_id: string;
  provider: 'cinetpay' | 'stripe' | 'direct';
  transaction_id?: string;
  montant_fcfa: number;
  statut: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PENDING';
  operateur?: string;
  callback_raw?: any;
  created_at?: string;
};

export type JobOffer = {
  id: string;
  titre: string;
  slug: string;
  departement: string;
  type_contrat: 'CDI' | 'CDD' | 'Stage' | 'Prestation / Consultant';
  lieu: string;
  salaire_indicatif?: string;
  date_limite?: string;
  description: string;
  missions: string[];
  profil_recherche: string[];
  avantages: string[];
  statut: 'active' | 'archivee' | 'brouillon';
  created_at?: string;
};

export type Application = {
  id: string;
  job_offer_id?: string;
  type_candidature: 'sur_offre' | 'spontanee';
  poste_souhaite?: string;
  civilite?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse_ville?: string;
  niveau_etude?: string;
  annees_experience?: number;
  cv_url: string;
  lettre_motivation_url?: string;
  message?: string;
  statut: 'nouveau' | 'en_revue' | 'entretien' | 'retenu' | 'rejete';
  notes_recruteur?: string;
  created_at?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  nom_complet: string;
  role: 'super_admin' | 'editeur';
  avatar_url?: string;
  telephone?: string;
  is_active: boolean;
  created_at?: string;
};
