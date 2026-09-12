import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Download,
  Edit2,
  FileCheck,
  FileSpreadsheet,
  Filter,
  Flame,
  Key,
  Layers,
  Lock,
  Pause,
  Play,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import {
  ClientSubscription,
  SubscriptionPaymentMethod,
  SubscriptionPlanType,
} from '../types';

interface ClientSubscriptionsViewProps {
  embedded?: boolean;
}

interface PlanPreset {
  type: SubscriptionPlanType;
  name: string;
  priceDHS: number;
  months: number;
  quota: number;
  popular?: boolean;
  features: string[];
}

const PLAN_PRESETS: PlanPreset[] = [
  {
    type: 'MENSUEL',
    name: 'Formule Starter',
    priceDHS: 450,
    months: 1,
    quota: 15,
    features: [
      "Jusqu'à 15 véhicules & engins",
      'Gestion cuve & réceptions gasoil',
      'Bons de sortie numérisés avec signature',
      'Exports rapports Excel',
    ],
  },
  {
    type: 'TRIMESTRIEL',
    name: 'Formule Trimestrielle',
    priceDHS: 1250,
    months: 3,
    quota: 30,
    features: [
      "Jusqu'à 30 véhicules & engins",
      'Gestion cuve & alertes stock critique',
      'Suivi révisions & entretiens mécaniques',
      'Sauvegarde automatique des données',
      'Assistance technique sous 24h',
    ],
  },
  {
    type: 'ANNUEL',
    name: 'Formule Annuelle Pro',
    priceDHS: 4500,
    months: 12,
    quota: 60,
    popular: true,
    features: [
      "Jusqu'à 60 véhicules & engins",
      'Économisez 900 DHS (2 mois offerts !)',
      'Multi-utilisateurs & sous-admins dédiés',
      'Suivi complet conso L/100km & heures',
      'Assistance technique prioritaire',
    ],
  },
  {
    type: 'ILLIMITE',
    name: 'Pack Entreprise Flotte Max',
    priceDHS: 8900,
    months: 12,
    quota: 999,
    features: [
      'Véhicules & engins illimités',
      'Multi-dépôts & cuves multiples',
      'Personnalisation complète logo & entête',
      'Sauvegarde cloud quotidienne',
      'Support dédié VIP 7j/7',
    ],
  },
];

export const ClientSubscriptionsView: React.FC<ClientSubscriptionsViewProps> = ({ embedded = false }) => {
  const {
    clientSubscriptions,
    addClientSubscription,
    updateClientSubscription,
    deleteClientSubscription,
    renewClientSubscription,
    toggleSubscriptionStatus,
    companyProfile,
    currentUser,
    users,
  } = useGascons();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIF' | 'SUSPENDU' | 'EXPIRE'>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<ClientSubscription | null>(null);
  const [selectedForInvoice, setSelectedForInvoice] = useState<ClientSubscription | null>(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewTargetSub, setRenewTargetSub] = useState<ClientSubscription | null>(null);
  const [renewMonths, setRenewMonths] = useState<number>(12);
  const [renewPrice, setRenewPrice] = useState<number>(4500);

  // Form State for Sell / Edit
  const [clientCompanyName, setClientCompanyName] = useState('');
  const [clientContactName, setClientContactName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientTaxId, setClientTaxId] = useState('');
  const [planType, setPlanType] = useState<SubscriptionPlanType>('ANNUEL');
  const [planName, setPlanName] = useState('Formule Annuelle Pro');
  const [priceDHS, setPriceDHS] = useState<number>(4500);
  const [maxVehiclesQuota, setMaxVehiclesQuota] = useState<number>(60);
  const [paymentMethod, setPaymentMethod] = useState<SubscriptionPaymentMethod>('VIREMENT');
  const [paymentReference, setPaymentReference] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<'ACTIF' | 'SUSPENDU'>('ACTIF');
  const [notes, setNotes] = useState('');
  const [createAccount, setCreateAccount] = useState(true);
  const [initialPassword, setInitialPassword] = useState('Client2026*');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Quick preset selector in Sell Modal
  const applyPreset = (preset: PlanPreset) => {
    setPlanType(preset.type);
    setPlanName(preset.name);
    setPriceDHS(preset.priceDHS);
    setMaxVehiclesQuota(preset.quota);

    const start = new Date(startDate || new Date());
    const end = new Date(start);
    end.setMonth(end.getMonth() + preset.months);
    setEndDate(end.toISOString().slice(0, 10));
  };

  const openNewModal = (preset?: PlanPreset) => {
    setEditingSub(null);
    setClientCompanyName('');
    setClientContactName('');
    setClientEmail('');
    setClientPhone('');
    setClientCity('Casablanca');
    setClientTaxId('');
    setPaymentMethod('VIREMENT');
    setPaymentReference('');
    setIsPaid(true);
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    setStartDate(today);

    if (preset) {
      applyPreset(preset);
    } else {
      const defaultPreset = PLAN_PRESETS[2]; // Pro Annuel
      applyPreset(defaultPreset);
    }

    setStatus('ACTIF');
    setNotes('');
    setCreateAccount(true);
    setInitialPassword('Client2026*');
    setFormError('');
    setFormSuccess('');
    setIsNewModalOpen(true);
  };

  const openEditModal = (sub: ClientSubscription) => {
    setEditingSub(sub);
    setClientCompanyName(sub.clientCompanyName);
    setClientContactName(sub.clientContactName);
    setClientEmail(sub.clientEmail);
    setClientPhone(sub.clientPhone || '');
    setClientCity(sub.clientCity || '');
    setClientTaxId(sub.clientTaxId || '');
    setPlanType(sub.planType);
    setPlanName(sub.planName);
    setPriceDHS(sub.priceDHS);
    setMaxVehiclesQuota(sub.maxVehiclesQuota);
    setPaymentMethod(sub.paymentMethod);
    setPaymentReference(sub.paymentReference || '');
    setIsPaid(sub.isPaid);
    setStartDate(sub.startDate);
    setEndDate(sub.endDate);
    setStatus(sub.status === 'EXPIRE' ? 'SUSPENDU' : sub.status);
    setNotes(sub.notes || '');
    setCreateAccount(false);
    setFormError('');
    setFormSuccess('');
    setIsNewModalOpen(true);
  };

  const openRenewModal = (sub: ClientSubscription) => {
    setRenewTargetSub(sub);
    setRenewMonths(sub.planType === 'MENSUEL' ? 1 : sub.planType === 'TRIMESTRIEL' ? 3 : 12);
    setRenewPrice(sub.priceDHS);
    setIsRenewModalOpen(true);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!clientCompanyName.trim()) {
      setFormError('Veuillez renseigner le nom de la société client');
      return;
    }
    if (!clientEmail.trim()) {
      setFormError("Veuillez renseigner l'adresse email du client");
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Veuillez renseigner la période de validité (début et fin)');
      return;
    }

    try {
      if (editingSub) {
        await updateClientSubscription(editingSub.id, {
          clientCompanyName: clientCompanyName.trim(),
          clientContactName: clientContactName.trim(),
          clientEmail: clientEmail.trim().toLowerCase(),
          clientPhone: clientPhone.trim(),
          clientCity: clientCity.trim(),
          clientTaxId: clientTaxId.trim(),
          planType,
          planName,
          priceDHS: Number(priceDHS),
          maxVehiclesQuota: Number(maxVehiclesQuota),
          paymentMethod,
          paymentReference: paymentReference.trim(),
          isPaid,
          startDate,
          endDate,
          status,
          notes: notes.trim(),
        });
        setFormSuccess('Abonnement client mis à jour avec succès !');
      } else {
        const created = await addClientSubscription(
          {
            clientCompanyName: clientCompanyName.trim(),
            clientContactName: clientContactName.trim(),
            clientEmail: clientEmail.trim().toLowerCase(),
            clientPhone: clientPhone.trim(),
            clientCity: clientCity.trim(),
            clientTaxId: clientTaxId.trim(),
            planType,
            planName,
            priceDHS: Number(priceDHS),
            maxVehiclesQuota: Number(maxVehiclesQuota),
            paymentMethod,
            paymentReference: paymentReference.trim(),
            isPaid,
            startDate,
            endDate,
            status,
            notes: notes.trim(),
          },
          createAccount,
          initialPassword
        );
        setFormSuccess(`Vente d'abonnement ${created.contractNumber} enregistrée avec succès !`);
      }

      setTimeout(() => {
        setIsNewModalOpen(false);
        setFormSuccess('');
      }, 700);
    } catch (err: any) {
      setFormError(err?.message || "Erreur lors de l'enregistrement de l'abonnement");
    }
  };

  const handleConfirmRenew = async () => {
    if (!renewTargetSub) return;
    try {
      await renewClientSubscription(renewTargetSub.id, Number(renewMonths), Number(renewPrice));
      setIsRenewModalOpen(false);
      setRenewTargetSub(null);
    } catch (err: any) {
      alert('Erreur renouvellement : ' + err?.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Confirmez-vous la suppression de l'abonnement client de "${name}" ?`)) {
      await deleteClientSubscription(id);
    }
  };

  // KPIs Calculations
  const stats = useMemo(() => {
    const totalRevenueDHS = clientSubscriptions
      .filter((s) => s.isPaid)
      .reduce((sum, s) => sum + (Number(s.priceDHS) || 0), 0);

    const activeCount = clientSubscriptions.filter((s) => s.status === 'ACTIF').length;
    const suspendedCount = clientSubscriptions.filter((s) => s.status === 'SUSPENDU').length;

    const now = new Date();
    const expiringSoonCount = clientSubscriptions.filter((s) => {
      if (s.status !== 'ACTIF') return false;
      const end = new Date(s.endDate);
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 15;
    }).length;

    const totalVehiclesQuota = clientSubscriptions.reduce(
      (sum, s) => sum + (s.status === 'ACTIF' ? Number(s.maxVehiclesQuota) || 0 : 0),
      0
    );

    return {
      totalRevenueDHS,
      activeCount,
      suspendedCount,
      expiringSoonCount,
      totalVehiclesQuota,
    };
  }, [clientSubscriptions]);

  // Filtered List
  const filteredSubscriptions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const now = new Date();

    return clientSubscriptions.filter((sub) => {
      const matchesSearch =
        !term ||
        sub.contractNumber.toLowerCase().includes(term) ||
        sub.clientCompanyName.toLowerCase().includes(term) ||
        sub.clientContactName.toLowerCase().includes(term) ||
        sub.clientEmail.toLowerCase().includes(term) ||
        (sub.clientCity && sub.clientCity.toLowerCase().includes(term)) ||
        (sub.paymentReference && sub.paymentReference.toLowerCase().includes(term));

      const isExpiredByDate = new Date(sub.endDate) < now;
      const effectiveStatus = isExpiredByDate ? 'EXPIRE' : sub.status;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'EXPIRE' && isExpiredByDate) ||
        (statusFilter === 'ACTIF' && sub.status === 'ACTIF' && !isExpiredByDate) ||
        (statusFilter === 'SUSPENDU' && sub.status === 'SUSPENDU');

      const matchesPlan = planFilter === 'ALL' || sub.planType === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [clientSubscriptions, searchTerm, statusFilter, planFilter]);

  return (
    <div className={`space-y-6 ${embedded ? '' : 'animate-in fade-in'}`}>
      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 rounded-3xl text-white shadow-xl border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight text-white">
                  Vente & Gestion des Abonnements Clients
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/50">
                  Tarification en Dirhams (DHS)
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Commercialisation des licences de la plateforme Gascons, quotas de flotte, facturation & contrats clients
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-stretch md:self-auto">
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isCatalogOpen ? 'Masquer Catalogue' : 'Catalogue des Formules'}</span>
          </button>

          <button
            onClick={() => openNewModal()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Vendre un Abonnement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total DHS Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chiffre d'Affaires Encaissé</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {stats.totalRevenueDHS.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-emerald-600">DHS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total des abonnements réglés par les clients
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Abonnements Actifs</p>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{stats.activeCount}</span>
            <span className="text-xs text-slate-500">licences clientes actives</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.suspendedCount} abonnement(s) suspendu(s)
          </p>
        </div>

        {/* Vehicles Quota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flotte Véhicules Allouée</p>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">{stats.totalVehiclesQuota}</span>
            <span className="text-xs text-slate-500">véhicules autorisés</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sur l'ensemble des licences en cours
          </p>
        </div>

        {/* Alerts / Renewals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Échéances & Relances</p>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{stats.expiringSoonCount}</span>
            <span className="text-xs text-slate-500">à renouveler (&lt; 15j)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Pensez à éditer la facture de renouvellement
          </p>
        </div>
      </div>

      {/* Commercial Plans Matrix (Collapsible or visible) */}
      {isCatalogOpen && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Catalogue Officiel des Tarifs & Packs Gascons (DHS)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cliquez sur « Vendre ce pack » pour pré-remplir le contrat client en 1 clic
              </p>
            </div>
            <button
              onClick={() => setIsCatalogOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLAN_PRESETS.map((preset) => (
              <div
                key={preset.type}
                className={`p-5 rounded-2xl flex flex-col justify-between border relative transition-all ${
                  preset.popular
                    ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                }`}
              >
                {preset.popular && (
                  <span className="absolute -top-2.5 right-4 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-md">
                    Le Plus Vendu ⭐
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-sm text-white">{preset.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-amber-400">
                      {preset.priceDHS.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      DHS / {preset.months === 1 ? 'mois' : preset.months === 3 ? '3 mois' : 'an'}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-300 mt-1">
                    Quota : {preset.quota === 999 ? 'Flotte Illimitée' : `Jusqu'à ${preset.quota} véhicules`}
                  </p>

                  <ul className="mt-4 space-y-2 text-[11px] text-slate-300 border-t border-slate-700/60 pt-3">
                    {preset.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => openNewModal(preset)}
                  className={`mt-5 w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    preset.popular
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Vendre ce Pack</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par société, contact, e-mail, N° contrat..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Tous ({clientSubscriptions.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIF')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'ACTIF' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-emerald-700'
                }`}
              >
                Actifs ({stats.activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('SUSPENDU')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'SUSPENDU' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'hover:text-rose-700'
                }`}
              >
                Suspendus ({stats.suspendedCount})
              </button>
              <button
                onClick={() => setStatusFilter('EXPIRE')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'EXPIRE' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'hover:text-amber-700'
                }`}
              >
                Expirés
              </button>
            </div>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Toutes formules</option>
              <option value="MENSUEL">Mensuel</option>
              <option value="TRIMESTRIEL">Trimestriel</option>
              <option value="ANNUEL">Annuel</option>
              <option value="ILLIMITE">Illimité</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100 tracking-wider">
              <tr>
                <th className="py-3 px-4">N° Contrat</th>
                <th className="py-3 px-4">Client & Entreprise</th>
                <th className="py-3 px-4">Formule & Quota</th>
                <th className="py-3 px-4">Montant (DHS)</th>
                <th className="py-3 px-4">Période & Échéance</th>
                <th className="py-3 px-4">Statut Licence</th>
                <th className="py-3 px-4 text-right">Actions Commerciales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Aucun abonnement client trouvé</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cliquez sur « + Vendre un Abonnement » pour créer un nouveau contrat client
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const now = new Date();
                  const end = new Date(sub.endDate);
                  const isExpired = end < now;
                  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = !isExpired && diffDays <= 15;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Contract Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-500" />
                          <span>{sub.contractNumber}</span>
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-xs">{sub.clientCompanyName}</p>
                        <p className="text-[11px] text-slate-500">{sub.clientContactName} • {sub.clientEmail}</p>
                        {sub.clientPhone && (
                          <p className="text-[10px] text-slate-400">{sub.clientPhone} {sub.clientCity && `• ${sub.clientCity}`}</p>
                        )}
                      </td>

                      {/* Plan and Quota */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {sub.planName}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                          Quota : <strong className="text-slate-800">{sub.maxVehiclesQuota} véhicules max</strong>
                        </p>
                      </td>

                      {/* Amount and Payment Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1 font-black text-slate-900">
                          <span>{sub.priceDHS.toLocaleString('fr-FR')}</span>
                          <span className="text-[10px] font-bold text-amber-700">DHS</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              sub.isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sub.isPaid ? 'RÉGLÉ' : 'EN ATTENTE'}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase">({sub.paymentMethod})</span>
                        </div>
                      </td>

                      {/* Dates & Expiration */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="text-slate-400">Du : </span>
                          <span className="font-medium text-slate-700">{sub.startDate}</span>
                        </div>
                        <div className="text-[11px] mt-0.5">
                          <span className="text-slate-400">Au : </span>
                          <strong className="text-slate-900 font-bold">{sub.endDate}</strong>
                        </div>
                        {isExpired ? (
                          <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                            Expiré depuis {Math.abs(diffDays)} j
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 animate-pulse">
                            Expire dans {diffDays} j
                          </span>
                        ) : (
                          <span className="inline-block mt-1 text-[9px] font-medium text-emerald-700">
                            Valide encore {diffDays} j
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            sub.status === 'ACTIF' && !isExpired
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'ACTIF' && !isExpired ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          {sub.status === 'ACTIF' && !isExpired ? 'ACTIF' : 'SUSPENDU'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {/* Invoice & Certificate */}
                        <button
                          onClick={() => setSelectedForInvoice(sub)}
                          title="Imprimer Attestation de Vente / Facture Pro-Forma"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-slate-700" />
                        </button>

                        {/* Renew */}
                        <button
                          onClick={() => openRenewModal(sub)}
                          title="Prolonger / Renouveler l'abonnement"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4 text-emerald-600" />
                        </button>

                        {/* Toggle Suspend / Active */}
                        <button
                          onClick={() =>
                            toggleSubscriptionStatus(
                              sub.id,
                              sub.status === 'ACTIF' ? 'SUSPENDU' : 'ACTIF'
                            )
                          }
                          title={sub.status === 'ACTIF' ? 'Suspendre la licence' : 'Réactiver la licence'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            sub.status === 'ACTIF'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                          }`}
                        >
                          {sub.status === 'ACTIF' ? (
                            <Pause className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Play className="w-4 h-4 text-blue-600" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(sub)}
                          title="Modifier le contrat"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(sub.id, sub.clientCompanyName)}
                          title="Supprimer ce contrat"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Vendre un Nouvel Abonnement / Modifier */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editingSub ? "Modifier le Contrat d'Abonnement" : "Vendre un Nouvel Abonnement Client"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Émission de licence logicielle Gascons, quota de flotte et compte sous-admin en Dirhams (DHS)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubscription} className="mt-5 space-y-5">
              {/* Presets Quick Selector */}
              {!editingSub && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sélection Rapide de la Formule :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PLAN_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.type}
                        onClick={() => applyPreset(p)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          planType === p.type
                            ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-400'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-[11px] font-black text-amber-700 mt-0.5">{p.priceDHS} DHS</p>
                        <p className="text-[10px] text-slate-500">{p.quota} véh. max</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 1: Informations Client */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  1. Informations sur le Client & l'Entreprise
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Raison Sociale / Entreprise Client *
                    </label>
                    <input
                      type="text"
                      value={clientCompanyName}
                      onChange={(e) => setClientCompanyName(e.target.value)}
                      placeholder="ex: Sarl Transport Atlas Express"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Nom du Dirigeant / Contact Responsable
                    </label>
                    <input
                      type="text"
                      value={clientContactName}
                      onChange={(e) => setClientContactName(e.target.value)}
                      placeholder="ex: M. Yacine Belkacem"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Adresse E-mail Client (Sert d'identifiant de connexion) *
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="ex: yacine@transport-atlas.ma"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Téléphone de Contact
                    </label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="ex: +212 661 22 33 44"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Ville / Dépôt
                    </label>
                    <input
                      type="text"
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      placeholder="ex: Casablanca, Tanger, Rabat..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Identifiant Fiscal (ICE / RC)
                    </label>
                    <input
                      type="text"
                      value={clientTaxId}
                      onChange={(e) => setClientTaxId(e.target.value)}
                      placeholder="ex: ICE 002345678000091"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Formule & Tarification en DHS */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" />
                  2. Formule & Tarification en Dirhams (DHS)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Type de Licence
                    </label>
                    <select
                      value={planType}
                      onChange={(e) => {
                        const newType = e.target.value as SubscriptionPlanType;
                        setPlanType(newType);
                        const match = PLAN_PRESETS.find((p) => p.type === newType);
                        if (match) applyPreset(match);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    >
                      <option value="MENSUEL">Mensuel (1 mois)</option>
                      <option value="TRIMESTRIEL">Trimestriel (3 mois)</option>
                      <option value="ANNUEL">Annuel (12 mois)</option>
                      <option value="ILLIMITE">Entreprise Illimité</option>
                      <option value="SUR_MESURE">Sur-Mesure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Prix de Vente Convenant (DHS) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={priceDHS}
                        onChange={(e) => setPriceDHS(Number(e.target.value))}
                        required
                        className="w-full pr-12 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-bold text-amber-700">
                        DHS
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Quota Flotte Véhicules Max *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxVehiclesQuota}
                      onChange={(e) => setMaxVehiclesQuota(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mode de Règlement
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as SubscriptionPaymentMethod)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                    >
                      <option value="VIREMENT">Virement Bancaire</option>
                      <option value="CHEQUE">Chèque</option>
                      <option value="ESPECES">Espèces</option>
                      <option value="CARTE">Carte Bancaire</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      N° Référence Transaction / Chèque
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="ex: VIR-BMCE-2026 / CHQ-4490"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Statut d'Encaissement
                    </label>
                    <select
                      value={isPaid ? 'PAID' : 'PENDING'}
                      onChange={(e) => setIsPaid(e.target.value === 'PAID')}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="PAID">Payé / Encaissé</option>
                      <option value="PENDING">En attente de règlement</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Dates de validité & Statut */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  3. Période de Validité de la Licence
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Date de Début *
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Date d'Échéance *
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      État de la Licence
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="ACTIF">Active (Accès autorisé)</option>
                      <option value="SUSPENDU">Suspendue (Accès verrouillé)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Création Automatique du Compte Sous-Admin Client */}
              {!editingSub && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-blue-700" />
                      <span className="text-xs font-bold text-blue-900">
                        Créer immédiatement les identifiants de connexion pour le client
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      id="createAccountCheckbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  {createAccount && (
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Identifiant de connexion :
                        </label>
                        <input
                          type="text"
                          disabled
                          value={clientEmail || "Renseignez l'email ci-dessus"}
                          className="w-full px-3 py-1.5 bg-white/70 border border-slate-300 rounded-xl text-xs text-slate-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Mot de passe initial fourni au client :
                        </label>
                        <input
                          type="text"
                          value={initialPassword}
                          onChange={(e) => setInitialPassword(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-xl text-xs font-mono font-bold text-blue-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notes & Conditions Particulières du Contrat
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex: Contrat annuel réglé en 2 fois. Contact commercial Gascons."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{editingSub ? 'Enregistrer les Modifications' : "Valider la Vente d'Abonnement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Prolonger / Renouveler l'abonnement */}
      {isRenewModalOpen && renewTargetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Renouveler l'Abonnement</h3>
                  <p className="text-[11px] text-slate-500">{renewTargetSub.clientCompanyName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-600">
                L'échéance actuelle est fixée au <strong className="text-slate-900">{renewTargetSub.endDate}</strong>.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Durée de Prolongation :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRenewMonths(1);
                      setRenewPrice(450);
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-xs ${
                      renewMonths === 1 ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    + 1 Mois
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenewMonths(3);
                      setRenewPrice(1250);
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-xs ${
                      renewMonths === 3 ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    + 3 Mois
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenewMonths(12);
                      setRenewPrice(4500);
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-xs ${
                      renewMonths === 12 ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    + 1 An (12 m)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Montant Encaissé (DHS) :
                </label>
                <input
                  type="number"
                  value={renewPrice}
                  onChange={(e) => setRenewPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                ✓ La licence sera réactivée immédiatement et le compte sous-admin du client restera ouvert.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmRenew}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider le Renouvellement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Attestation de Vente / Facture Pro-Forma (Imprimable) */}
      {selectedForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 border border-slate-200 shadow-2xl my-8 text-slate-800 printable-area">
            {/* Action Bar (Screen Only) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-sm text-slate-900">
                  Attestation Officielle de Licence & Reçu de Vente
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Reçu</span>
                </button>
                <button
                  onClick={() => setSelectedForInvoice(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Printable Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  {companyProfile.name || 'GASCONS'}
                </h1>
                <p className="text-xs font-semibold text-amber-800 mt-0.5">
                  Solution de Contrôle, Gestion de Gasoil & Flotte
                </p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                  {companyProfile.address} • {companyProfile.city} • {companyProfile.phone}
                </p>
                {companyProfile.taxId && (
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{companyProfile.taxId}</p>
                )}
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-bold text-xs">
                  CONTRAT DE LICENCE
                </div>
                <p className="font-mono font-black text-sm text-slate-900 mt-2">
                  {selectedForInvoice.contractNumber}
                </p>
                <p className="text-[10px] text-slate-500">
                  Date : {new Date(selectedForInvoice.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Client Recipient Card */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Titulaire de la Licence :</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {selectedForInvoice.clientCompanyName}
                </p>
                <p className="text-slate-600 mt-0.5">{selectedForInvoice.clientContactName}</p>
                <p className="text-slate-500">{selectedForInvoice.clientEmail}</p>
                {selectedForInvoice.clientPhone && (
                  <p className="text-slate-500">{selectedForInvoice.clientPhone}</p>
                )}
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Identifiants Client :</p>
                {selectedForInvoice.clientCity && (
                  <p className="text-slate-700 font-medium mt-0.5">Ville : {selectedForInvoice.clientCity}</p>
                )}
                {selectedForInvoice.clientTaxId && (
                  <p className="text-slate-700 font-mono mt-0.5">{selectedForInvoice.clientTaxId}</p>
                )}
                <p className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 inline-block px-2 py-0.5 rounded">
                  Licence Validée & Conforme
                </p>
              </div>
            </div>

            {/* License Breakdown Table */}
            <div className="mt-6 border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Désignation de la Licence</th>
                    <th className="py-2.5 px-4">Quota Flotte</th>
                    <th className="py-2.5 px-4">Validité</th>
                    <th className="py-2.5 px-4 text-right">Montant (DHS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{selectedForInvoice.planName}</p>
                      <p className="text-[10px] text-slate-500">
                        Accès plateforme Gascons Cloud • Suivi stock cuves & bons de sortie
                      </p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {selectedForInvoice.maxVehiclesQuota} véhicules
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      {selectedForInvoice.startDate} au {selectedForInvoice.endDate}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-950">
                      {selectedForInvoice.priceDHS.toLocaleString('fr-FR')} DHS
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-4 text-right uppercase text-[11px]">
                      Total Net Réglé :
                    </td>
                    <td className="py-2.5 px-4 text-right text-base font-black text-amber-700">
                      {selectedForInvoice.priceDHS.toLocaleString('fr-FR')} DHS
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Settlement Details */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">Mode de paiement : </span>
                <strong className="text-slate-800">{selectedForInvoice.paymentMethod}</strong>
                {selectedForInvoice.paymentReference && (
                  <span className="text-slate-500 ml-2">(Réf: {selectedForInvoice.paymentReference})</span>
                )}
              </div>
              <div>
                <span className="text-slate-500">Statut : </span>
                <span className={`font-bold ${selectedForInvoice.isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedForInvoice.isPaid ? 'Acquitté & Réglé' : 'En attente de paiement'}
                </span>
              </div>
            </div>

            {/* Signatures & Stamp */}
            <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
              <div className="text-center p-3 border border-dashed border-slate-300 rounded-xl min-h-[90px] flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pour le Client (Bon pour Accord) :</p>
                <p className="text-[11px] text-slate-600 font-semibold">{selectedForInvoice.clientContactName}</p>
              </div>

              <div className="text-center p-3 border border-dashed border-slate-300 rounded-xl min-h-[90px] flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cachet & Visa de la Direction Gascons :</p>
                <div className="text-[10px] text-amber-800 font-mono">
                  [Certifié Conforme • Licence Officielle Gascons]
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
