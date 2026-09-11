import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Printer,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Truck,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import {
  MaintenanceServiceType,
  MaintenanceStatus,
  Vehicle,
  VehicleMaintenance,
} from '../types';
import {
  downloadMaintenanceOrderHTML,
  exportMaintenancesToCSV,
} from '../utils/exportHelpers';
import { MaintenanceOrderModal } from './MaintenanceOrderModal';

const SERVICE_TYPE_LABELS: Record<MaintenanceServiceType, { label: string; color: string }> = {
  VIDANGE: { label: 'Vidange & Huile', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  FILTRES: { label: 'Filtres & Décanteurs', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  FREINAGE: { label: 'Freinage & Plaquettes', color: 'bg-red-100 text-red-800 border-red-300' },
  PNEUMATIQUES: { label: 'Pneumatiques & Géométrie', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  REVISION: { label: 'Grande Révision', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  CONTROLE_TECHNIQUE: { label: 'Contrôle Technique', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  DISTRIBUTION: { label: 'Distribution & Courroies', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  BATTERIE: { label: 'Batterie & Électrique', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
  SUSPENSION: { label: 'Suspension & Direction', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  CLIMATISATION: { label: 'Climatisation', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  REPARATION_MECANIQUE: { label: 'Réparation Mécanique', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  LAVAGE_NETTOYAGE: { label: 'Lavage & Graissage', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  AUTRE: { label: 'Autre Intervention', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' },
};

export const VehicleMaintenanceView: React.FC = () => {
  const {
    vehicleMaintenances,
    addVehicleMaintenance,
    updateVehicleMaintenance,
    deleteVehicleMaintenance,
    vehicles,
    getVehicleById,
    getCategoryById,
    companyProfile,
    currentUser,
  } = useGascons();

  const currency = companyProfile.currency || 'DHS';

  // Navigation sub-tabs inside Maintenance
  const [activeTab, setActiveTab] = useState<'all' | 'schedule' | 'by-vehicle'>('all');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<VehicleMaintenance | null>(null);
  const [viewingMaintenance, setViewingMaintenance] = useState<VehicleMaintenance | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formServiceType, setFormServiceType] = useState<MaintenanceServiceType>('VIDANGE');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formTime, setFormTime] = useState('08:30');
  const [formCurrentReading, setFormCurrentReading] = useState<number>(0);
  const [formNextDueReading, setFormNextDueReading] = useState<string>('');
  const [formNextDueDate, setFormNextDueDate] = useState<string>('');
  const [formCost, setFormCost] = useState<number>(0);
  const [formProvider, setFormProvider] = useState('Atelier Interne');
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formTechnicianName, setFormTechnicianName] = useState('');
  const [formStatus, setFormStatus] = useState<MaintenanceStatus>('TERMINE');
  const [formPartsReplaced, setFormPartsReplaced] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Selected vehicle in "by-vehicle" view
  const [detailVehicleId, setDetailVehicleId] = useState<string>(vehicles[0]?.id || '');

  // Open Form for Adding
  const handleOpenAdd = () => {
    setEditingMaintenance(null);
    const defaultVeh = vehicles[0];
    const initialVehId = defaultVeh ? defaultVeh.id : '';
    setFormVehicleId(initialVehId);
    setFormServiceType('VIDANGE');
    setFormTitle('Vidange Moteur & Remplacement Filtres');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTime('09:00');
    setFormCurrentReading(defaultVeh ? defaultVeh.currentReading || 0 : 0);

    // Suggest next reading
    if (defaultVeh) {
      const step = defaultVeh.unitType === 'HEURES' ? 250 : 10000;
      setFormNextDueReading(String((defaultVeh.currentReading || 0) + step));
    } else {
      setFormNextDueReading('');
    }

    // Suggest next date (+6 months)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 6);
    setFormNextDueDate(nextDate.toISOString().slice(0, 10));

    setFormCost(250);
    setFormProvider('Atelier Interne');
    setFormInvoiceNumber('');
    setFormTechnicianName(currentUser.name);
    setFormStatus('TERMINE');
    setFormPartsReplaced('Huile 15W40, Filtre à huile, Filtre à gasoil');
    setFormNotes('Vérification générale des niveaux et points de graissage.');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (maint: VehicleMaintenance) => {
    setEditingMaintenance(maint);
    setFormVehicleId(maint.vehicleId);
    setFormServiceType(maint.serviceType);
    setFormTitle(maint.title);
    setFormDate(maint.date);
    setFormTime(maint.time || '08:00');
    setFormCurrentReading(maint.currentReading);
    setFormNextDueReading(maint.nextDueReading ? String(maint.nextDueReading) : '');
    setFormNextDueDate(maint.nextDueDate || '');
    setFormCost(maint.cost);
    setFormProvider(maint.provider || '');
    setFormInvoiceNumber(maint.invoiceNumber || '');
    setFormTechnicianName(maint.technicianName || '');
    setFormStatus(maint.status);
    setFormPartsReplaced(maint.partsReplaced || '');
    setFormNotes(maint.notes || '');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Change Vehicle in Form (auto-fills current reading and suggests next due)
  const handleFormVehicleChange = (vehId: string) => {
    setFormVehicleId(vehId);
    const veh = getVehicleById(vehId);
    if (veh) {
      const curr = veh.currentReading || 0;
      setFormCurrentReading(curr);
      const step = veh.unitType === 'HEURES' ? 250 : 10000;
      setFormNextDueReading(String(curr + step));
    }
  };

  // Form Submit Handler
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVehicleId) {
      setFormError('Veuillez sélectionner un véhicule.');
      return;
    }
    if (!formTitle.trim()) {
      setFormError('Veuillez renseigner le titre ou motif de l intervention.');
      return;
    }
    if (!formDate) {
      setFormError('Veuillez spécifier la date de l intervention.');
      return;
    }

    const payload = {
      vehicleId: formVehicleId,
      serviceType: formServiceType,
      title: formTitle.trim(),
      date: formDate,
      time: formTime,
      currentReading: Number(formCurrentReading) || 0,
      nextDueReading: formNextDueReading ? Number(formNextDueReading) : undefined,
      nextDueDate: formNextDueDate || undefined,
      cost: Math.max(0, Number(formCost) || 0),
      provider: formProvider.trim() || 'Atelier Interne',
      invoiceNumber: formInvoiceNumber.trim() || undefined,
      technicianName: formTechnicianName.trim() || undefined,
      status: formStatus,
      partsReplaced: formPartsReplaced.trim() || undefined,
      notes: formNotes.trim() || undefined,
    };

    if (editingMaintenance) {
      updateVehicleMaintenance(editingMaintenance.id, payload);
    } else {
      addVehicleMaintenance(payload);
    }

    setIsFormModalOpen(false);
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteVehicleMaintenance(deletingId);
      setDeletingId(null);
    }
  };

  // Filtered Maintenances
  const filteredMaintenances = useMemo(() => {
    return vehicleMaintenances.filter((m) => {
      if (selectedVehicleId !== 'ALL' && m.vehicleId !== selectedVehicleId) return false;
      if (selectedType !== 'ALL' && m.serviceType !== selectedType) return false;
      if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const veh = getVehicleById(m.vehicleId);
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchNum = m.maintenanceNumber.toLowerCase().includes(q);
        const matchVeh = veh?.code.toLowerCase().includes(q) || veh?.plateNumber.toLowerCase().includes(q) || veh?.name.toLowerCase().includes(q);
        const matchProvider = (m.provider || '').toLowerCase().includes(q);
        const matchInvoice = (m.invoiceNumber || '').toLowerCase().includes(q);
        const matchTech = (m.technicianName || '').toLowerCase().includes(q);
        const matchParts = (m.partsReplaced || '').toLowerCase().includes(q);
        if (!matchTitle && !matchNum && !matchVeh && !matchProvider && !matchInvoice && !matchTech && !matchParts) {
          return false;
        }
      }
      return true;
    });
  }, [vehicleMaintenances, selectedVehicleId, selectedType, selectedStatus, searchQuery, getVehicleById]);

  // Maintenance Statistics & Alerts
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let totalSpend = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let plannedCount = 0;
    let overdueAlerts = 0;
    let upcomingAlerts = 0;

    vehicleMaintenances.forEach((m) => {
      totalSpend += Number(m.cost) || 0;
      if (m.status === 'TERMINE') completedCount++;
      if (m.status === 'EN_COURS') inProgressCount++;
      if (m.status === 'PLANIFIE') plannedCount++;

      // Check preventive alerts
      const veh = getVehicleById(m.vehicleId);
      if (veh) {
        const curr = veh.currentReading || 0;
        const isKm = veh.unitType === 'KM';
        const warningMargin = isKm ? 1000 : 50; // 1000 km or 50 hours

        const readingOverdue = m.nextDueReading && curr >= m.nextDueReading;
        const dateOverdue = m.nextDueDate && m.nextDueDate < today && m.status !== 'TERMINE';

        const readingUpcoming = m.nextDueReading && curr >= (m.nextDueReading - warningMargin) && curr < m.nextDueReading;

        if (readingOverdue || dateOverdue) {
          overdueAlerts++;
        } else if (readingUpcoming) {
          upcomingAlerts++;
        }
      }
    });

    const activeVehiclesInShop = vehicles.filter((v) => v.status === 'EN_MAINTENANCE').length;

    return {
      totalCount: vehicleMaintenances.length,
      totalSpend,
      completedCount,
      inProgressCount,
      plannedCount,
      overdueAlerts,
      upcomingAlerts,
      activeVehiclesInShop,
    };
  }, [vehicleMaintenances, vehicles, getVehicleById]);

  // Schedule Alerts List (Interventions with nextDueReading or nextDueDate)
  const scheduledAlerts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return vehicleMaintenances
      .filter((m) => m.nextDueReading || m.nextDueDate)
      .map((m) => {
        const veh = getVehicleById(m.vehicleId);
        const curr = veh ? veh.currentReading || 0 : 0;
        const unit = veh?.unitType || 'KM';
        const warningMargin = unit === 'KM' ? 1000 : 50;

        let isOverdue = false;
        let isClose = false;
        let delta = 0;

        if (m.nextDueReading) {
          delta = m.nextDueReading - curr;
          if (delta <= 0) isOverdue = true;
          else if (delta <= warningMargin) isClose = true;
        }

        if (m.nextDueDate) {
          if (m.nextDueDate < today && m.status !== 'TERMINE') {
            isOverdue = true;
          } else if (m.nextDueDate <= new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)) {
            isClose = true;
          }
        }

        return {
          maintenance: m,
          vehicle: veh,
          currentReading: curr,
          unit,
          delta,
          isOverdue,
          isClose,
        };
      })
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        if (a.isClose && !b.isClose) return -1;
        if (!a.isClose && b.isClose) return 1;
        return a.delta - b.delta;
      });
  }, [vehicleMaintenances, getVehicleById]);

  // Current vehicle details for "by-vehicle" view
  const detailVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === detailVehicleId) || vehicles[0];
  }, [vehicles, detailVehicleId]);

  const vehicleHistory = useMemo(() => {
    if (!detailVehicle) return [];
    return vehicleMaintenances.filter((m) => m.vehicleId === detailVehicle.id);
  }, [vehicleMaintenances, detailVehicle]);

  const vehicleSpend = useMemo(() => {
    return vehicleHistory.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
  }, [vehicleHistory]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xs">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>Gestion Entretien & Maintenance des Véhicules</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {vehicleMaintenances.length} Dossiers
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Suivi des vidanges, révisions, pneumatiques, contrôles techniques, coûts d atelier et alertes kilométriques
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                exportMaintenancesToCSV(
                  filteredMaintenances,
                  getVehicleById,
                  getCategoryById,
                  currency
                )
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Exporter le registre d'entretien au format Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exporter CSV / Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Imprimer le registre d'entretien"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={handleOpenAdd}
              id="btn-add-maintenance"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nouvelle Intervention</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Dépensé</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {stats.totalSpend.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-500">{currency}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Sur l'ensemble de la flotte</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-400">Interventions</span>
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{stats.totalCount}</span>
              <span className="text-xs font-semibold text-emerald-600">{stats.completedCount} terminées</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {stats.inProgressCount} en atelier • {stats.plannedCount} planifiées
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-amber-700">En Atelier</span>
              <Wrench className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-950 mt-1">
              {stats.activeVehiclesInShop} <span className="text-xs font-semibold text-amber-800">véhicules</span>
            </div>
            <p className="text-[10px] text-amber-800 mt-0.5">Statut "En Maintenance"</p>
          </div>

          <div className={`p-3.5 rounded-xl border transition-colors ${
            stats.overdueAlerts > 0
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : stats.upcomingAlerts > 0
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase">Échéances & Alertes</span>
              <AlertTriangle className={`w-4 h-4 ${stats.overdueAlerts > 0 ? 'text-rose-600' : 'text-amber-600'}`} />
            </div>
            <div className="text-xl font-black mt-1">
              {stats.overdueAlerts} <span className="text-xs font-semibold">retard(s)</span>
            </div>
            <p className="text-[10px] opacity-90 mt-0.5">
              {stats.upcomingAlerts} échéance(s) à prévoir bientôt
            </p>
          </div>
        </div>

        {/* Overdue Banner if any */}
        {stats.overdueAlerts > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Attention requise :</strong> {stats.overdueAlerts} entretien(s) ont dépassé leur échéance kilométrique ou calendaire.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('schedule')}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0 transition-colors"
            >
              Voir l'Échéancier →
            </button>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-3 border-b-2 text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Toutes les Interventions ({vehicleMaintenances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`py-3 px-3 border-b-2 text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'schedule'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Échéancier & Alertes Préventives</span>
          {(stats.overdueAlerts > 0 || stats.upcomingAlerts > 0) && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              stats.overdueAlerts > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
            }`}>
              {stats.overdueAlerts + stats.upcomingAlerts}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('by-vehicle')}
          className={`py-3 px-3 border-b-2 text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'by-vehicle'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Carnet d'Entretien par Véhicule</span>
        </button>
      </div>

      {/* VIEW 1: All Maintenances Table */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par N° dossier, véhicule, titre, atelier, facture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="ALL">Tous les véhicules ({vehicles.length})</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.code} - {v.plateNumber} ({v.name})
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="ALL">Tous les types d'intervention</option>
              {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="TERMINE">Terminé</option>
              <option value="EN_COURS">En cours d'atelier</option>
              <option value="PLANIFIE">Planifié</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>

          {/* Table */}
          {filteredMaintenances.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-700">Aucune intervention d'entretien trouvée</p>
              <p className="text-xs mt-1 text-slate-500">
                Ajustez vos filtres ou enregistrez une nouvelle intervention pour votre parc.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
              >
                + Nouvelle Intervention
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-3 px-4">N° Dossier</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4">Véhicule</th>
                    <th className="py-3 px-3">Service</th>
                    <th className="py-3 px-4">Objet / Travaux</th>
                    <th className="py-3 px-3 text-right">Compteur</th>
                    <th className="py-3 px-3 text-right">Prochaine Échéance</th>
                    <th className="py-3 px-3 text-right">Montant</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredMaintenances.map((m) => {
                    const veh = getVehicleById(m.vehicleId);
                    const unit = veh?.unitType || 'KM';
                    const sType = SERVICE_TYPE_LABELS[m.serviceType] || { label: m.serviceType, color: 'bg-slate-100 text-slate-800' };

                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {m.maintenanceNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {m.date}
                          {m.time && <span className="text-[10px] text-slate-400 block">{m.time}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{veh?.code || 'VEH'}</span>
                            <span className="text-[11px] font-mono text-slate-500">({veh?.plateNumber})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{veh?.name}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${sType.color}`}>
                            {sType.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 line-clamp-1">{m.title}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>{m.provider || 'Atelier'}</span>
                            {m.invoiceNumber && <span>• Fac: {m.invoiceNumber}</span>}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-700 whitespace-nowrap">
                          {(m.currentReading || 0).toLocaleString('fr-FR')} {unit}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {m.nextDueReading ? (
                            <span className="font-mono font-bold text-slate-800 block">
                              {m.nextDueReading.toLocaleString('fr-FR')} {unit}
                            </span>
                          ) : null}
                          {m.nextDueDate && (
                            <span className="text-[10px] text-slate-500 block">
                              Date : {m.nextDueDate}
                            </span>
                          )}
                          {!m.nextDueReading && !m.nextDueDate && (
                            <span className="text-[10px] text-slate-400 italic">Non définie</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {(m.cost || 0).toLocaleString('fr-FR')} {currency}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              m.status === 'TERMINE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'EN_COURS'
                                ? 'bg-amber-100 text-amber-900 animate-pulse'
                                : m.status === 'PLANIFIE'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {m.status === 'TERMINE' && <Check className="w-3 h-3" />}
                            {m.status === 'TERMINE' ? 'Terminé' : m.status === 'EN_COURS' ? 'En Atelier' : m.status === 'PLANIFIE' ? 'Planifié' : 'Annulé'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {/* Visualiser fiche */}
                            <button
                              onClick={() => setViewingMaintenance(m)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Voir et imprimer la fiche d'intervention"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Télécharger HTML */}
                            <button
                              onClick={() =>
                                downloadMaintenanceOrderHTML(
                                  m,
                                  veh,
                                  veh ? getCategoryById(veh.categoryId) : undefined,
                                  companyProfile
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Télécharger la fiche d'intervention HTML"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Modifier */}
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Modifier cette intervention"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Supprimer */}
                            <button
                              onClick={() => setDeletingId(m.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Preventive Schedule & Alerts */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Échéancier Préventif & Alertes de Révision
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparaison en temps réel entre le compteur actuel relevé à la pompe et les seuils préconisés par les constructeurs
            </p>
          </div>

          {scheduledAlerts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-slate-800">Aucune échéance préventive configurée</p>
              <p className="text-xs text-slate-500 mt-1">
                Renseignez le prochain kilométrage ou date d'échéance lors de l'enregistrement de vos entretiens.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduledAlerts.map(({ maintenance: m, vehicle: veh, currentReading, unit, delta, isOverdue, isClose }) => {
                const sType = SERVICE_TYPE_LABELS[m.serviceType] || { label: m.serviceType, color: 'bg-slate-100 text-slate-800' };

                return (
                  <div
                    key={m.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isOverdue
                        ? 'bg-rose-50/50 border-rose-300 shadow-xs'
                        : isClose
                        ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{veh?.code || 'VEH'}</span>
                          <span className="font-mono text-xs text-slate-500 font-bold">{veh?.plateNumber}</span>
                          <span className={`text-[10px] px-2 py-0.2 rounded font-bold border ${sType.color}`}>
                            {sType.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{veh?.name}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isOverdue
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isClose
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isOverdue ? 'En retard !' : isClose ? 'À prévoir bientôt' : 'Dans les temps'}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Compteur Actuel</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {currentReading.toLocaleString('fr-FR')} {unit}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Prochaine Échéance</span>
                        <span className={`font-mono font-bold text-sm ${isOverdue ? 'text-rose-700' : 'text-blue-700'}`}>
                          {m.nextDueReading ? `${m.nextDueReading.toLocaleString('fr-FR')} ${unit}` : (m.nextDueDate || 'Non définie')}
                        </span>
                      </div>
                    </div>

                    {m.nextDueReading && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span className="text-slate-500">Écart restant :</span>
                          <span className={`font-mono font-bold ${delta <= 0 ? 'text-rose-600' : delta <= 1000 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {delta <= 0
                              ? `Dépassé de ${Math.abs(delta).toLocaleString('fr-FR')} ${unit}`
                              : `Reste ${delta.toLocaleString('fr-FR')} ${unit}`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverdue ? 'bg-rose-600' : isClose ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(0, (currentReading / (m.nextDueReading || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <p className="text-[11px] text-slate-600 truncate max-w-[220px]">
                        <strong>Dernier :</strong> {m.title}
                      </p>
                      <button
                        onClick={() => {
                          setEditingMaintenance(null);
                          setFormVehicleId(m.vehicleId);
                          setFormServiceType(m.serviceType);
                          setFormTitle(`Révision / Entretien ${m.nextDueReading ? m.nextDueReading + ' ' + unit : ''}`);
                          setFormCurrentReading(currentReading);
                          const step = unit === 'HEURES' ? 250 : 10000;
                          setFormNextDueReading(String(currentReading + step));
                          setIsFormModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-blue-600 text-[11px] font-bold shadow-2xs transition-colors"
                      >
                        Planifier cet entretien →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Maintenance Logbook by Vehicle */}
      {activeTab === 'by-vehicle' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Carnet d'Entretien Individuel par Véhicule
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Historique chronologique complet, pièces changées et total des coûts de maintenance par machine
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Sélectionner un véhicule :</span>
              <select
                value={detailVehicleId}
                onChange={(e) => setDetailVehicleId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.code} - {v.plateNumber} ({v.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {detailVehicle && (
            <div className="space-y-4">
              {/* Vehicle Identity & Total Cost Card */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Véhicule Sélectionné</span>
                  <p className="text-xl font-black text-white mt-1">{detailVehicle.code} • {detailVehicle.plateNumber}</p>
                  <p className="text-xs text-slate-300">{detailVehicle.name}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compteur Actuel</span>
                  <p className="text-xl font-black text-amber-400 font-mono mt-1">
                    {(detailVehicle.currentReading || 0).toLocaleString('fr-FR')} {detailVehicle.unitType}
                  </p>
                  <p className="text-xs text-slate-300">Statut : <span className="font-bold text-emerald-400">{detailVehicle.status}</span></p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dépenses Maintenance</span>
                  <p className="text-xl font-black text-emerald-400 font-mono mt-1">
                    {vehicleSpend.toLocaleString('fr-FR')} {currency}
                  </p>
                  <p className="text-xs text-slate-300">{vehicleHistory.length} intervention(s) enregistrée(s)</p>
                </div>

                <div className="flex sm:justify-end items-center">
                  <button
                    onClick={() => {
                      setEditingMaintenance(null);
                      setFormVehicleId(detailVehicle.id);
                      setFormCurrentReading(detailVehicle.currentReading || 0);
                      const step = detailVehicle.unitType === 'HEURES' ? 250 : 10000;
                      setFormNextDueReading(String((detailVehicle.currentReading || 0) + step));
                      setIsFormModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    + Ajouter Intervention
                  </button>
                </div>
              </div>

              {/* History Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                  Historique des interventions sur ce véhicule
                </h3>

                {vehicleHistory.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-xs">
                    Aucun entretien n'a encore été consigné pour ce véhicule.
                  </p>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {vehicleHistory.map((m) => {
                      const sType = SERVICE_TYPE_LABELS[m.serviceType] || { label: m.serviceType, color: 'bg-slate-100 text-slate-800' };

                      return (
                        <div key={m.id} className="relative group">
                          {/* Dot on timeline */}
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-xs" />

                          <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/50 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">{m.title}</span>
                                <span className={`text-[10px] px-2 py-0.2 rounded font-bold border ${sType.color}`}>
                                  {sType.label}
                                </span>
                              </div>
                              <span className="font-mono text-sm font-black text-slate-900">
                                {(m.cost || 0).toLocaleString('fr-FR')} {currency}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span>📅 {m.date}</span>
                              <span>⏱️ Compteur : <strong>{(m.currentReading || 0).toLocaleString('fr-FR')} {detailVehicle.unitType}</strong></span>
                              <span>🏢 {m.provider}</span>
                              {m.invoiceNumber && <span>📄 N° {m.invoiceNumber}</span>}
                              {m.technicianName && <span>👤 Tech : {m.technicianName}</span>}
                            </div>

                            {m.partsReplaced && (
                              <p className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 mt-1 font-mono">
                                <strong>Pièces :</strong> {m.partsReplaced}
                              </p>
                            )}

                            {m.notes && (
                              <p className="text-xs text-slate-500 italic">
                                {m.notes}
                              </p>
                            )}

                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                              <span className="text-slate-400 text-[10px]">
                                Dossier {m.maintenanceNumber}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setViewingMaintenance(m)}
                                  className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Fiche d'intervention</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(m)}
                                  className="text-slate-600 font-bold hover:text-slate-900"
                                >
                                  Modifier
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Add / Edit Maintenance */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingMaintenance ? 'Modifier l’Intervention d’Entretien' : 'Nouvelle Intervention d’Entretien & Maintenance'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Saisie des travaux d'atelier, révision, pièces changées et coûts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Vehicle & Service Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Véhicule concerné *
                  </label>
                  <select
                    value={formVehicleId}
                    onChange={(e) => handleFormVehicleChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.code} - {v.plateNumber} ({v.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Type d'intervention *
                  </label>
                  <select
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value as MaintenanceServiceType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Objet / Titre de l'intervention *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vidange moteur 15W40 + Remplacement filtre à gasoil et huile"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              {/* Date, Time & Reading */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date d'intervention *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Compteur relevé ({getVehicleById(formVehicleId)?.unitType || 'KM'}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formCurrentReading}
                    onChange={(e) => setFormCurrentReading(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-mono font-bold"
                  />
                </div>
              </div>

              {/* Next Due Reading & Next Due Date (Preventive Alert Setup) */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Programmation de la Prochaine Échéance Préventive
                  </span>
                  <span className="text-[10px] text-blue-700">Optionnel mais recommandé</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Prochain compteur ({getVehicleById(formVehicleId)?.unitType || 'KM'})
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 135000"
                      value={formNextDueReading}
                      onChange={(e) => setFormNextDueReading(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                    <div className="flex items-center gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const curr = Number(formCurrentReading) || 0;
                          const isH = getVehicleById(formVehicleId)?.unitType === 'HEURES';
                          setFormNextDueReading(String(curr + (isH ? 250 : 10000)));
                        }}
                        className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold"
                      >
                        +{getVehicleById(formVehicleId)?.unitType === 'HEURES' ? '250 h' : '10 000 km'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const curr = Number(formCurrentReading) || 0;
                          const isH = getVehicleById(formVehicleId)?.unitType === 'HEURES';
                          setFormNextDueReading(String(curr + (isH ? 500 : 15000)));
                        }}
                        className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold"
                      >
                        +{getVehicleById(formVehicleId)?.unitType === 'HEURES' ? '500 h' : '15 000 km'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Prochaine date d'échéance
                    </label>
                    <input
                      type="date"
                      value={formNextDueDate}
                      onChange={(e) => setFormNextDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                    <div className="flex items-center gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 6);
                          setFormNextDueDate(d.toISOString().slice(0, 10));
                        }}
                        className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold"
                      >
                        +6 Mois
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setFullYear(d.getFullYear() + 1);
                          setFormNextDueDate(d.toISOString().slice(0, 10));
                        }}
                        className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold"
                      >
                        +1 An (Contrôle Technique)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost, Provider, Invoice & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coût Total ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Garage / Prestataire
                  </label>
                  <input
                    type="text"
                    placeholder="Atelier Interne, Garage X..."
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    N° Facture / BL
                  </label>
                  <input
                    type="text"
                    placeholder="FAC-2026-..."
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Statut *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as MaintenanceStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    <option value="TERMINE">Terminé / Réceptionné</option>
                    <option value="EN_COURS">En cours d'atelier</option>
                    <option value="PLANIFIE">Planifié</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                </div>
              </div>

              {/* Parts Replaced */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pièces et consommables remplacés
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: 30L Huile 15W40, 1x Filtre à huile Mann, 1x Filtre décanteur, 2x Balais essuie-glace..."
                  value={formPartsReplaced}
                  onChange={(e) => setFormPartsReplaced(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              {/* Technician & Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mécanicien / Responsable
                  </label>
                  <input
                    type="text"
                    placeholder="Nom du technicien ou chef d'atelier"
                    value={formTechnicianName}
                    onChange={(e) => setFormTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Observations & Diagnostic
                  </label>
                  <input
                    type="text"
                    placeholder="Remarques, anomalies constatées, préconisations..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition-all"
                >
                  {editingMaintenance ? 'Enregistrer les Modifications' : 'Créer l’Intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmation Delete */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">
                Supprimer cette intervention ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Le dossier d'intervention sera supprimé définitivement du carnet d'entretien. Cette action est irréversible.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirmer la Suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View / Print Order Modal */}
      {viewingMaintenance && (
        <MaintenanceOrderModal
          maintenance={viewingMaintenance}
          onClose={() => setViewingMaintenance(null)}
        />
      )}
    </div>
  );
};
