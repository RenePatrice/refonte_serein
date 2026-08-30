import { AccessRoleCode } from '../types/hr.types';

// Système de rôles additif (module RH) : un compte peut cumuler plusieurs
// rôles via user_roles, indépendamment de son users.role historique
// (super_admin/editeur) que le reste du dashboard continue d'utiliser via
// lib/permissions.ts. Ne remplace rien, s'ajoute par-dessus.

export function hasAccessRole(userRoles: AccessRoleCode[], code: AccessRoleCode): boolean {
  return userRoles.includes(code);
}

export function canAccessHrModule(userRoles: AccessRoleCode[]): boolean {
  return hasAccessRole(userRoles, 'super_admin') || hasAccessRole(userRoles, 'rh') || hasAccessRole(userRoles, 'responsable_projet');
}

// Fiches employés (CRUD complet) : réservé à RH/Super Admin, qui sont les
// seuls à avoir une policy RLS "FOR ALL" sur employees. Un responsable_projet
// n'a qu'un accès en lecture à son équipe (voir canViewOwnTeam) -- lui donner
// le même écran que RH exposerait des boutons créer/modifier/supprimer qui
// échoueraient silencieusement contre RLS.
export function canManageEmployees(userRoles: AccessRoleCode[]): boolean {
  return hasAccessRole(userRoles, 'super_admin') || hasAccessRole(userRoles, 'rh');
}

export function canViewOwnTeam(userRoles: AccessRoleCode[]): boolean {
  return hasAccessRole(userRoles, 'responsable_projet');
}

export const HR_ROLE_LABELS: Record<AccessRoleCode, string> = {
  super_admin: 'Super Administrateur',
  editeur: 'Éditeur',
  rh: 'Ressources Humaines',
  responsable_projet: 'Responsable de Projet',
  employe: 'Employé',
};
