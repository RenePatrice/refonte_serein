import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertTriangle, RefreshCw, Check, X } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { AdminUser, Role } from '../types';
import { INITIAL_USERS } from '../lib/mock-admin-data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getPasswordRuleErrors } from '../lib/validators';

interface UsersManagerProps {
  currentUserId?: string;
}

const EMPTY_FORM = {
  nom_complet: '',
  email: '',
  role: 'editeur' as Role,
  telephone: '',
  is_active: true,
  password: '',
};

export default function UsersManager({ currentUserId }: UsersManagerProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUsers(INITIAL_USERS);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });

    if (error) {
      setLoadError("Impossible de charger les comptes administrateurs : " + error.message);
    } else {
      setUsers((data || []) as AdminUser[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormError(null);
    setFormData({ ...EMPTY_FORM, telephone: '+226 ' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormError(null);
    setFormData({
      nom_complet: user.nom_complet,
      email: user.email,
      role: user.role,
      telephone: user.telephone || '',
      is_active: user.is_active,
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
      alert('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    if (!confirm('Voulez-vous supprimer ce compte administrateur ?')) return;

    if (!isSupabaseConfigured || !supabase) {
      setUsers(users.filter((u) => u.id !== id));
      return;
    }

    setBusyId(id);
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'delete', userId: id },
    });
    setBusyId(null);

    if (error || data?.error) {
      alert('Échec de la suppression : ' + (data?.error || error?.message));
      return;
    }
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom_complet || !formData.email) return;

    if (!editingUser) {
      const pwErrors = getPasswordRuleErrors(formData.password);
      if (pwErrors.length > 0) {
        setFormError('Mot de passe invalide : ' + pwErrors.join(', '));
        return;
      }
    }

    if (!isSupabaseConfigured || !supabase) {
      if (editingUser) {
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)));
      } else {
        const newUser: AdminUser = {
          id: `u_${Date.now()}`,
          ...formData,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          created_at: new Date().toISOString(),
        };
        setUsers([...users, newUser]);
      }
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    setFormError(null);

    if (editingUser) {
      const { data, error } = await supabase
        .from('users')
        .update({
          nom_complet: formData.nom_complet,
          role: formData.role,
          telephone: formData.telephone || null,
          is_active: formData.is_active,
        })
        .eq('id', editingUser.id)
        .select()
        .single();

      setSaving(false);
      if (error || !data) {
        setFormError(error?.message || 'Échec de la mise à jour du compte');
        return;
      }
      setUsers(users.map((u) => (u.id === editingUser.id ? (data as AdminUser) : u)));
    } else {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'create',
          email: formData.email,
          nom_complet: formData.nom_complet,
          role: formData.role,
          telephone: formData.telephone || null,
          password: formData.password,
        },
      });

      setSaving(false);
      if (error || data?.error || !data?.user) {
        setFormError(data?.error || error?.message || 'Échec de la création du compte');
        return;
      }
      setUsers([data.user as AdminUser, ...users]);
    }

    setIsModalOpen(false);
  };

  const columns: Column<AdminUser>[] = [
    {
      header: 'Administrateur',
      render: (u) => (
        <div className="flex items-center space-x-3">
          <img src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={u.nom_complet} className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0" />
          <div>
            <div className="font-bold text-white text-xs">{u.nom_complet}</div>
            <div className="text-[10px] text-slate-400">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Rôle & Permissions',
      render: (u) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          u.role === 'super_admin'
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {u.role === 'super_admin' ? 'Super Admin (Complet)' : 'Éditeur (Contenu & Commandes)'}
        </span>
      ),
    },
    {
      header: 'Téléphone',
      accessor: 'telephone',
    },
    {
      header: 'Statut',
      render: (u) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          u.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {u.is_active ? 'Actif' : 'Bloqué'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEdit(u)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(u.id)}
            disabled={busyId === u.id || u.id === currentUserId}
            title={u.id === currentUserId ? 'Vous ne pouvez pas supprimer votre propre compte' : 'Supprimer'}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Gestion des Comptes & Rôles</h2>
          <p className="text-xs text-slate-400">Attribution des droits d'accès Super Admin et Éditeur pour la plateforme.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow-emerald transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Compte</span>
        </button>
      </div>

      {isSupabaseConfigured && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          ℹ️ Le mot de passe est défini directement à la création du compte. À la connexion, l'administrateur devra saisir son mot de passe puis un code de vérification à 6 chiffres envoyé par email (valide 5 minutes).
        </div>
      )}

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={loadUsers} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 font-semibold flex items-center gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Chargement des comptes...</span>
        </div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          searchPlaceholder="Rechercher un administrateur..."
          searchFilter={(item, q) =>
            item.nom_complet.toLowerCase().includes(q.toLowerCase()) ||
            item.email.toLowerCase().includes(q.toLowerCase())
          }
          exportFileName="administrateurs-serein-ge.csv"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Modifier le Compte' : 'Créer un Compte Administrateur'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nom Complet *</label>
            <input
              type="text"
              required
              value={formData.nom_complet}
              onChange={(e) => setFormData({ ...formData, nom_complet: e.target.value })}
              placeholder="Ex: Patrice COMPAORÉ"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Adresse Email *</label>
              <input
                type="email"
                required
                disabled={Boolean(editingUser)}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nom@serein-ge.bf"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {editingUser && <p className="text-[10px] text-slate-500 mt-1">L'email n'est pas modifiable depuis ce formulaire.</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Rôle Système *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="editeur">Éditeur (Gestion de contenu & commandes)</option>
                <option value="super_admin">Super Admin (Accès total & gestion des utilisateurs)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Statut du Compte</label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="active">Actif (Autorisé)</option>
                <option value="inactive">Désactivé</option>
              </select>
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Mot de Passe *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mot de passe initial du compte"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
              <ul className="mt-2 space-y-1">
                {[
                  { label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
                  { label: 'Au moins un chiffre', test: (p: string) => /[0-9]/.test(p) },
                  { label: 'Au moins un caractère spécial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
                  { label: 'Au moins une majuscule', test: (p: string) => /[A-Z]/.test(p) },
                  { label: 'Au moins une minuscule', test: (p: string) => /[a-z]/.test(p) },
                ].map((rule) => {
                  const ok = rule.test(formData.password);
                  return (
                    <li key={rule.label} className={`flex items-center gap-1.5 text-[10px] ${ok ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{rule.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300">
              {formError}
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-bold shadow-glow-emerald flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
