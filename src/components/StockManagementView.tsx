import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Droplet,
  Edit3,
  Gauge,
  History,
  Info,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { StockAdjustment } from '../types';

export const StockManagementView: React.FC = () => {
  const {
    stockConfig,
    updateStockConfig,
    currentStockLiters,
    stockPercentage,
    isLowStock,
    isCriticalStock,
    totalDeliveriesLiters,
    totalExitsLiters,
    stockAdjustments,
    addStockAdjustment,
    currentUser,
  } = useGascons();

  // Stock config editing state
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [initialStockInput, setInitialStockInput] = useState(String(stockConfig.initialStock));
  const [tankCapacityInput, setTankCapacityInput] = useState(String(stockConfig.tankCapacity));
  const [alertThresholdInput, setAlertThresholdInput] = useState(String(stockConfig.alertThreshold));
  const [criticalThresholdInput, setCriticalThresholdInput] = useState(String(stockConfig.criticalThreshold));
  const [tankNameInput, setTankNameInput] = useState(stockConfig.tankName);
  const [locationInput, setLocationInput] = useState(stockConfig.location);

  // Stock physical reconciliation / adjustment state
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [physicalMeasuredStock, setPhysicalMeasuredStock] = useState(String(currentStockLiters));
  const [adjustmentReason, setAdjustmentReason] = useState('Inventaire physique contradictoire');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  const remainingSpace = Math.max(0, stockConfig.tankCapacity - currentStockLiters);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateStockConfig({
      initialStock: Number(initialStockInput) || 0,
      tankCapacity: Number(tankCapacityInput) || 0,
      alertThreshold: Number(alertThresholdInput) || 0,
      criticalThreshold: Number(criticalThresholdInput) || 0,
      tankName: tankNameInput.trim() || 'Cuve Principale',
      location: locationInput.trim() || 'Dépôt Central',
    });
    setIsEditingConfig(false);
  };

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const measured = Number(physicalMeasuredStock);
    if (isNaN(measured) || measured < 0) return;

    const diff = measured - currentStockLiters;
    addStockAdjustment({
      date: new Date().toISOString().slice(0, 10),
      previousStock: currentStockLiters,
      newStock: measured,
      difference: diff,
      reason: adjustmentReason,
      adjustedBy: currentUser.name || 'Responsable Stock',
    });

    setIsAdjustmentModalOpen(false);
  };

  // Color of gauge
  let gaugeColor = 'bg-blue-600';
  let gaugeTextColor = 'text-blue-700';
  let gaugeBg = 'from-blue-500 to-indigo-600';
  if (isCriticalStock) {
    gaugeColor = 'bg-red-600';
    gaugeTextColor = 'text-red-600';
    gaugeBg = 'from-red-500 to-rose-700';
  } else if (isLowStock) {
    gaugeColor = 'bg-amber-500';
    gaugeTextColor = 'text-amber-600';
    gaugeBg = 'from-amber-400 to-orange-600';
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-600" />
            Gestion du Stock & État des Cuves
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi du stock initial, niveau en temps réel, seuils d alerte et réconciliation physique
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPhysicalMeasuredStock(String(currentStockLiters));
              setIsAdjustmentModalOpen(true);
            }}
            id="stock-adjustment-btn"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Étalonnage / Inventaire Physique
          </button>
          <button
            onClick={() => setIsEditingConfig(!isEditingConfig)}
            id="edit-stock-config-btn"
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingConfig ? 'Fermer la Configuration' : 'Paramétrer le Stock Initial'}
          </button>
        </div>
      </div>

      {/* Alert banner if low or critical */}
      {isCriticalStock ? (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 shrink-0 text-red-600 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="text-sm font-black text-red-800">ALERTE CRITIQUE : STOCK DE GASOIL TRÈS BAS !</p>
            <p>
              Le stock actuel ({currentStockLiters.toLocaleString('fr-FR')} L) est inférieur au seuil critique ({stockConfig.criticalThreshold} L).
              Veuillez commander d urgence un réapprovisionnement auprès de vos fournisseurs.
            </p>
          </div>
        </div>
      ) : isLowStock ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="text-sm font-bold text-amber-800">Avertissement : Seuil de réapprovisionnement atteint</p>
            <p>
              Le stock actuel ({currentStockLiters.toLocaleString('fr-FR')} L) est sous le seuil d alerte de sécurité ({stockConfig.alertThreshold} L).
            </p>
          </div>
        </div>
      ) : null}

      {/* Main Tank Visualizer Card & KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Tank Gauge Card (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cuve Principale de Stockage</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">{stockConfig.tankName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {stockConfig.location}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-slate-900">
                {stockPercentage}%
              </span>
              <span className="text-[11px] text-slate-400 block">Remplissage</span>
            </div>
          </div>

          {/* Graphical Tank Container */}
          <div className="relative border-4 border-slate-700 bg-slate-100 rounded-3xl h-36 overflow-hidden shadow-inner flex flex-col justify-end">
            {/* Background Tick Marks */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-2 opacity-30">
              <div className="border-b border-dashed border-slate-400 w-full flex justify-between text-[9px] font-mono">
                <span>100% ({stockConfig.tankCapacity.toLocaleString('fr-FR')} L)</span>
              </div>
              <div className="border-b border-dashed border-slate-400 w-full flex justify-between text-[9px] font-mono">
                <span>50%</span>
              </div>
              <div className="border-b border-dashed border-red-400 w-full flex justify-between text-[9px] font-mono text-red-700 font-bold">
                <span>Seuil critique ({stockConfig.criticalThreshold} L)</span>
              </div>
            </div>

            {/* Liquid Level */}
            <div
              className={`w-full bg-gradient-to-t ${gaugeBg} transition-all duration-700 relative`}
              style={{ height: `${stockPercentage}%` }}
            >
              {/* Liquid Waves Animation Effect */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 backdrop-blur-2xs" />
            </div>

            {/* Floating Liters Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-xs text-white px-4 py-2 rounded-xl shadow-lg border border-slate-700/50 text-center">
                <span className="text-xs uppercase font-bold text-slate-300 block">Volume Disponible</span>
                <span className="text-2xl font-black font-mono tracking-tight text-amber-400">
                  {currentStockLiters.toLocaleString('fr-FR')} <span className="text-sm font-medium text-white">Litres</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Tank Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacité Totale</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {stockConfig.tankCapacity.toLocaleString('fr-FR')} L
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Creux / Espace Libre</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {remainingSpace.toLocaleString('fr-FR')} L
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Seuil Alerte</span>
              <span className="font-mono font-bold text-amber-600 text-sm">
                {stockConfig.alertThreshold.toLocaleString('fr-FR')} L
              </span>
            </div>
          </div>
        </div>

        {/* Stock Balance Math Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Équation de Bilan Matière
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calcul mathématique exact du stock en temps réel
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Initial stock */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Stock Initial</span>
                <span className="text-[10px] text-slate-400">Défini au {stockConfig.initialStockDate}</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {stockConfig.initialStock.toLocaleString('fr-FR')} L
              </span>
            </div>

            {/* Total deliveries (+) */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-semibold text-emerald-950 block">(+) Total Livraisons</span>
                  <span className="text-[10px] text-emerald-700">Approvisionnements fournisseurs</span>
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                +{totalDeliveriesLiters.toLocaleString('fr-FR')} L
              </span>
            </div>

            {/* Total exits (-) */}
            <div className="flex items-center justify-between p-3 bg-rose-50/70 rounded-xl border border-rose-200">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                <div>
                  <span className="font-semibold text-rose-950 block">(-) Total Sorties Gasoil</span>
                  <span className="text-[10px] text-rose-700">Distributions véhicules & engins</span>
                </div>
              </div>
              <span className="font-mono font-bold text-rose-800 text-sm">
                -{totalExitsLiters.toLocaleString('fr-FR')} L
              </span>
            </div>

            {/* Adjustments */}
            {stockAdjustments.length > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 text-[11px]">
                <span className="text-blue-900 font-medium">Ajustements physiques nets:</span>
                <span className="font-mono font-bold text-blue-900">
                  {stockAdjustments.reduce((sum, a) => sum + a.difference, 0) > 0 ? '+' : ''}
                  {stockAdjustments.reduce((sum, a) => sum + a.difference, 0).toLocaleString('fr-FR')} L
                </span>
              </div>
            )}
          </div>

          {/* Final Equal Result */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-300">Stock Théorique Net</span>
            <span className="text-xl font-black font-mono text-amber-400">
              = {currentStockLiters.toLocaleString('fr-FR')} Litres
            </span>
          </div>
        </div>
      </div>

      {/* Stock Initial Configuration Form (Collapsible/Editable) */}
      {isEditingConfig && (
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-500 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Configuration du Stock Initial et de la Cuve</h3>
            </div>
            <button
              onClick={() => setIsEditingConfig(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Annuler
            </button>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stock initial */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Stock Initial (Litres) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={initialStockInput}
                  onChange={(e) => setInitialStockInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Niveau de départ lors de l installation</span>
              </div>

              {/* Capacité cuve */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Capacité Max Cuve (Litres) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={tankCapacityInput}
                  onChange={(e) => setTankCapacityInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">ex: 25000 Litres</span>
              </div>

              {/* Seuil alerte */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Seuil Alerte Stock Bas (Litres)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={alertThresholdInput}
                  onChange={(e) => setAlertThresholdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Avertissement jaune</span>
              </div>

              {/* Seuil critique */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Seuil Alerte Critique (Litres)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={criticalThresholdInput}
                  onChange={(e) => setCriticalThresholdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Avertissement rouge critique</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom / Désignation de la Cuve</label>
                <input
                  type="text"
                  value={tankNameInput}
                  onChange={(e) => setTankNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emplacement / Dépôt</label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingConfig(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                Enregistrer la Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adjustments & Calibration History */}
      {stockAdjustments.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            Historique des Réconciliations & Étalonnages Physiques
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">Date</th>
                  <th className="px-3.5 py-2.5">Motif</th>
                  <th className="px-3.5 py-2.5 text-right">Ancien Stock</th>
                  <th className="px-3.5 py-2.5 text-right">Nouveau Stock Relevé</th>
                  <th className="px-3.5 py-2.5 text-right">Écart / Ajustement</th>
                  <th className="px-3.5 py-2.5">Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockAdjustments.map((adj) => (
                  <tr key={adj.id}>
                    <td className="px-3.5 py-2.5 font-mono text-slate-600">{adj.date}</td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-800">{adj.reason}</td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-600">
                      {adj.previousStock.toLocaleString('fr-FR')} L
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">
                      {adj.newStock.toLocaleString('fr-FR')} L
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          adj.difference >= 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {adj.difference >= 0 ? `+${adj.difference.toLocaleString('fr-FR')}` : adj.difference.toLocaleString('fr-FR')} L
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">{adj.adjustedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Reconciliation */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                Étalonnage & Inventaire Physique
              </h3>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Stock théorique actuel en système:</span>
                  <span className="font-mono font-bold text-slate-900">{currentStockLiters.toLocaleString('fr-FR')} L</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nouveau Volume Mesuré Physiquement (Litres) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={physicalMeasuredStock}
                  onChange={(e) => setPhysicalMeasuredStock(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motif de l ajustement</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Inventaire physique contradictoire">Inventaire physique contradictoire</option>
                  <option value="Étalonnage / Pige de cuve">Étalonnage / Pige de cuve</option>
                  <option value="Correction écart de saisie">Correction écart de saisie</option>
                  <option value="Régularisation fin de mois">Régularisation fin de mois</option>
                  <option value="Pertes thermiques / Évaporation">Pertes thermiques / Évaporation</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Appliquer l ajustement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
