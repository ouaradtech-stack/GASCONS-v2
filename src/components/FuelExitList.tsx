import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Fuel,
  Gauge,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { FuelExit } from '../types';
import { downloadFile, downloadVoucherHTML, exportExitsToCSV } from '../utils/exportHelpers';
import { EditFuelExitModal } from './EditFuelExitModal';
import { VoucherModal } from './VoucherModal';

interface FuelExitListProps {
  onNewExitClick: () => void;
}

export const FuelExitList: React.FC<FuelExitListProps> = ({ onNewExitClick }) => {
  const {
    fuelExits,
    categories,
    vehicles,
    departments,
    stockConfig,
    deleteFuelExit,
    getVehicleById,
    getCategoryById,
    getDepartmentById,
    currentUser,
  } = useGascons();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('ALL');
  const [selectedVehicleId, setSelectedVehicleId] = useState('ALL');
  const [selectedVoucherExit, setSelectedVoucherExit] = useState<FuelExit | null>(null);
  const [editingExit, setEditingExit] = useState<FuelExit | null>(null);
  const [deletingExit, setDeletingExit] = useState<FuelExit | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const filteredExits = useMemo(() => {
    return fuelExits.filter((exit) => {
      // Category filter
      if (selectedCategoryId !== 'ALL' && exit.categoryId !== selectedCategoryId) {
        return false;
      }
      // Department filter
      if (selectedDepartmentId !== 'ALL' && exit.departmentId !== selectedDepartmentId) {
        return false;
      }
      // Vehicle filter
      if (selectedVehicleId !== 'ALL' && exit.vehicleId !== selectedVehicleId) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const vehicle = getVehicleById(exit.vehicleId);
        const matchTicket = exit.ticketNumber.toLowerCase().includes(query);
        const matchPlate = vehicle?.plateNumber.toLowerCase().includes(query) || false;
        const matchName = vehicle?.name.toLowerCase().includes(query) || false;
        const matchRequester = exit.requesterName.toLowerCase().includes(query);
        const matchOperator = exit.pumpOperatorName?.toLowerCase().includes(query) || false;
        const matchPurpose = exit.purpose?.toLowerCase().includes(query) || false;

        if (!matchTicket && !matchPlate && !matchName && !matchRequester && !matchOperator && !matchPurpose) {
          return false;
        }
      }
      return true;
    });
  }, [
    fuelExits,
    selectedCategoryId,
    selectedDepartmentId,
    selectedVehicleId,
    searchQuery,
    getVehicleById,
  ]);

  const totalFilteredLiters = filteredExits.reduce((acc, curr) => acc + curr.quantityLiters, 0);

  const confirmDelete = () => {
    if (deletingExit) {
      deleteFuelExit(deletingExit.id);
      showToast(`Le bon N° ${deletingExit.ticketNumber} a été supprimé avec succès.`, 'success');
      setDeletingExit(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredExits.length === 0) {
      showToast('Aucune sortie à exporter avec les filtres actuels.', 'info');
      return;
    }
    exportExitsToCSV(filteredExits, getVehicleById, getCategoryById, getDepartmentById, 'Historique_Sorties_Gascons');
    showToast(`Exportation CSV réussie (${filteredExits.length} sorties téléchargées) !`, 'success');
  };

  const handleExportJSON = () => {
    if (filteredExits.length === 0) return;
    const jsonStr = JSON.stringify(filteredExits, null, 2);
    downloadFile(jsonStr, `Sorties_Gasoil_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    showToast(`Export JSON téléchargé (${filteredExits.length} enregistrements) !`, 'success');
  };

  const handleDownloadSingleVoucher = (exit: FuelExit) => {
    const vehicle = getVehicleById(exit.vehicleId);
    const category = getCategoryById(exit.categoryId);
    const department = getDepartmentById(exit.departmentId);
    downloadVoucherHTML(exit, vehicle, category, department, stockConfig);
    showToast(`Bon N° ${exit.ticketNumber} téléchargé au format reçu imprimable !`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Toast notification */}
      {notification && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-blue-600" />
            Historique des Sorties de Gasoil
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualisation, modification, suppression et téléchargement des bons de distribution
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Download CSV Button */}
          <button
            onClick={handleExportCSV}
            title="Télécharger l'historique des sorties au format CSV / Excel"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Télécharger (CSV)</span>
          </button>

          {/* Download JSON Button */}
          <button
            onClick={handleExportJSON}
            title="Télécharger les données brutes au format JSON"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>JSON</span>
          </button>

          {/* New Exit Button */}
          <button
            onClick={onNewExitClick}
            id="new-fuel-exit-btn"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-600/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Sortie</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher N° Bon, immatriculation, chauffeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
          >
            <option value="ALL">Toutes les Catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Department Dropdown */}
          <select
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
          >
            <option value="ALL">Tous les Départements</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          {/* Vehicle Dropdown */}
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
          >
            <option value="ALL">Tous les Véhicules</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                [{v.code}] {v.plateNumber} — {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{filteredExits.length}</span> sortie(s) trouvée(s)
            {(selectedCategoryId !== 'ALL' ||
              selectedDepartmentId !== 'ALL' ||
              selectedVehicleId !== 'ALL' ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategoryId('ALL');
                  setSelectedDepartmentId('ALL');
                  setSelectedVehicleId('ALL');
                  setSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline text-[11px]"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div>
              Total gasoil filtré:{' '}
              <span className="font-mono font-bold text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                {totalFilteredLiters.toLocaleString('fr-FR')} Litres
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3.5">N° Ticket / Date</th>
                <th className="px-4 py-3.5">Véhicule & Catégorie</th>
                <th className="px-4 py-3.5">Index Compteur</th>
                <th className="px-4 py-3.5 text-right">Volume</th>
                <th className="px-4 py-3.5 text-right">Conso</th>
                <th className="px-4 py-3.5">Demandeur & Sign.</th>
                <th className="px-4 py-3.5">Département</th>
                <th className="px-4 py-3.5 text-center min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <Fuel className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                    <p className="font-medium text-sm text-slate-600">Aucune sortie de gasoil trouvée</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Modifiez vos critères de recherche ou enregistrez une nouvelle sortie.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExits.map((exit) => {
                  const vehicle = getVehicleById(exit.vehicleId);
                  const category = getCategoryById(exit.categoryId);
                  const department = getDepartmentById(exit.departmentId);
                  const isHours = (vehicle?.unitType || category?.unitType) === 'HEURES';

                  return (
                    <tr key={exit.id} className="hover:bg-blue-50/40 transition-colors group">
                      {/* Ticket Number & Date */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelectedVoucherExit(exit)}
                          className="font-mono font-bold text-blue-900 hover:text-blue-600 hover:underline cursor-pointer block"
                          title="Cliquer pour afficher le bon complet"
                        >
                          {exit.ticketNumber}
                        </button>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{exit.date}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{exit.time}</span>
                        </div>
                      </td>

                      {/* Vehicle & Category */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                            {vehicle?.plateNumber || exit.vehicleId}
                          </span>
                          <span className="text-slate-600 font-medium truncate max-w-[130px]">
                            {vehicle?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {category && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                              style={{
                                backgroundColor: `${category.color}15`,
                                color: category.color,
                              }}
                            >
                              {category.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Index / Readings */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-slate-800 font-semibold">
                          {exit.currentReading.toLocaleString('fr-FR')} {isHours ? 'h' : 'km'}
                        </div>
                        {exit.distanceOrHours > 0 ? (
                          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                            +{exit.distanceOrHours.toLocaleString('fr-FR')} {isHours ? 'h' : 'km'}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Index de départ</div>
                        )}
                      </td>

                      {/* Liters */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-mono font-black text-xs text-amber-950 bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-block">
                          {exit.quantityLiters.toLocaleString('fr-FR')} L
                        </span>
                      </td>

                      {/* Calculated Consumption */}
                      <td className="px-4 py-3.5 text-right">
                        {exit.calculatedConsumption > 0 ? (
                          <div>
                            <span className="font-mono font-bold text-slate-900">
                              {exit.calculatedConsumption.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-1">
                              {isHours ? 'L/h' : 'L/100'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Requester & Signature */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[110px]">{exit.requesterName}</span>
                        </div>
                        {exit.signatureDataUrl ? (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Signé ✓
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sans signature</span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5">
                        <span className="text-slate-800 font-medium truncate block max-w-[120px]">
                          {department?.name || '-'}
                        </span>
                        {exit.purpose && (
                          <span className="text-[10px] text-slate-500 italic block truncate max-w-[120px]">
                            {exit.purpose}
                          </span>
                        )}
                      </td>

                      {/* 4 Action Buttons: Visualisation, Modification, Téléchargement, Suppression */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* 1. Visualiser */}
                          <button
                            onClick={() => setSelectedVoucherExit(exit)}
                            title="Visualiser le bon de sortie"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Modifier */}
                          <button
                            onClick={() => setEditingExit(exit)}
                            title="Modifier cette sortie de gasoil"
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Télécharger */}
                          <button
                            onClick={() => handleDownloadSingleVoucher(exit)}
                            title="Télécharger le bon / reçu (HTML imprimable)"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. Supprimer */}
                          <button
                            onClick={() => setDeletingExit(exit)}
                            title="Supprimer cette sortie"
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal: Visualisation du Bon */}
      {selectedVoucherExit && (
        <VoucherModal
          exit={selectedVoucherExit}
          onClose={() => setSelectedVoucherExit(null)}
        />
      )}

      {/* 2. Modal: Modification de la Sortie */}
      {editingExit && (
        <EditFuelExitModal
          exit={editingExit}
          onClose={() => setEditingExit(null)}
          onSaved={() => showToast(`Bon N° ${editingExit.ticketNumber} mis à jour avec succès !`, 'success')}
        />
      )}

      {/* 3. Modal: Confirmation de Suppression */}
      {deletingExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Supprimer cette sortie de gasoil ?</h3>
                <p className="text-xs text-slate-500">
                  Cette action supprimera définitivement le bon de sortie et recalculera les consommations associées.
                </p>
              </div>
            </div>

            {/* Exit Details summary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">N° Ticket:</span>
                <span className="font-mono font-bold text-slate-900">{deletingExit.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium text-slate-800">{deletingExit.date} ({deletingExit.time})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Véhicule:</span>
                <span className="font-medium text-slate-800">
                  {getVehicleById(deletingExit.vehicleId)?.plateNumber || deletingExit.vehicleId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantité:</span>
                <span className="font-mono font-bold text-amber-700">{deletingExit.quantityLiters} Litres</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Demandeur:</span>
                <span className="font-medium text-slate-800">{deletingExit.requesterName}</span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingExit(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
