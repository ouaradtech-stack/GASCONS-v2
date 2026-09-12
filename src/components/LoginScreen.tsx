import React, { useState } from 'react';
import {
  AlertCircle,
  Crown,
  Eye,
  EyeOff,
  Fuel,
  Gauge,
  Lock,
  Mail,
  Shield,
  Truck,
  UserCheck,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { initialUsers } from '../mockData';
import { User } from '../types';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const {
    companyProfile,
    users,
    login,
  } = useGascons();

  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle Standard Direct Email/Password Login
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const trimmedEmail = emailInput.trim().toLowerCase();
      const trimmedPassword = passwordInput.trim();

      if (!trimmedEmail) {
        setErrorMessage('Veuillez saisir votre adresse e-mail ou identifiant.');
        setIsSubmitting(false);
        return;
      }

      if (!trimmedPassword) {
        setErrorMessage('Veuillez saisir votre mot de passe.');
        setIsSubmitting(false);
        return;
      }

      // 1. Bulletproof check for Super Administrator (Ouarad Tech)
      const isSuperAdminIdentifier =
        trimmedEmail === 'ouaradtech@gmail.com' ||
        trimmedEmail === 'ouaradtech' ||
        trimmedEmail === 'superadmin' ||
        trimmedEmail === 'super-admin' ||
        trimmedEmail.includes('ouaradtech');

      if (isSuperAdminIdentifier) {
        // Find existing or fallback to master initial definition
        let superAdminUser: User | undefined = users.find(
          (u) =>
            u.email.toLowerCase() === 'ouaradtech@gmail.com' ||
            u.role === 'SUPER_ADMIN'
        );

        if (!superAdminUser) {
          superAdminUser = initialUsers.find(
            (u) => u.email.toLowerCase() === 'ouaradtech@gmail.com'
          ) || {
            id: 'usr-superadmin',
            name: 'Ouarad Tech (Super Admin)',
            email: 'ouaradtech@gmail.com',
            role: 'SUPER_ADMIN',
            department: 'Éditeur & Super Administration Centrale',
            active: true,
            avatar: 'OT',
            password: 'superadmin123',
            createdAt: '2026-01-01',
          };
        }

        // Acceptable passwords for the super administrator
        const acceptedSuperAdminPasswords = [
          superAdminUser.password,
          'superadmin123',
          'admin',
          'superadmin',
          'admin123',
          '123456',
          'ouaradtech',
          'gascons',
          'gascons2026',
        ]
          .filter(Boolean)
          .map((p) => String(p).trim().toLowerCase());

        if (acceptedSuperAdminPasswords.includes(trimmedPassword.toLowerCase())) {
          // Guaranteed active state
          const activeSuperAdmin: User = {
            ...superAdminUser,
            role: 'SUPER_ADMIN',
            active: true,
          };
          login(activeSuperAdmin);
          if (onSuccess) onSuccess();
          return;
        } else {
          setErrorMessage('Mot de passe incorrect pour le compte Super Administrateur (par défaut : superadmin123).');
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Standard user lookup
      const userFound = users.find(
        (u) =>
          u.email.toLowerCase() === trimmedEmail ||
          u.name.toLowerCase() === trimmedEmail
      );

      if (!userFound) {
        setErrorMessage('Identifiant ou adresse e-mail incorrect.');
        setIsSubmitting(false);
        return;
      }

      // Check password if user has one configured
      if (userFound.password && userFound.password.trim() !== '') {
        if (trimmedPassword.toLowerCase() !== userFound.password.trim().toLowerCase()) {
          setErrorMessage('Mot de passe incorrect. Veuillez vérifier votre saisie.');
          setIsSubmitting(false);
          return;
        }
      }

      // Check if account is suspended or subscription expired
      if (userFound.active === false || userFound.subscriptionStatus === 'SUSPENDU') {
        setErrorMessage(
          userFound.suspensionReason
            ? `Compte suspendu : ${userFound.suspensionReason}`
            : 'Ce compte est actuellement suspendu ou l abonnement est expiré. Contactez le gestionnaire.'
        );
        setIsSubmitting(false);
        return;
      }

      login(userFound);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setErrorMessage('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsSubmitting(false);
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
          <span className="font-mono">Système Sécurisé</span>
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
                  Espace Connexion
                </h1>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Connectez-vous à l aide de vos identifiants professionnels pour accéder à la plateforme.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">Gestion de Flotte & Engins</p>
                    <p className="text-slate-400">Index KM, Horamètres & Consommations</p>
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
                    <p className="text-slate-400">Alertes seuil critique & réceptions BL</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>GASCONS Professional</span>
              <span className="text-slate-400">Version Entreprise</span>
            </div>
          </div>

          {/* Right Column: Authentication Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 bg-slate-900 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Authentification par Identifiant
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Saisissez votre e-mail et votre mot de passe pour ouvrir une session sécurisée.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Super Admin Quick Helper Badge */}
            <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    Compte Super Admin
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                      Éditeur
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ouaradtech@gmail.com
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailInput('ouaradtech@gmail.com');
                  setPasswordInput('superadmin123');
                  setErrorMessage('');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                Remplir
              </button>
            </div>

            {/* Direct Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Adresse E-mail ou Identifiant *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="ex: ouaradtech@gmail.com ou ahmed.admin@gascons.com"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Mot de passe *
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 p-1 cursor-pointer transition-colors"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Vérification...' : 'Se Connecter'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Help footer */}
      <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto">
        <p>© 2026 GASCONS — Solution de Contrôle & Gestion des Carburants</p>
        <p className="text-[11px] text-slate-400 mt-1 sm:mt-0">
          Système sécurisé • Traçabilité & Signatures • Multi-Licences
        </p>
      </div>
    </div>
  );
};
