import React, { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  ChevronDown,
  Cloud,
  Database,
  Download,
  Droplet,
  Fuel,
  Gauge,
  Layers,
  Lock,
  LogOut,
  Menu,
  Plus,
  Shield,
  Truck,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const {
    companyProfile,
    currentStockLiters,
    stockPercentage,
    isLowStock,
    isCriticalStock,
    currentUser,
    users,
    setCurrentUser,
    firebaseStatus,
    supabaseStatus,
    firebaseAuthUser,
    signInWithGoogle,
    signOutFirebase,
    logout,
    isSuperAdmin,
    isFirebasePurged,
  } = useGascons();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
    } catch (err) {
      console.warn('Google sign-in cancelled or failed', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
    { id: 'sorties', label: 'Sorties Gasoil', icon: Fuel },
    { id: 'livraisons', label: 'Livraisons Fournisseurs', icon: Truck },
    { id: 'stock', label: 'Gestion Stock & Cuves', icon: Gauge },
    { id: 'rapports', label: 'Rapports & Export', icon: Layers },
    { id: 'base-donnees', label: 'Base de Données', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Company Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform overflow-hidden p-1">
                {companyProfile.logoUrl && companyProfile.logoUrl.startsWith('data:') ? (
                  <img
                    src={companyProfile.logoUrl}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Fuel className="w-5 h-5 text-slate-950" />
                )}
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-tight">
                  {companyProfile.name || 'GASCONS'}
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white uppercase tracking-wider">
                    Cloud
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block font-medium truncate max-w-[200px]">
                  {companyProfile.activity || 'Gestion Carburant & Flotte'}
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Area: Tank Status Badge + Supabase / Firebase Sync Badge + Quick Action + User Selector */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Supabase Status Badge */}
            <button
              onClick={() => onNavigate('base-donnees')}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-medium transition-all ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
              title={supabaseStatus === 'connected' ? 'Base Supabase connectée en temps réel' : 'Cliquer pour configurer Supabase'}
            >
              <Zap className={`w-3.5 h-3.5 ${supabaseStatus === 'connected' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="font-semibold">{supabaseStatus === 'connected' ? 'Supabase' : 'Supabase (Sync)'}</span>
            </button>

            {/* Quick Tank Gauge Indicator */}
            <button
              onClick={() => onNavigate('stock')}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                isCriticalStock
                  ? 'bg-red-950/60 border-red-500 text-red-300 animate-pulse'
                  : isLowStock
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600'
              }`}
            >
              <Droplet
                className={`w-3.5 h-3.5 ${
                  isCriticalStock
                    ? 'text-red-400'
                    : isLowStock
                    ? 'text-amber-400'
                    : 'text-blue-400'
                }`}
              />
              <span className="font-bold">
                {currentStockLiters.toLocaleString('fr-FR')} L
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-bold ${
                  isCriticalStock
                    ? 'bg-red-600 text-white'
                    : isLowStock
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {stockPercentage}%
              </span>
            </button>

            {/* Quick New Distribution Action Button */}
            <button
              onClick={() => onNavigate('nouvelle-sortie')}
              id="nav-quick-exit-btn"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs shadow-amber-500/20 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Sortie Gasoil</span>
            </button>

            {/* User Profile Selector & Google Auth Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                  currentUser.role === 'SUPER_ADMIN' || currentUser.email.toLowerCase() === 'ouaradtech@gmail.com'
                    ? 'bg-gradient-to-r from-purple-950 to-slate-900 border-purple-500/50 hover:border-purple-400 text-white'
                    : currentUser.role === 'SOUS_ADMIN'
                    ? 'bg-gradient-to-r from-amber-950 to-slate-900 border-amber-500/50 hover:border-amber-400 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs ${
                    currentUser.role === 'SUPER_ADMIN' || currentUser.email.toLowerCase() === 'ouaradtech@gmail.com'
                      ? 'bg-purple-600'
                      : currentUser.role === 'SOUS_ADMIN'
                      ? 'bg-amber-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {currentUser.role === 'SUPER_ADMIN' || currentUser.email.toLowerCase() === 'ouaradtech@gmail.com'
                    ? '👑'
                    : currentUser.avatar || currentUser.name[0]}
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-bold text-white leading-tight truncate max-w-[120px] flex items-center gap-1">
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        currentUser.active === false
                          ? 'bg-rose-500'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="font-semibold truncate max-w-[100px]">
                      {currentUser.role === 'SUPER_ADMIN' || currentUser.email.toLowerCase() === 'ouaradtech@gmail.com'
                        ? 'SUPER ADMIN'
                        : currentUser.role === 'SOUS_ADMIN'
                        ? `CLIENT (${currentUser.clientCompanyName || 'Sous-Admin'})`
                        : currentUser.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {/* User Switcher Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Compte Connecté</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isFirebasePurged
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-sky-100 text-sky-800 border border-sky-300'
                      }`}>
                        {isFirebasePurged ? 'Supabase Seul' : 'Sync Actif'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</p>
                      {currentUser.role === 'SOUS_ADMIN' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                          Sous-Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    {currentUser.clientCompanyName && (
                      <p className="text-[10px] text-amber-800 font-medium truncate mt-0.5">
                        🏢 {currentUser.clientCompanyName}
                      </p>
                    )}
                  </div>

                  {/* Google Auth Status Section */}
                  <div className="p-2 mb-1 bg-slate-50 rounded-xl border border-slate-100">
                    {firebaseAuthUser ? (
                      <div className="flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <p className="text-[10px] text-slate-500 font-medium">Connecté avec Google :</p>
                          <p className="font-bold text-slate-800 truncate text-[11px]">{firebaseAuthUser.email}</p>
                        </div>
                        <button
                          onClick={signOutFirebase}
                          className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700 flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" />
                          Déconnexion
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleGoogleLogin}
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-2 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                        <span>{isLoggingIn ? 'Connexion...' : 'Se connecter avec Google'}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      const isSuper = u.role === 'SUPER_ADMIN' || u.email.toLowerCase() === 'ouaradtech@gmail.com';
                      const isSous = u.role === 'SOUS_ADMIN';
                      const isSuspended = u.active === false || u.subscriptionStatus === 'SUSPENDU';

                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUser(u);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : isSuspended
                              ? 'bg-rose-50/50 hover:bg-rose-100/60 text-slate-700'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-left truncate">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isSuper
                                  ? 'bg-purple-900 text-amber-300'
                                  : isSous
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {isSuper ? '👑' : u.avatar || u.name[0]}
                            </span>
                            <div className="truncate">
                              <div className="font-semibold text-xs leading-tight truncate flex items-center gap-1">
                                <span>{u.name}</span>
                                {isSuspended && (
                                  <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-1 rounded">
                                    Désactivé
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {isSuper
                                  ? 'Super Administrateur'
                                  : isSous
                                  ? `Sous-Admin • ${u.clientCompanyName || 'Client'}`
                                  : u.role}
                              </div>
                            </div>
                          </div>
                          {isSelected && <span className="text-blue-600 font-bold shrink-0 ml-1">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 px-2 space-y-1">
                    <button
                      onClick={() => {
                        onNavigate('base-donnees');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left py-1 text-xs text-blue-600 hover:underline font-semibold flex items-center justify-between"
                    >
                      <span>Gérer les comptes & sous-admins</span>
                      <span>→</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-xs text-red-600 hover:bg-red-50 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Se déconnecter (Verrouiller)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onNavigate('nouvelle-sortie');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nouvelle Sortie de Gasoil</span>
            </button>
          </div>
        </div>
      )}

      {/* Global Suspension Alert for Suspended Sous-Admins */}
      {(currentUser.active === false || currentUser.subscriptionStatus === 'SUSPENDU') && (
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white px-4 py-2 text-xs font-semibold shadow-inner border-t border-rose-500/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-200 shrink-0 animate-pulse" />
            <span>
              <strong className="underline">COMPTE CLIENT SUSPENDU :</strong>{' '}
              {currentUser.suspensionReason
                ? currentUser.suspensionReason
                : 'Accès désactivé par l administrateur principal (OuaradTech).'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-rose-900/80 font-mono text-rose-200 border border-rose-500">
              Coupure Système Active
            </span>
            <span className="text-rose-100 hidden sm:inline">
              Veuillez contacter le support ou régler la souscription.
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
