import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Users2 } from 'lucide-react';
import DataTable, { Column } from '../../components/DataTable';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Employee, EmployeeStatus, EmployeeType } from '../../types/hr.types';

const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  directeur: 'Directeur',
  cadre: 'Cadre',
  employe: 'Employé',
  stagiaire: 'Stagiaire',
  prestataire: 'Prestataire',
  consultant: 'Consultant',
  chauffeur: 'Chauffeur',
};

export default function MyTeam() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTeam = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setEmployees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    // RLS restreint déjà le résultat aux membres des projets dont le compte
    // courant est responsable ("Un responsable de projet voit son équipe").
    const { data, error } = await supabase.from('employees').select('*').order('last_name', { ascending: true });

    if (error) {
      setLoadError('Impossible de charger votre équipe : ' + error.message);
    } else {
      setEmployees((data || []) as Employee[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      header: 'Membre',
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
    { header: 'Type', render: (e) => <span className="text-xs text-slate-200">{EMPLOYEE_TYPE_LABELS[e.employee_type]}</span> },
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
  ];

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
          <Users2 className="w-5 h-5 text-emerald-400" />
          <span>Mon Équipe</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Membres des projets dont vous êtes responsable. Consultation seule -- contactez RH pour toute modification.</p>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadTeam} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement de votre équipe...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          Aucun membre pour le moment -- ajoutez des membres à vos projets depuis la page Projets.
        </div>
      ) : (
        <DataTable
          data={employees}
          columns={columns}
          searchPlaceholder="Rechercher un membre..."
          searchFilter={(item, q) => `${item.first_name} ${item.last_name}`.toLowerCase().includes(q.toLowerCase())}
          exportFileName="mon-equipe-serein-ge.csv"
        />
      )}

    </div>
  );
}
