// ==============================================================================
// SEREIN-GE ADMIN : TYPES DEFINITIONS
// ==============================================================================

export type Role = 'super_admin' | 'editeur';

export type AdminUser = {
  id: string;
  email: string;
  nom_complet: string;
  role: Role;
  avatar_url?: string;
  telephone?: string;
  is_active: boolean;
  created_at: string;
};

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
  department_id?: string | null;
  department_nom?: string;
  bio?: string;
  photo_url?: string;
  email?: string;
  telephone?: string;
  linkedin_url?: string;
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
  categorie: string;
  description: string;
  images: string[];
  a_la_une: boolean;
  is_published: boolean;
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
  vues: number;
};

export type Partner = {
  id: string;
  nom: string;
  logo_url: string;
  site_web?: string;
  categorie: string;
  ordre: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  nom: string;
  slug: string;
  marque: string;
  categorie: string;
  description_courte: string;
  description_complete: string;
  prix_fcfa: number;
  prix_promo_fcfa?: number | null;
  stock: number;
  stock_alerte: number;
  images: string[];
  specs_techniques: Record<string, string>;
  en_vedette: boolean;
  is_active: boolean;
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
  total_fcfa: number;
  statut: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  mode_paiement: 'whatsapp' | 'cinetpay' | 'stripe' | 'virement' | 'especes_retrait';
  created_at: string;
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
  order_ref: string;
  provider: 'cinetpay' | 'stripe' | 'direct';
  transaction_id: string;
  montant_fcfa: number;
  statut: 'SUCCESS' | 'FAILED' | 'PENDING';
  operateur: string;
  callback_raw?: any;
  created_at: string;
};

export type JobOffer = {
  id: string;
  titre: string;
  slug: string;
  departement: string;
  type_contrat: string;
  lieu: string;
  salaire_indicatif?: string;
  date_limite?: string;
  description: string;
  statut: 'active' | 'archivee' | 'brouillon';
  created_at: string;
};

export type ChatbotSettings = {
  id: string;
  is_enabled: boolean;
  welcome_message: string;
  system_prompt: string;
  updated_at?: string;
};

export type Application = {
  id: string;
  job_offer_id?: string;
  poste_souhaite: string;
  type_candidature: 'sur_offre' | 'spontanee';
  civilite: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  niveau_etude?: string;
  annees_experience: number;
  cv_url: string;
  message?: string;
  statut: 'nouveau' | 'en_revue' | 'entretien' | 'retenu' | 'rejete';
  notes_recruteur?: string;
  created_at: string;
};
