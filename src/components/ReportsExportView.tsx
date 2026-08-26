import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  ClipboardCheck,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Fuel,
  Gauge,
  Layers,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { FuelExit } from '../types';

export const ReportsExportView: React.FC = () => {
  const {
    fuelExits,
    categories,
    vehicles,
    departments,
    getVehicleById,
    getCategoryById,
    getDepartmentById,
    stockConfig,
  } = useGascons();

  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [selectedVehicleId, setSelectedVehicleId] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('ALL');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Available unique months from data
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    fuelExits.forEach((e) => {
      if (e.date) {
        monthsSet.add(e.date.slice(0, 7)); // YYYY-MM
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [fuelExits]);

  // Filter vehicles according to selected category (if any)
  const categoryVehicles = useMemo(() => {
    if (selectedCategoryId === 'ALL') return vehicles;
    return vehicles.filter((v) => v.categoryId === selectedCategoryId);
  }, [vehicles, selectedCategoryId]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return fuelExits.filter((exit) => {
      // 1. Category Filter
      if (selectedCategoryId !== 'ALL' && exit.categoryId !== selectedCategoryId) {
        return false;
      }
      // 2. Vehicle Filter
      if (selectedVehicleId !== 'ALL' && exit.vehicleId !== selectedVehicleId) {
        return false;
      }
      // 3. Department Filter
      if (selectedDepartmentId !== 'ALL' && exit.departmentId !== selectedDepartmentId) {
        return false;
      }
      // 4. Month Filter
      if (selectedMonth !== 'ALL') {
        const exitMonth = exit.date.slice(0, 7);
        if (exitMonth !== selectedMonth) return false;
      }
      // 5. Date Range
      if (startDate && exit.date < startDate) {
        return false;
      }
      if (endDate && exit.date > endDate) {
        return false;
      }

      return true;
    });
  }, [
    fuelExits,
    selectedCategoryId,
    selectedVehicleId,
    selectedDepartmentId,
    selectedMonth,
    startDate,
    endDate,
  ]);

  // Summary Metrics on filtered results
  const totalVolumeLiters = filteredData.reduce((sum, e) => sum + e.quantityLiters, 0);
  const totalDistanceOrHours = filteredData.reduce((sum, e) => sum + e.distanceOrHours, 0);
  const exitsCount = filteredData.length;
  const avgVolumePerExit = exitsCount > 0 ? totalVolumeLiters / exitsCount : 0;

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategoryId('ALL');
    setSelectedVehicleId('ALL');
    setSelectedMonth('ALL');
    setStartDate('');
    setEndDate('');
    setSelectedDepartmentId('ALL');
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert('Aucune donnée à exporter.');
      return;
    }

    const headers = [
      'N° Ticket',
      'Date',
      'Heure',
      'Immatriculation',
      'Véhicule / Désignation',
      'Catégorie',
      'Département',
      'Unité Compteur',
      'Ancien Index',
      'Nouvel Index',
      'Différentiel (Km ou H)',
      'Volume Distribué (Litres)',
      'Consommation Calculée (L/100 ou L/h)',
      'Demandeur / Chauffeur',
      'Pompiste / Opérateur',
      'Motif / Destination',
      'Signature Enregistrée',
      'Observations',
    ];

    const rows = filteredData.map((e) => {
      const vehicle = getVehicleById(e.vehicleId);
      const category = getCategoryById(e.categoryId);
      const dept = getDepartmentById(e.departmentId);
      const unit = vehicle?.unitType || 'KM';

      return [
        `"${e.ticketNumber}"`,
        `"${e.date}"`,
        `"${e.time}"`,
        `"${vehicle?.plateNumber || ''}"`,
        `"${(vehicle?.name || '').replace(/"/g, '""')}"`,
        `"${category?.name || ''}"`,
        `"${dept?.name || ''}"`,
        `"${unit}"`,
        e.previousReading,
        e.currentReading,
        e.distanceOrHours,
        e.quantityLiters,
        e.calculatedConsumption > 0 ? e.calculatedConsumption.toFixed(2) : '0',
        `"${e.requesterName.replace(/"/g, '""')}"`,
        `"${(e.pumpOperatorName || '').replace(/"/g, '""')}"`,
        `"${(e.purpose || '').replace(/"/g, '""')}"`,
        e.signatureDataUrl ? 'OUI' : 'NON',
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Gascons_Export_Consommations_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Tab-Separated Values to clipboard
  const handleCopyClipboard = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'Ticket',
      'Date',
      'Véhicule',
      'Immatriculation',
      'Catégorie',
      'Département',
      'Ancien Index',
      'Nouvel Index',
      'Delta',
      'Litres',
      'Conso Moyenne',
      'Demandeur',
      'Motif',
    ];

    const rows = filteredData.map((e) => {
      const vehicle = getVehicleById(e.vehicleId);
      const category = getCategoryById(e.categoryId);
      const dept = getDepartmentById(e.departmentId);

      return [
        e.ticketNumber,
        e.date,
        vehicle?.name || '',
        vehicle?.plateNumber || '',
        category?.name || '',
        dept?.name || '',
        e.previousReading,
        e.currentReading,
        e.distanceOrHours,
        e.quantityLiters,
        e.calculatedConsumption > 0 ? e.calculatedConsumption.toFixed(2) : '-',
        e.requesterName,
        e.purpose || '',
      ].join('\t');
    });

    const tsvContent = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Rapports & Exportations des Données
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filtrez et exportez vos historiques par catégorie, véhicule, date, mois ou département
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            {copiedToClipboard ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copié dans le presse-papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier format Excel</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer / PDF
          </button>
          <button
            onClick={handleExportCSV}
            id="export-csv-btn"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Exporter vers Excel (.CSV)
          </button>
        </div>
      </div>

      {/* Multi-Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <Filter className="w-4 h-4 text-blue-600" />
            Critères de Filtrage et d Exportation
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            Réinitialiser les filtres
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Catégorie de véhicule */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Catégorie de véhicule
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setSelectedVehicleId('ALL');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="ALL">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.unitType})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Véhicule spécifique */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Véhicule / Engin
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="ALL">Tous les véhicules</option>
              {categoryVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.code}] {v.plateNumber} — {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Mois spécifique */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Par Mois
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="ALL">Tous les mois</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  Mois: {m}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Début */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Date Début (Période)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          {/* 5. Date Fin */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Date Fin (Période)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>
        </div>

        {/* Secondary line: Department */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-slate-100">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Filtrer par Département
            </label>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="ALL">Tous les départements</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filter Tags */}
          <div className="sm:col-span-2 flex items-center justify-end text-xs text-slate-500 gap-2 self-end pb-1">
            <span>
              Résultats correspondants:{' '}
              <strong className="text-slate-900 font-bold">{filteredData.length}</strong> lignes
            </span>
          </div>
        </div>
      </div>

      {/* Filtered KPIs Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Volume Total Filtré</span>
          <div className="text-2xl font-black font-mono text-blue-900">
            {totalVolumeLiters.toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-500">Litres</span>
          </div>
          <p className="text-[10px] text-slate-400">Somme des distributions sélectionnées</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Distributions / Pleins</span>
          <div className="text-2xl font-black font-mono text-slate-800">
            {exitsCount} <span className="text-sm font-bold text-slate-500">bons</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Moyenne de {avgVolumePerExit.toFixed(1)} L par distribution
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Activité Cumulée</span>
          <div className="text-2xl font-black font-mono text-emerald-800">
            {totalDistanceOrHours.toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-500">km/h</span>
          </div>
          <p className="text-[10px] text-slate-400">Total distance ou heures enregistrées</p>
        </div>
      </div>

      {/* Printable Report View & Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
        {/* Printable Header only on print */}
        <div className="hidden print:block p-6 border-b-2 border-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-900">GASCONS — RAPPORT D AUDIT ET CONSOMMATION GASOIL</h1>
              <p className="text-xs text-slate-500 mt-1">
                Dépôt: {stockConfig.tankName} • Période: {startDate || 'Début'} au {endDate || 'Aujourd hui'}
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">Total Volume: {totalVolumeLiters.toLocaleString('fr-FR')} L</p>
              <p className="text-slate-500">Édité le {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">N° Ticket</th>
                <th className="px-4 py-3">Véhicule</th>
                <th className="px-4 py-3">Immat.</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Département</th>
                <th className="px-4 py-3 text-right">Ancien Index</th>
                <th className="px-4 py-3 text-right">Nouvel Index</th>
                <th className="px-4 py-3 text-right">Volume (L)</th>
                <th className="px-4 py-3 text-right">Conso</th>
                <th className="px-4 py-3">Demandeur</th>
                <th className="px-4 py-3">Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-slate-400">
                    Aucune ligne ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredData.map((e) => {
                  const vehicle = getVehicleById(e.vehicleId);
                  const category = getCategoryById(e.categoryId);
                  const dept = getDepartmentById(e.departmentId);
                  const isHours = vehicle?.unitType === 'HEURES';

                  return (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono">{e.date}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-900">{e.ticketNumber}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{vehicle?.name || '-'}</td>
                      <td className="px-4 py-3 font-mono text-[11px]">{vehicle?.plateNumber || '-'}</td>
                      <td className="px-4 py-3">{category?.name || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{dept?.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {e.previousReading.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {e.currentReading.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-900">
                        {e.quantityLiters.toLocaleString('fr-FR')} L
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {e.calculatedConsumption > 0 ? (
                          <span>{e.calculatedConsumption.toFixed(2)} {isHours ? 'L/h' : 'L/100'}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{e.requesterName}</td>
                      <td className="px-4 py-3">
                        {e.signatureDataUrl ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Signé ✓
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Non signé</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Total Footer */}
            {filteredData.length > 0 && (
              <tfoot className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={8} className="px-4 py-3 text-right uppercase tracking-wider text-xs">
                    Total Volume Exporté :
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-blue-900 font-black">
                    {totalVolumeLiters.toLocaleString('fr-FR')} L
                  </td>
                  <td colSpan={3} className="px-4 py-3 text-slate-500 text-xs font-normal">
                    {filteredData.length} sorties
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
