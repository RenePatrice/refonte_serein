import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProductsManager from './pages/ProductsManager';
import OrdersManager from './pages/OrdersManager';
import PaymentsManager from './pages/PaymentsManager';
import TeamManager from './pages/TeamManager';
import RealisationsManager from './pages/RealisationsManager';
import NewsManager from './pages/NewsManager';
import PartnersManager from './pages/PartnersManager';
import JobsManager from './pages/JobsManager';
import ApplicationsManager from './pages/ApplicationsManager';
import QuotesManager from './pages/QuotesManager';
import UsersManager from './pages/UsersManager';
import ChatbotManager from './pages/ChatbotManager';
import AppearanceManager from './pages/AppearanceManager';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AdminUser } from './types';
import { INITIAL_USERS } from './lib/mock-admin-data';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { isPathAllowed, EDITEUR_DEFAULT_PATH } from './lib/permissions';
import { applyBrandColor, applyCssVarColor } from './lib/theme';
import { applyFontPreset } from './lib/fontPresets';
import { AccessRoleCode } from './types/hr.types';
import EmployeesManager from './pages/hr/EmployeesManager';
import ProjectsManager from './pages/hr/ProjectsManager';
import { canAccessHrModule } from './lib/hrPermissions';
import { Loader2, Compass } from 'lucide-react';

const DEMO_SESSION_KEY = 'serein_admin_demo_user';
// Marque, pour l'onglet courant uniquement, qu'une session Supabase a franchi
// l'étape du code à 6 chiffres. signInWithPassword seul crée déjà une session
// Supabase valide ; sans ce marqueur on la traiterait comme "en attente d'OTP"
// et on ne donnerait jamais accès au tableau de bord avec le mot de passe seul.
const OTP_VERIFIED_KEY = 'serein_admin_otp_verified';

async function fetchProfile(userId: string): Promise<AdminUser | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id, email, nom_complet, role, avatar_url, telephone, is_active, created_at')
    .eq('id', userId)
    .single();

  if (error || !data || !data.is_active) return null;
  return data as AdminUser;
}

function RoleGuard({ currentUser, path, children }: { currentUser: AdminUser; path: string; children: React.ReactNode }) {
  if (!isPathAllowed(currentUser.role, path)) {
    return <Navigate to={EDITEUR_DEFAULT_PATH} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  // Mode démo hors-ligne : Supabase non configuré, session locale simulée
  const [demoUser, setDemoUser] = useState<AdminUser | null>(() => {
    if (isSupabaseConfigured) return null;
    const saved = localStorage.getItem(DEMO_SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_USERS[0]; // Connecté par défaut en mode démo pour un test fluide
  });

  // Mode réel : session Supabase Auth + profil applicatif (rôle, etc.)
  const [authUser, setAuthUser] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  // Non-null pendant l'étape "code à 6 chiffres" : mot de passe déjà validé,
  // code envoyé par email, en attente de vérification.
  const [pendingOtpEmail, setPendingOtpEmail] = useState<string | null>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Rôles additifs du module RH (cumul via user_roles), indépendants du
  // users.role historique (super_admin/editeur) utilisé par lib/permissions.ts.
  const [userRoles, setUserRoles] = useState<AccessRoleCode[]>([]);

  const currentUser = isSupabaseConfigured ? authUser : demoUser;

  useEffect(() => {
    if (!currentUser) {
      setUserRoles([]);
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      // Mode démo : le rôle historique sert de repli pour ne pas casser l'UI.
      setUserRoles([currentUser.role as AccessRoleCode]);
      return;
    }
    supabase
      .from('user_roles')
      .select('roles(code)')
      .eq('user_id', currentUser.id)
      .then(({ data }) => {
        const codes = (data || [])
          .map((row: any) => row.roles?.code)
          .filter(Boolean) as AccessRoleCode[];
        setUserRoles(codes);
      });
  }, [currentUser?.id]);

  // Apparence du back-office (couleur, police, logo) : appliquée globalement,
  // y compris sur l'écran de connexion, dès le chargement de l'app.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase
      .from('site_settings')
      .select('admin_primary_color, admin_secondary_color, admin_font_family, logo_url')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.admin_primary_color) applyBrandColor(data.admin_primary_color, 'admin-brand');
        if (data.admin_secondary_color) applyCssVarColor('--admin-brand-secondary', data.admin_secondary_color);
        applyFontPreset(data.admin_font_family, '--admin-font-sans', '--admin-font-display');
        if (data.logo_url) setLogoUrl(data.logo_url);
      });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    let active = true;

    const resolveSession = async (userId: string, email: string | undefined) => {
      const profile = await fetchProfile(userId);
      if (!active) return;
      if (!profile) {
        setAuthError("Ce compte n'a pas de profil administrateur actif. Contactez un Super Admin.");
        await client.auth.signOut();
        sessionStorage.removeItem(OTP_VERIFIED_KEY);
        setAuthUser(null);
        return;
      }

      // Le Super Admin n'est pas soumis au 2e facteur (code à 6 chiffres) :
      // le mot de passe seul suffit à accorder l'accès.
      if (profile.role === 'super_admin') {
        setPendingOtpEmail(null);
        setAuthUser(profile);
        return;
      }

      const otpVerified = sessionStorage.getItem(OTP_VERIFIED_KEY) === 'true';
      if (!otpVerified) {
        // Session Supabase valide (mot de passe correct) mais 2e facteur non
        // encore franchi sur cet onglet : on reste bloqué à l'étape OTP.
        setPendingOtpEmail(email || null);
        setAuthUser(null);
        return;
      }
      setPendingOtpEmail(null);
      setAuthUser(profile);
    };

    client.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (data.session) {
        await resolveSession(data.session.user.id, data.session.user.email);
      }
      setAuthLoading(false);
    });

    const { data: subscription } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (!session) {
        setAuthUser(null);
        setPendingOtpEmail(null);
        return;
      }
      await resolveSession(session.user.id, session.user.email);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Étape 1 : email + mot de passe
  const handlePasswordLogin = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Mode démo : pas de vérification de mot de passe ni d'OTP
      const found = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const user = found || {
        id: 'u_custom',
        email,
        nom_complet: 'Administrateur SEREIN-GE',
        role: 'super_admin' as const,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setDemoUser(user);
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
      return;
    }

    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect.'
        : (error?.message || 'Échec de la connexion.'));
    }

    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      await supabase.auth.signOut();
      throw new Error("Ce compte n'a pas de profil administrateur actif. Contactez un Super Admin.");
    }

    // Le Super Admin n'est pas soumis au 2e facteur : accès accordé dès que
    // le mot de passe est validé, sans code à 6 chiffres.
    if (profile.role === 'super_admin') {
      setPendingOtpEmail(null);
      setAuthUser(profile);
      return;
    }

    // Le mot de passe est valide : on déclenche l'envoi du code à 6 chiffres
    // (email OTP natif de Supabase Auth, durée configurée dans le projet Supabase).
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (otpError) {
      throw new Error("Impossible d'envoyer le code de vérification : " + otpError.message);
    }

    sessionStorage.removeItem(OTP_VERIFIED_KEY);
    setPendingOtpEmail(email);
  };

  // Étape 2 : code à 6 chiffres reçu par email
  const handleVerifyOtp = async (email: string, code: string) => {
    if (!supabase) return;
    setAuthError(null);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error || !data.user) {
      throw new Error(error?.message || 'Code de vérification invalide ou expiré.');
    }

    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      await supabase.auth.signOut();
      throw new Error("Ce compte n'a pas de profil administrateur actif. Contactez un Super Admin.");
    }

    sessionStorage.setItem(OTP_VERIFIED_KEY, 'true');
    setPendingOtpEmail(null);
    setAuthUser(profile);
  };

  const handleResendOtp = async (email: string) => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) throw new Error(error.message);
  };

  const handleCancelOtp = async () => {
    if (supabase) await supabase.auth.signOut();
    sessionStorage.removeItem(OTP_VERIFIED_KEY);
    setPendingOtpEmail(null);
  };

  const handleQuickDemoLogin = (user: AdminUser) => {
    setDemoUser(user);
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
      sessionStorage.removeItem(OTP_VERIFIED_KEY);
      setAuthUser(null);
      setPendingOtpEmail(null);
    } else {
      setDemoUser(null);
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
  };

  if (isSupabaseConfigured && authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Compass className="w-10 h-10 text-emerald-400" />
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-xs">Vérification de la session Supabase...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Login
        onPasswordLogin={handlePasswordLogin}
        onVerifyOtp={handleVerifyOtp}
        onResendOtp={handleResendOtp}
        onCancelOtp={handleCancelOtp}
        pendingOtpEmail={isSupabaseConfigured ? pendingOtpEmail : null}
        onQuickDemoLogin={!isSupabaseConfigured ? handleQuickDemoLogin : undefined}
        initialError={authError}
        logoUrl={logoUrl}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased">
        {/* Sidebar Left */}
        <Sidebar currentUser={currentUser} onLogout={handleLogout} logoUrl={logoUrl} userRoles={userRoles} />

        {/* Main Workspace Right */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Supervision SEREIN-GE" currentUser={currentUser} />

          <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<RoleGuard currentUser={currentUser} path="/"><Dashboard /></RoleGuard>} />
              <Route path="/produits" element={<RoleGuard currentUser={currentUser} path="/produits"><ProductsManager /></RoleGuard>} />
              <Route path="/commandes" element={<RoleGuard currentUser={currentUser} path="/commandes"><OrdersManager /></RoleGuard>} />
              <Route path="/devis" element={<RoleGuard currentUser={currentUser} path="/devis"><QuotesManager /></RoleGuard>} />
              <Route path="/paiements" element={<RoleGuard currentUser={currentUser} path="/paiements"><PaymentsManager /></RoleGuard>} />
              <Route path="/equipe" element={<RoleGuard currentUser={currentUser} path="/equipe"><TeamManager /></RoleGuard>} />
              <Route path="/realisations" element={<RoleGuard currentUser={currentUser} path="/realisations"><RealisationsManager /></RoleGuard>} />
              <Route path="/actualites" element={<RoleGuard currentUser={currentUser} path="/actualites"><NewsManager /></RoleGuard>} />
              <Route path="/partenaires" element={<RoleGuard currentUser={currentUser} path="/partenaires"><PartnersManager /></RoleGuard>} />
              <Route path="/offres" element={<RoleGuard currentUser={currentUser} path="/offres"><JobsManager /></RoleGuard>} />
              <Route path="/candidatures" element={<RoleGuard currentUser={currentUser} path="/candidatures"><ApplicationsManager /></RoleGuard>} />
              <Route path="/chatbot" element={<RoleGuard currentUser={currentUser} path="/chatbot"><ChatbotManager /></RoleGuard>} />
              <Route
                path="/apparence"
                element={currentUser.role === 'super_admin' ? <AppearanceManager /> : <Navigate to={EDITEUR_DEFAULT_PATH} replace />}
              />
              <Route
                path="/rh/employes"
                element={canAccessHrModule(userRoles) ? <EmployeesManager /> : <Navigate to={EDITEUR_DEFAULT_PATH} replace />}
              />
              <Route
                path="/rh/projets"
                element={canAccessHrModule(userRoles) ? <ProjectsManager /> : <Navigate to={EDITEUR_DEFAULT_PATH} replace />}
              />
              <Route
                path="/utilisateurs"
                element={currentUser.role === 'super_admin' ? <UsersManager currentUserId={currentUser.id} /> : <Navigate to={EDITEUR_DEFAULT_PATH} replace />}
              />
              <Route
                path="/parametres"
                element={currentUser.role === 'super_admin' ? <Settings /> : <Navigate to={EDITEUR_DEFAULT_PATH} replace />}
              />
              <Route path="*" element={<Navigate to={currentUser.role === 'super_admin' ? '/' : EDITEUR_DEFAULT_PATH} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
