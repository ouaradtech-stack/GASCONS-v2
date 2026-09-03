import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Fuel,
  Gauge,
  Key,
  Layers,
  Lock,
  LogOut,
  Mail,
  Shield,
  Truck,
  User as UserIcon,
  UserCheck,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { User, UserRole } from '../types';

interface LoginScreenProps {
  onSuccess?: () => void;
}

const ROLE_BADGES: Record<UserRole, { label: string; color: string; desc: string }> = {
  SUPER_ADMIN: {
    label: 'Super Administrateur',
    color: 'bg-purple-600/15 text-purple-800 border-purple-300 font-black',
    desc: 'Accès Master Propriétaire (OuaradTech), vente sous-admins & purge cloud',
  },
  SOUS_ADMIN: {
    label: 'Sous-Admin (Client)',
    color: 'bg-amber-500/15 text-amber-800 border-amber-300 font-bold',
    desc: 'Accès Client sous licence : gestion autonome de son parc et de son stock',
  },
  ADMIN: {
    label: 'Administrateur',
    color: 'bg-red-500/10 text-red-700 border-red-200',
    desc: 'Accès complet, configuration, gestion des utilisateurs & cuves',
  },
  GESTIONNAIRE: {
    label: 'Gestionnaire de Stock',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    desc: 'Gestion des réceptions, niveaux de cuve, ajustements & rapports',
  },
  SUPERVISEUR: {
    label: 'Superviseur Chantier',
    color: 'bg-purple-500/10 text-purple-700 border-purple-200',
    desc: 'Consultation des sorties, suivi de consommation des engins',
  },
  POMPISTE: {
    label: 'Pompiste / Agent Dépôt',
    color: 'bg-amber-500/10 text-amber-800 border-amber-200',
    desc: 'Distribution de gasoil, saisie des bons de sortie & signatures',
  },
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const {
    companyProfile,
    users,
    login,
    signInWithGoogle,
    firebaseStatus,
  } = useGascons();

  const [selectedUser, setSelectedUser] = useState<User | null>(() => users[0] || null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'cards' | 'email'>('cards');
  const [emailInput, setEmailInput] = useState<string>('');
  const [customPasswordInput, setCustomPasswordInput] = useState<string>('');

  // Handle Quick Profile Login
  const handleProfileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedUser) {
      setErrorMessage('Veuillez sélectionner un profil utilisateur.');
      return;
    }

    // Check password if user has one configured
    if (selectedUser.password && selectedUser.password.trim() !== '') {
      if (passwordInput !== selectedUser.password) {
        setErrorMessage('Mot de passe incorrect pour cet utilisateur.');
        return;
      }
    }

    login(selectedUser);
    if (onSuccess) onSuccess();
  };

  // 1-Click Fast Switch and Login for a specific card
  const handleDirectCardSelect = (user: User) => {
    setSelectedUser(user);
    setErrorMessage('');
    // If user has default password, prefill it for convenience
    if (user.password) {
      setPasswordInput(user.password);
    } else {
      setPasswordInput('');
    }
  };

  // Handle Standard Email/Password Form Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = emailInput.trim().toLowerCase();
    const userFound = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail || u.name.toLowerCase() === trimmedEmail
    );

    if (!userFound) {
      setErrorMessage("Identifiant ou adresse e-mail introuvable.");
      return;
    }

    if (userFound.password && userFound.password.trim() !== '') {
      if (customPasswordInput !== userFound.password) {
        setErrorMessage('Mot de passe incorrect.');
        return;
      }
    }

    login(userFound);
    if (onSuccess) onSuccess();
  };

  // Handle Google Firebase Auth Login
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage('');
      await signInWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.warn('Google sign-in issue:', err);
      setErrorMessage('Erreur lors de la connexion avec Google. Veuillez réessayer.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              {companyProfile.name || 'GASCONS'}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/80 text-blue-100 uppercase tracking-wider">
                Contrôle Carburant
              </span>
            </span>
            <span className="text-xs text-slate-400 block font-medium">
              {companyProfile.activity || 'Gestion & Suivi Flotte • Cuves • Distribution'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline font-mono">Cloud Connecté</span>
        </div>
      </div>

      {/* Main Center Login Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Left Column: Visual Brand & Key Stats */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-800/90 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" /> Authentification Sécurisée
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Connexion à l Application
                </h1>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Identifiez-vous pour accéder au tableau de bord, saisir les sorties de gasoil et gérer les stocks.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">Gestion de Flotte & Engins</p>
                    <p className="text-slate-400">Relevés d index KM & Horamètres</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">Bons de Sortie Numérisés</p>
                    <p className="text-slate-400">Signature électronique & reçu instantané</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">Niveaux de Cuve en Direct</p>
                    <p className="text-slate-400">Alertes seuil critique & traçabilité BL</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>GASCONS v1.0 • Multi-Rôles</span>
              <span className="text-slate-400">Entreprise Edition</span>
            </div>
          </div>

          {/* Right Column: Authentication Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-900 flex flex-col justify-center">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('cards');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  loginMode === 'cards'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                Profils Collaborateurs
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('email');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  loginMode === 'email'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Saisie E-mail & Mot de Passe
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {loginMode === 'cards' ? (
              /* Mode 1: Quick Select User Cards */
              <form onSubmit={handleProfileLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Sélectionnez votre compte :
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {users.map((u) => {
                      const isSelected = selectedUser?.id === u.id;
                      const badge = ROLE_BADGES[u.role] || {
                        label: u.role,
                        color: 'bg-slate-700 text-slate-300',
                        desc: '',
                      };

                      return (
                        <div
                          key={u.id}
                          onClick={() => handleDirectCardSelect(u)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 relative ${
                            isSelected
                              ? 'bg-blue-950/60 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600 text-slate-300'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {u.avatar || u.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-xs text-white truncate">{u.name}</p>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                              )}
                            </div>
                            <span
                              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {u.department}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Password / PIN input */}
                {selectedUser && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        Code PIN / Mot de passe :
                      </label>
                      {selectedUser.password && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          (Défaut: <strong className="text-amber-400">{selectedUser.password}</strong>)
                        </span>
                      )}
                    </div>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Entrez votre mot de passe ou PIN..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  Se Connecter avec {selectedUser ? selectedUser.name : 'le profil'}
                </button>
              </form>
            ) : (
              /* Mode 2: Standard Email / Password */
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Adresse E-mail ou Identifiant :
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="ex: ahmed.admin@gascons.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Mot de passe :
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={customPasswordInput}
                      onChange={(e) => setCustomPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  Ouvrir la session
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-slate-900 text-slate-500 text-xs font-medium uppercase tracking-wider">
                ou connexion Cloud
              </span>
            </div>

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connexion en cours...' : 'Continuer avec Google Workspace'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Help footer */}
      <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto">
        <p>© 2026 GASCONS — Solution de Contrôle & Gestion des Carburants</p>
        <p className="text-[11px] text-slate-400 mt-1 sm:mt-0">
          Système sécurisé • Traçabilité horodatée • Base Cloud Firebase
        </p>
      </div>
    </div>
  );
};
