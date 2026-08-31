// ==============================================================================
// SEREIN-GE : MODULE RH & PROJETS — TYPES MÉTIER
// Miroir du schéma additif supabase/hr_schema.sql. N'affecte jamais AdminUser
// ni les types définis dans types/index.ts (users.role reste inchangé).
// ==============================================================================

export type AccessRoleCode = 'super_admin' | 'editeur' | 'rh' | 'responsable_projet' | 'employe';
export type RoleScope = 'site' | 'rh' | 'general';

export interface Role {
  id: string;
  code: AccessRoleCode;
  label: string;
  scope: RoleScope;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
}

export type EmployeeType =
  | 'directeur' | 'cadre' | 'employe' | 'stagiaire'
  | 'prestataire' | 'consultant' | 'chauffeur';

export type EmployeeStatus = 'actif' | 'en_conge' | 'suspendu' | 'sorti';
export type MaritalStatus = 'celibataire' | 'marie' | 'divorce' | 'veuf';

export interface Employee {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  birth_date: string | null;
  birth_place: string | null;
  nationality: string | null;
  marital_status: MaritalStatus | null;
  national_id_number: string | null;
  national_id_expiry: string | null;
  driving_license_number: string | null;
  driving_license_expiry: string | null;
  address: string | null;
  phone: string | null;
  personal_email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relation: string | null;
  emergency_contact_phone: string | null;
  job_title: string;
  employee_type: EmployeeType;
  department: string | null;
  manager_id: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeDiploma {
  id: string;
  employee_id: string;
  title: string;
  institution: string | null;
  year: number | null;
}

export type LanguageLevel = 'debutant' | 'intermediaire' | 'courant' | 'natif';

export interface EmployeeLanguage {
  id: string;
  employee_id: string;
  language: string;
  level: LanguageLevel | null;
}

export type ContractType = 'CDI' | 'CDD' | 'stage' | 'prestation' | 'consultation' | 'freelance';
export type ContractStatus = 'en_cours' | 'renouvele' | 'resilie' | 'expire';

export interface Contract {
  id: string;
  employee_id: string;
  contract_type: ContractType;
  start_date: string;
  end_date: string | null;
  base_salary: number | null;
  currency: string;
  status: ContractStatus;
  end_reason: string | null;
  document_url: string | null;
  created_at: string;
}

export type ProjectStatus = 'planifie' | 'en_cours' | 'termine' | 'suspendu';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  responsible_id: string;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  employee_id: string;
  role_in_project: string | null;
  joined_at: string;
}

export type MilestoneStatus = 'a_venir' | 'en_cours' | 'termine' | 'en_retard';

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  due_date: string;
  status: MilestoneStatus;
}

export interface ProjectReport {
  id: string;
  project_id: string;
  milestone_id: string | null;
  author_id: string;
  week_start: string;
  week_end: string;
  progress_percent: number | null;
  achievements: string | null;
  blockers: string | null;
  next_steps: string | null;
  created_at: string;
}

export type NotificationType = 'contrat_expire' | 'piece_identite_expire' | 'permis_expire' | 'rapport_manquant';

export interface HrNotification {
  id: string;
  target_role: 'rh' | 'super_admin';
  type: NotificationType;
  message: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export type ExpirationType = 'contrat' | 'piece_identite' | 'permis_conduire';

export interface UpcomingExpiration {
  employee_id: string;
  first_name: string;
  last_name: string;
  expiration_type: ExpirationType;
  expiration_date: string;
  reference_id: string;
}
