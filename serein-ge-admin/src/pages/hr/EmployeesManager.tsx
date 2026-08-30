import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertTriangle, RefreshCw, X, Save, GraduationCap, Languages, FileSignature } from 'lucide-react';
import DataTable, { Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Employee, EmployeeDiploma, EmployeeLanguage, Contract,
  EmployeeType, EmployeeStatus, MaritalStatus, ContractType, ContractStatus,
} from '../../types/hr.types';

const EMPLOYEE_TYPES: { value: EmployeeType; label: string }[] = [
  { value: 'directeur', label: 'Directeur' },
  { value: 'cadre', label: 'Cadre' },
  { value: 'employe', label: 'Employé' },
  { value: 'stagiaire', label: 'Stagiaire' },
  { value: 'prestataire', label: 'Prestataire' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'chauffeur', label: 'Chauffeur' },
];

const EMPLOYEE_STATUSES: { value: EmployeeStatus; label: string }[] = [
  { value: 'actif', label: 'Actif' },
  { value: 'en_conge', label: 'En congé' },
  { value: 'suspendu', label: 'Suspendu' },
  { value: 'sorti', label: 'Sorti' },
];

const MARITAL_STATUSES: { value: MaritalStatus; label: string }[] = [
  { value: 'celibataire', label: 'Célibataire' },
  { value: 'marie', label: 'Marié(e)' },
  { value: 'divorce', label: 'Divorcé(e)' },
  { value: 'veuf', label: 'Veuf/Veuve' },
];

const CONTRACT_TYPES: ContractType[] = ['CDI', 'CDD', 'stage', 'prestation', 'consultation', 'freelance'];
const CONTRACT_STATUSES: ContractStatus[] = ['en_cours', 'renouvele', 'resilie', 'expire'];

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  photo_url: '',
  birth_date: '',
  birth_place: '',
  nationality: '',
  marital_status: '' as MaritalStatus | '',
  national_id_number: '',
  national_id_expiry: '',
  driving_license_number: '',
  driving_license_expiry: '',
  address: '',
  phone: '',
  personal_email: '',
  emergency_contact_name: '',
  emergency_contact_relation: '',
  emergency_contact_phone: '',
  job_title: '',
  employee_type: 'employe' as EmployeeType,
  department: '',
  status: 'actif' as EmployeeStatus,
};

const EMPTY_CONTRACT_FORM = {
  contract_type: 'CDI' as ContractType,
  start_date: '',
  end_date: '',
  base_salary: '',
  currency: 'XOF',
  status: 'en_cours' as ContractStatus,
};

export default function EmployeesManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [diplomas, setDiplomas] = useState<Partial<EmployeeDiploma>[]>([]);
  const [languages, setLanguages] = useState<Partial<EmployeeLanguage>[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractForm, setContractForm] = useState(EMPTY_CONTRACT_FORM);
  const [saving, setSaving] = useState(false);
  const [savingContract, setSavingContract] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadEmployees = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setEmployees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('employees').select('*').order('last_name', { ascending: true });

    if (error) {
      setLoadError('Impossible de charger les employés : ' + error.message);
    } else {
      setEmployees((data || []) as Employee[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData(EMPTY_FORM);
    setDiplomas([]);
    setLanguages([]);
    setContracts([]);
    setContractForm(EMPTY_CONTRACT_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      photo_url: emp.photo_url || '',
      birth_date: emp.birth_date || '',
      birth_place: emp.birth_place || '',
      nationality: emp.nationality || '',
      marital_status: emp.marital_status || '',
      national_id_number: emp.national_id_number || '',
      national_id_expiry: emp.national_id_expiry || '',
      driving_license_number: emp.driving_license_number || '',
      driving_license_expiry: emp.driving_license_expiry || '',
      address: emp.address || '',
      phone: emp.phone || '',
      personal_email: emp.personal_email || '',
      emergency_contact_name: emp.emergency_contact_name || '',
      emergency_contact_relation: emp.emergency_contact_relation || '',
      emergency_contact_phone: emp.emergency_contact_phone || '',
      job_title: emp.job_title,
      employee_type: emp.employee_type,
      department: emp.department || '',
      status: emp.status,
    });
    setContractForm(EMPTY_CONTRACT_FORM);
    setFormError(null);
    setIsModalOpen(true);

    if (isSupabaseConfigured && supabase) {
      const [{ data: dip }, { data: lang }, { data: ctr }] = await Promise.all([
        supabase.from('employee_diplomas').select('*').eq('employee_id', emp.id),
        supabase.from('employee_languages').select('*').eq('employee_id', emp.id),
        supabase.from('contracts').select('*').eq('employee_id', emp.id).order('start_date', { ascending: false }),
      ]);
      setDiplomas((dip || []) as EmployeeDiploma[]);
      setLanguages((lang || []) as EmployeeLanguage[]);
      setContracts((ctr || []) as Contract[]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cette fiche employé ? Ses contrats, diplômes et langues seront également supprimés.')) return;
    if (!isSupabaseConfigured || !supabase) {
      setEmployees(employees.filter((e) => e.id !== id));
      return;
    }
    setBusyId(id);
    const { error } = await supabase.from('employees').delete().eq('id', id);
    setBusyId(null);
    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setEmployees(employees.filter((e) => e.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.job_title) return;

    if (!isSupabaseConfigured || !supabase) {
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      photo_url: formData.photo_url || null,
      birth_date: formData.birth_date || null,
      birth_place: formData.birth_place || null,
      nationality: formData.nationality || null,
      marital_status: formData.marital_status || null,
      national_id_number: formData.national_id_number || null,
      national_id_expiry: formData.national_id_expiry || null,
      driving_license_number: formData.driving_license_number || null,
      driving_license_expiry: formData.driving_license_expiry || null,
      address: formData.address || null,
      phone: formData.phone || null,
      personal_email: formData.personal_email || null,
      emergency_contact_name: formData.emergency_contact_name || null,
      emergency_contact_relation: formData.emergency_contact_relation || null,
      emergency_contact_phone: formData.emergency_contact_phone || null,
      job_title: formData.job_title,
      employee_type: formData.employee_type,
      department: formData.department || null,
      status: formData.status,
    };

    let employeeId = editingEmployee?.id;
    let savedRow: Employee | null = null;

    if (editingEmployee) {
      const { data, error } = await supabase.from('employees').update(payload).eq('id', editingEmployee.id).select().single();
      if (error || !data) {
        setSaving(false);
        setFormError(error?.message || 'Échec de la mise à jour.');
        return;
      }
      savedRow = data as Employee;
    } else {
      const { data, error } = await supabase.from('employees').insert(payload).select().single();
      if (error || !data) {
        setSaving(false);
        setFormError(error?.message || 'Échec de la création.');
        return;
      }
      savedRow = data as Employee;
      employeeId = savedRow.id;
    }

    // Diplômes & langues : remplacement complet (liste courte, simple et sûr)
    if (employeeId) {
      await supabase.from('employee_diplomas').delete().eq('employee_id', employeeId);
      const validDiplomas = diplomas.filter((d) => d.title);
      if (validDiplomas.length > 0) {
        await supabase.from('employee_diplomas').insert(
          validDiplomas.map((d) => ({ employee_id: employeeId, title: d.title, institution: d.institution || null, year: d.year || null }))
        );
      }

      await supabase.from('employee_languages').delete().eq('employee_id', employeeId);
      const validLanguages = languages.filter((l) => l.language);
      if (validLanguages.length > 0) {
        await supabase.from('employee_languages').insert(
          validLanguages.map((l) => ({ employee_id: employeeId, language: l.language, level: l.level || null }))
        );
      }
    }

    setSaving(false);
    if (editingEmployee) {
      setEmployees(employees.map((e) => (e.id === savedRow!.id ? savedRow! : e)));
    } else {
      setEmployees([...employees, savedRow!]);
    }
    setIsModalOpen(false);
  };

  const handleAddContract = async () => {
    if (!editingEmployee || !contractForm.start_date) return;
    if (!isSupabaseConfigured || !supabase) return;

    setSavingContract(true);
    const { data, error } = await supabase.from('contracts').insert({
      employee_id: editingEmployee.id,
      contract_type: contractForm.contract_type,
      start_date: contractForm.start_date,
      end_date: contractForm.end_date || null,
      base_salary: contractForm.base_salary ? Number(contractForm.base_salary) : null,
      currency: contractForm.currency,
      status: contractForm.status,
    }).select().single();
    setSavingContract(false);

    if (error || !data) {
      alert('Échec de la création du contrat : ' + (error?.message || 'inconnu'));
      return;
    }
    setContracts([data as Contract, ...contracts]);
    setContractForm(EMPTY_CONTRACT_FORM);
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Supprimer ce contrat ?')) return;
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('contracts').delete().eq('id', contractId);
    if (error) {
      alert('Échec de la suppression : ' + error.message);
      return;
    }
    setContracts(contracts.filter((c) => c.id !== contractId));
  };

  const handleUpdateContractStatus = async (contractId: string, status: ContractStatus) => {
    setContracts(contracts.map((c) => (c.id === contractId ? { ...c, status } : c)));
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('contracts').update({ status }).eq('id', contractId);
    if (error) {
      alert('Échec de la mise à jour du statut : ' + error.message);
    }
  };

  const getStatusBadge = (status: EmployeeStatus) => {
    const styles: Record<EmployeeStatus, string> = {
      actif: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      en_conge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      suspendu: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      sorti: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const labels: Record<EmployeeStatus, string> = { actif: 'ACTIF', en_conge: 'EN CONGÉ', suspendu: 'SUSPENDU', sorti: 'SORTI' };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>{labels[status]}</span>;
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Employé',
      render: (e) => (
        <div className="flex items-center gap-3">
          <img
            src={e.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80'}
            alt={`${e.first_name} ${e.last_name}`}
            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
          />
          <div>
            <div className="font-bold text-white text-xs">{e.first_name} {e.last_name}</div>
            <div className="text-[10px] text-slate-400">{e.job_title}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Type / Département',
      render: (e) => (
        <div>
          <div className="text-white text-xs font-semibold">{EMPLOYEE_TYPES.find((t) => t.value === e.employee_type)?.label}</div>
          <div className="text-[10px] text-slate-500">{e.department || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (e) => (
        <div className="text-[11px] text-slate-300">
          <div>{e.phone || '—'}</div>
          <div className="text-slate-500">{e.personal_email || '—'}</div>
        </div>
      ),
    },
    { header: 'Statut', render: (e) => getStatusBadge(e.status) },
    {
      header: 'Actions',
      render: (e) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(e)} className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800" title="Modifier">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(e.id)}
            disabled={busyId === e.id}
            className="p-2 rounded-lg bg-slate-950 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 disabled:opacity-50"
            title="Supprimer"
          >
            {busyId === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Employés</h2>
          <p className="text-xs text-slate-400">Fiches du personnel, contrats, diplômes et langues.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Employé</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadEmployees} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des employés...</span>
        </div>
      ) : (
        <DataTable
          data={employees}
          columns={columns}
          searchPlaceholder="Rechercher par nom, poste, département..."
          searchFilter={(item, q) =>
            `${item.first_name} ${item.last_name}`.toLowerCase().includes(q.toLowerCase()) ||
            item.job_title.toLowerCase().includes(q.toLowerCase()) ||
            (item.department || '').toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="employes-serein-ge.csv"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Modifier la Fiche Employé' : 'Nouvel Employé'}
        subtitle="Identité, poste, documents, diplômes, langues et contrats."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-6 text-xs">

          <div>
            <div className="font-bold text-white text-sm mb-3">Identité</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Prénom *</label>
                <input required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Nom *</label>
                <input required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1.5">URL Photo</label>
                <input value={formData.photo_url} onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })} placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Date de naissance</label>
                <input type="date" value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Lieu de naissance</label>
                <input value={formData.birth_place} onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Nationalité</label>
                <input value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Situation familiale</label>
                <select value={formData.marital_status} onChange={(e) => setFormData({ ...formData, marital_status: e.target.value as MaritalStatus })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500">
                  <option value="">—</option>
                  {MARITAL_STATUSES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-white text-sm mb-3">Documents</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">N° Pièce d'identité</label>
                <input value={formData.national_id_number} onChange={(e) => setFormData({ ...formData, national_id_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Expiration pièce d'identité</label>
                <input type="date" value={formData.national_id_expiry} onChange={(e) => setFormData({ ...formData, national_id_expiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">N° Permis de conduire</label>
                <input value={formData.driving_license_number} onChange={(e) => setFormData({ ...formData, driving_license_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Expiration permis de conduire</label>
                <input type="date" value={formData.driving_license_expiry} onChange={(e) => setFormData({ ...formData, driving_license_expiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Une alerte automatique est envoyée à RH/Super Admin 1 mois avant chaque échéance.</p>
          </div>

          <div>
            <div className="font-bold text-white text-sm mb-3">Contact</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Téléphone</label>
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Email personnel</label>
                <input type="email" value={formData.personal_email} onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1.5">Adresse</label>
                <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Contact d'urgence — Nom</label>
                <input value={formData.emergency_contact_name} onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Lien de parenté</label>
                <input value={formData.emergency_contact_relation} onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Téléphone d'urgence</label>
                <input value={formData.emergency_contact_phone} onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-white text-sm mb-3">Poste</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Titre du poste *</label>
                <input required value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Type d'employé</label>
                <select value={formData.employee_type} onChange={(e) => setFormData({ ...formData, employee_type: e.target.value as EmployeeType })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500">
                  {EMPLOYEE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Département</label>
                <input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Statut</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500">
                  {EMPLOYEE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Le type d'employé est un titre RH descriptif : il n'accorde aucun droit d'accès au dashboard (voir Utilisateurs & Rôles pour ça).
            </p>
          </div>

          <div>
            <div className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Diplômes</span>
            </div>
            <div className="space-y-2">
              {diplomas.map((d, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_auto] gap-2">
                  <input placeholder="Titre" value={d.title || ''} onChange={(e) => setDiplomas(diplomas.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
                  <input placeholder="Institution" value={d.institution || ''} onChange={(e) => setDiplomas(diplomas.map((x, i) => i === idx ? { ...x, institution: e.target.value } : x))}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
                  <input placeholder="Année" type="number" value={d.year || ''} onChange={(e) => setDiplomas(diplomas.map((x, i) => i === idx ? { ...x, year: e.target.value ? Number(e.target.value) : undefined } : x))}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
                  <button type="button" onClick={() => setDiplomas(diplomas.filter((_, i) => i !== idx))} className="p-2 rounded-xl bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setDiplomas([...diplomas, {}])} className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /><span>Ajouter un diplôme</span>
              </button>
            </div>
          </div>

          <div>
            <div className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>Langues</span>
            </div>
            <div className="space-y-2">
              {languages.map((l, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_auto] gap-2">
                  <input placeholder="Langue" value={l.language || ''} onChange={(e) => setLanguages(languages.map((x, i) => i === idx ? { ...x, language: e.target.value } : x))}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
                  <select value={l.level || ''} onChange={(e) => setLanguages(languages.map((x, i) => i === idx ? { ...x, level: e.target.value as any } : x))}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500">
                    <option value="">Niveau —</option>
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="courant">Courant</option>
                    <option value="natif">Natif</option>
                  </select>
                  <button type="button" onClick={() => setLanguages(languages.filter((_, i) => i !== idx))} className="p-2 rounded-xl bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setLanguages([...languages, {}])} className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /><span>Ajouter une langue</span>
              </button>
            </div>
          </div>

          {editingEmployee && (
            <div>
              <div className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-emerald-400" />
                <span>Contrats</span>
              </div>
              <div className="space-y-2 mb-3">
                {contracts.length === 0 && <p className="text-slate-500">Aucun contrat enregistré.</p>}
                {contracts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="min-w-0">
                      <span className="font-bold text-white">{c.contract_type}</span>
                      <span className="text-slate-400"> — {c.start_date} → {c.end_date || 'indéterminé'}</span>
                      {c.base_salary && <span className="text-slate-500"> · {c.base_salary.toLocaleString('fr-FR')} {c.currency}</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateContractStatus(c.id, e.target.value as ContractStatus)}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px] focus:outline-none focus:border-emerald-500"
                      >
                        {CONTRACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button type="button" onClick={() => handleDeleteContract(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <select value={contractForm.contract_type} onChange={(e) => setContractForm({ ...contractForm, contract_type: e.target.value as ContractType })}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-[11px]">
                  {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="date" placeholder="Début" value={contractForm.start_date} onChange={(e) => setContractForm({ ...contractForm, start_date: e.target.value })}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-[11px]" />
                <input type="date" placeholder="Fin" value={contractForm.end_date} onChange={(e) => setContractForm({ ...contractForm, end_date: e.target.value })}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-[11px]" />
                <input type="number" placeholder="Salaire de base" value={contractForm.base_salary} onChange={(e) => setContractForm({ ...contractForm, base_salary: e.target.value })}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-[11px]" />
                <select value={contractForm.status} onChange={(e) => setContractForm({ ...contractForm, status: e.target.value as ContractStatus })}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-[11px]">
                  {CONTRACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  type="button"
                  onClick={handleAddContract}
                  disabled={savingContract || !contractForm.start_date}
                  className="px-2.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {savingContract ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          )}

          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300">{formError}</div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold shadow-glow-emerald flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
