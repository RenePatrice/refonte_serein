import React, { useEffect, useState } from 'react';
import { UserSquare2, Loader2, AlertTriangle, GraduationCap, Languages, FileSignature } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Employee, EmployeeDiploma, EmployeeLanguage, Contract } from '../../types/hr.types';

interface MyProfileProps {
  employeeId: string;
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">{label}</div>
      <div className="text-white text-sm mt-0.5">{value || '—'}</div>
    </div>
  );
}

export default function MyProfile({ employeeId }: MyProfileProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [diplomas, setDiplomas] = useState<EmployeeDiploma[]>([]);
  const [languages, setLanguages] = useState<EmployeeLanguage[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      supabase.from('employees').select('*').eq('id', employeeId).single(),
      supabase.from('employee_diplomas').select('*').eq('employee_id', employeeId),
      supabase.from('employee_languages').select('*').eq('employee_id', employeeId),
      supabase.from('contracts').select('*').eq('employee_id', employeeId).order('start_date', { ascending: false }),
    ]).then(([emp, dip, lang, ctr]) => {
      if (emp.error) {
        setError("Impossible de charger votre fiche : " + emp.error.message);
      } else {
        setEmployee(emp.data as Employee);
      }
      setDiplomas((dip.data || []) as EmployeeDiploma[]);
      setLanguages((lang.data || []) as EmployeeLanguage[]);
      setContracts((ctr.data || []) as Contract[]);
      setLoading(false);
    });
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Chargement de votre profil...</span>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>{error || 'Fiche introuvable.'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl text-xs">

      <div className="flex items-center gap-4">
        <img
          src={employee.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'}
          alt={`${employee.first_name} ${employee.last_name}`}
          className="w-16 h-16 rounded-full object-cover border border-slate-800"
        />
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <UserSquare2 className="w-5 h-5 text-emerald-400" />
            <span>{employee.first_name} {employee.last_name}</span>
          </h2>
          <p className="text-slate-400 mt-0.5">{employee.job_title}{employee.department ? ` — ${employee.department}` : ''}</p>
        </div>
      </div>

      <div className="admin-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="font-bold text-white text-sm">Identité</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date de naissance" value={employee.birth_date} />
          <Field label="Lieu de naissance" value={employee.birth_place} />
          <Field label="Nationalité" value={employee.nationality} />
          <Field label="Situation familiale" value={employee.marital_status} />
        </div>
      </div>

      <div className="admin-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="font-bold text-white text-sm">Documents</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="N° Pièce d'identité" value={employee.national_id_number} />
          <Field label="Expiration pièce d'identité" value={employee.national_id_expiry} />
          <Field label="N° Permis de conduire" value={employee.driving_license_number} />
          <Field label="Expiration permis de conduire" value={employee.driving_license_expiry} />
        </div>
      </div>

      <div className="admin-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="font-bold text-white text-sm">Contact</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Téléphone" value={employee.phone} />
          <Field label="Email personnel" value={employee.personal_email} />
          <Field label="Adresse" value={employee.address} />
          <Field label="Contact d'urgence" value={employee.emergency_contact_name ? `${employee.emergency_contact_name} (${employee.emergency_contact_relation || '—'}) — ${employee.emergency_contact_phone || ''}` : null} />
        </div>
      </div>

      <div className="admin-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <div className="font-bold text-white text-sm flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>Diplômes</span>
        </div>
        {diplomas.length === 0 ? <p className="text-slate-500">Aucun diplôme enregistré.</p> : (
          <ul className="space-y-1">
            {diplomas.map((d) => (
              <li key={d.id} className="text-slate-200">{d.title}{d.institution ? ` — ${d.institution}` : ''}{d.year ? ` (${d.year})` : ''}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <div className="font-bold text-white text-sm flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-emerald-400" />
          <span>Langues</span>
        </div>
        {languages.length === 0 ? <p className="text-slate-500">Aucune langue enregistrée.</p> : (
          <ul className="space-y-1">
            {languages.map((l) => <li key={l.id} className="text-slate-200">{l.language}{l.level ? ` — ${l.level}` : ''}</li>)}
          </ul>
        )}
      </div>

      <div className="admin-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <div className="font-bold text-white text-sm flex items-center gap-1.5">
          <FileSignature className="w-4 h-4 text-emerald-400" />
          <span>Mes Contrats</span>
        </div>
        {contracts.length === 0 ? <p className="text-slate-500">Aucun contrat enregistré.</p> : (
          <div className="space-y-2">
            {contracts.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white">{c.contract_type}</span>
                <span className="text-slate-400"> — {c.start_date} → {c.end_date || 'indéterminé'}</span>
                <span className="text-[10px] text-slate-500 block uppercase mt-0.5">{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
