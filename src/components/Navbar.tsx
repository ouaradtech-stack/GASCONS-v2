import React, { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  ChevronDown,
  Cloud,
  CreditCard,
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
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, subTab?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const {
    companyProfile,
    currentStockLiters,
    stockPercentage,
    isLowStock,
    isCriticalStock,
    currentUser,
    logout,
    isSuperAdmin,
    isFirebasePurged,
    vehicleMaintenances,
    clientSubscriptions,
  } = useGascons();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdminOrSuper = isSuperAdmin || currentUser.role === 'ADMIN';

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
    { id: 'sorties', label: 'Sorties Gasoil', icon: Fuel },
    { id: 'livraisons', label: 'Livraisons Fournisseurs', icon: Truck },
    { id: 'stock', label: 'Gestion Stock & Cuves', icon: Gauge },
    { id: 'maintenance', label: 'Entretien & Maintenance', icon: Wrench },
    { id: 'rapports', label: 'Rapports & Export', icon: Layers },
    ...(isSuperAdmin
      ? [{ id: 'abonnements', label: 'Vente Abonnements', icon: CreditCard }]
      : []),
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

          {/* Right Area: Tank Status Badge + Quick Action + User Selector */}
          <div className="flex items-center gap-2.5 sm:gap-3">
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

              {/* User Dropdown Menu (No Google OAuth, No account switching) */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in">
                  <div className="pb-3 border-b border-slate-100 mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Compte Connecté</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isFirebasePurged
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {isFirebasePurged ? 'Base Locale / Supabase' : 'Sync Sécurisée'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-md shrink-0">
                        {isSuperAdmin ? '👑' : currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            isSuperAdmin
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : currentUser.role === 'SOUS_ADMIN'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {isSuperAdmin
                              ? 'Super-Admin'
                              : currentUser.role === 'SOUS_ADMIN'
                              ? 'Sous-Admin'
                              : currentUser.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                        {currentUser.clientCompanyName && (
                          <p className="text-[11px] font-medium text-amber-800 truncate mt-0.5">
                            🏢 {currentUser.clientCompanyName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subscription details if client / sous-admin */}
                    {(currentUser.role === 'SOUS_ADMIN' || currentUser.subscriptionStatus) && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-amber-900">Licence Client</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            currentUser.subscriptionStatus === 'ACTIF' || currentUser.active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {currentUser.subscriptionStatus === 'ACTIF' || currentUser.active ? 'Active' : 'Suspendue'}
                          </span>
                        </div>
                        {currentUser.maxVehiclesQuota && (
                          <p className="text-[11px] text-slate-700">
                            Quota : <strong className="text-slate-900">{currentUser.maxVehiclesQuota} véhicules max</strong>
                          </p>
                        )}
                        {currentUser.subscriptionExpiresAt && (
                          <p className="text-[11px] text-slate-700">
                            Échéance : <strong className="text-slate-900">{currentUser.subscriptionExpiresAt}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation Actions */}
                  <div className="space-y-1">
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('abonnements');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-2 px-2.5 rounded-xl text-xs text-amber-900 hover:bg-amber-50 font-bold flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-amber-600" />
                          Ventes & Abonnements Clients
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full font-mono">
                          {clientSubscriptions.length}
                        </span>
                      </button>
                    )}

                    {isAdminOrSuper && (
                      <button
                        onClick={() => {
                          onNavigate('base-donnees', 'users');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-2 px-2.5 rounded-xl text-xs text-blue-700 hover:bg-blue-50 font-bold flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Gérer les Comptes & Accès
                        </span>
                        <span className="font-mono text-slate-400">→</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left py-2 px-2.5 rounded-xl text-xs text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 transition-colors cursor-pointer pt-2 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Se Déconnecter (Verrouiller)</span>
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
