import { Role } from '../types';

// Un compte "éditeur" n'a accès qu'à ce sous-ensemble de fonctionnalités.
// Le "super_admin" a accès à tout le dashboard sans restriction.
export const EDITEUR_ALLOWED_PATHS = [
  '/actualites',
  '/commandes',
  '/chatbot',
  '/equipe',
  '/realisations',
  '/offres',
  '/produits',
] as const;

export function isPathAllowed(role: Role, path: string): boolean {
  if (role === 'super_admin') return true;
  return (EDITEUR_ALLOWED_PATHS as readonly string[]).includes(path);
}

// Route de repli pour un éditeur qui atterrit sur une page qui ne lui est pas
// autorisée (ex: le tableau de bord, réservé au super admin).
export const EDITEUR_DEFAULT_PATH = '/actualites';
