import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Check, CheckCircle2, ChevronRight, Fuel, Gauge, Hash, Info, MapPin, Sparkles, User, Users } from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { FuelExit, Vehicle } from '../types';
import { SignaturePad } from './SignaturePad';

interface FuelExitFormProps {
  onSuccess: (newExit: FuelExit) => void;
  onCancel?: () => void;
}

export const FuelExitForm: React.FC<FuelExitFormProps> = ({ onSuccess, onCancel }) => {
  const {
    categories,
    vehicles,
    departments,
    currentUser,
    currentStockLiters,
    addFuelExit,
    getVehicleLastReading,
  } = useGascons();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [quantityLiters, setQuantityLiters] = useState<string>('');
  const [currentReading, setCurrentReading] = useState<string>('');
  const [requesterName, setRequesterName] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Auto-select first category if none
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Filter vehicles by category
  const filteredVehicles = vehicles.filter((v) =>
    selectedCategoryId ? v.categoryId === selectedCategoryId : true
  );

  // When category changes, reset or pick appropriate vehicle
  useEffect(() => {
    if (filteredVehicles.length > 0) {
      const match = filteredVehicles.find((v) => v.id === selectedVehicleId);
      if (!match) {
        setSelectedVehicleId(filteredVehicles[0].id);
      }
    } else {
      setSelectedVehicleId('');
    }
  }, [selectedCategoryId, filteredVehicles, selectedVehicleId]);

  // Selected vehicle details
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const lastReadingInfo = selectedVehicleId
    ? getVehicleLastReading(selectedVehicleId)
    : { reading: 0, unitType: 'KM' as const };

  const isHours = (selectedVehicle?.unitType || lastReadingInfo.unitType) === 'HEURES';
  const unitLabel = isHours ? 'Heures (h)' : 'Kilomètres (km)';

  // Auto-fill vehicle department & assigned driver
  useEffect(() => {
    if (selectedVehicle) {
      if (selectedVehicle.departmentId) {
        setSelectedDepartmentId(selectedVehicle.departmentId);
      }
      if (selectedVehicle.assignedDriver && !requesterName) {
        setRequesterName(selectedVehicle.assignedDriver);
      }
    }
  }, [selectedVehicle]);

  // Calculations
  const prevReadingVal = Number(lastReadingInfo.reading || 0);
  const currReadingVal = Number(currentReading || 0);
  const qtyVal = Number(quantityLiters || 0);
  const deltaDistanceOrHours = currReadingVal > prevReadingVal ? currReadingVal - prevReadingVal : 0;

  let calculatedConsumption = 0;
  if (deltaDistanceOrHours > 0 && qtyVal > 0) {
    if (isHours) {
      // Litres per hour
      calculatedConsumption = qtyVal / deltaDistanceOrHours;
    } else {
      // Litres per 100 km
      calculatedConsumption = (qtyVal / deltaDistanceOrHours) * 100;
    }
  }

  const selectedCategory = categories.find((c) => c.id === (selectedVehicle?.categoryId || selectedCategoryId));
  const targetBenchmark = selectedCategory?.defaultTargetRate || 0;
  const isHighConsumption = targetBenchmark > 0 && calculatedConsumption > targetBenchmark * 1.35;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedVehicleId) {
      setErrorMsg('Veuillez sélectionner un véhicule ou un équipement.');
      return;
    }

    if (qtyVal <= 0) {
      setErrorMsg('Veuillez saisir une quantité de carburant valide (> 0 Litres).');
      return;
    }

    if (qtyVal > currentStockLiters) {
      setErrorMsg(
        `Stock insuffisant ! Le stock disponible est de ${currentStockLiters.toLocaleString('fr-FR')} L, or vous demandez ${qtyVal} L.`
      );
      return;
    }

    if (currReadingVal < prevReadingVal) {
      setErrorMsg(
        `L'index saisi (${currReadingVal} ${unitLabel}) ne peut pas être inférieur au dernier relevé enregistré (${prevReadingVal} ${unitLabel}).`
      );
      return;
    }

    if (!requesterName.trim()) {
      setErrorMsg('Veuillez indiquer le nom du demandeur ou chauffeur.');
      return;
    }

    if (!selectedDepartmentId) {
      setErrorMsg('Veuillez sélectionner le département d affectation.');
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const timeStr = today.toTimeString().slice(0, 5);

    const newExit = addFuelExit({
      date: dateStr,
      time: timeStr,
      vehicleId: selectedVehicleId,
      categoryId: selectedVehicle?.categoryId || selectedCategoryId,
      departmentId: selectedDepartmentId,
      quantityLiters: qtyVal,
      previousReading: prevReadingVal,
      currentReading: currReadingVal || prevReadingVal,
      distanceOrHours: deltaDistanceOrHours,
      calculatedConsumption,
      requesterName: requesterName.trim(),
      pumpOperatorName: currentUser.name || 'Pompiste de Service',
      signatureDataUrl: signatureDataUrl || undefined,
      purpose: purpose.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setFormSubmitted(true);
    onSuccess(newExit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-800" id="fuel-exit-form">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Erreur de saisie</p>
            <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 1. Category and Vehicle Selection */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Sélection du Véhicule / Équipement
            </h3>
          </div>
          {currentStockLiters <= 0 && (
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              Stock Épuisé
            </span>
          )}
        </div>

        {/* Categories Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Catégorie de véhicule
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20 ring-2 ring-blue-500/30'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
                  />
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.unitType}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicle Selection Dropdown / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Véhicule / Engin cible <span className="text-red-500">*</span>
            </label>
            <select
              id="vehicle-select"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
            >
              <option value="">-- Choisir un véhicule --</option>
              {filteredVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.code}] {v.plateNumber} — {v.name}
                </option>
              ))}
            </select>
            {filteredVehicles.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Aucun véhicule dans cette catégorie. Vous pouvez en créer dans la section Base de données.
              </p>
            )}
          </div>

          {selectedVehicle && (
            <div className="bg-white border border-blue-200/80 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-700 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 text-sm">{selectedVehicle.name}</span>
                <span className="font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  {selectedVehicle.plateNumber}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <div>
                  Dernier relevé:{' '}
                  <span className="font-bold text-slate-800 font-mono">
                    {lastReadingInfo.reading.toLocaleString('fr-FR')} {isHours ? 'h' : 'km'}
                  </span>
                </div>
                <div>
                  Capacité:{' '}
                  <span className="font-bold text-slate-800">
                    {selectedVehicle.tankCapacity} Litres
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Fuel Quantity & Odometer / Hours Entry */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            2
          </span>
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
            Quantité de Carburant & Relevé Compteur
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Liters Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quantité de Gasoil sortie (Litres) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="quantity-liters-input"
                type="number"
                step="any"
                min="0.01"
                max={currentStockLiters}
                value={quantityLiters}
                onChange={(e) => setQuantityLiters(e.target.value)}
                placeholder="ex: 150.25"
                required
                className="w-full pl-10 pr-16 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
              />
              <Fuel className="w-4 h-4 text-amber-600 absolute left-3.5 top-3.5" />
              <span className="absolute right-3.5 top-2.5 font-bold text-xs text-slate-400">
                LITRES
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>
                Stock cuve dispo:{' '}
                <span className="font-bold text-blue-700">
                  {currentStockLiters.toLocaleString('fr-FR')} L
                </span>
              </span>
              {selectedVehicle?.tankCapacity && (
                <span>Réservoir max: {selectedVehicle.tankCapacity} L</span>
              )}
            </div>
          </div>

          {/* Current Reading (Km or Hours) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isHours ? "Nombre d'heures actuel au compteur" : 'Kilométrage actuel au compteur'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="odometer-reading-input"
                type="number"
                step="any"
                min={prevReadingVal}
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                placeholder={`Relevé actuel (>= ${prevReadingVal})`}
                required
                className="w-full pl-10 pr-16 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
              />
              <Gauge className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
              <span className="absolute right-3.5 top-2.5 font-bold text-xs text-slate-400">
                {isHours ? 'HEURES' : 'KM'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Ancien index: {prevReadingVal.toLocaleString('fr-FR')} {isHours ? 'h' : 'km'}</span>
              {deltaDistanceOrHours > 0 && (
                <span className="font-bold text-emerald-600">
                  +{deltaDistanceOrHours.toLocaleString('fr-FR')} {isHours ? 'h' : 'km'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Consumption Preview Banner */}
        {calculatedConsumption > 0 && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
              isHighConsumption
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isHighConsumption ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'
                }`}
              >
                {isHighConsumption ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-bold">
                  Consommation calculée:{' '}
                  <span className="text-sm font-black font-mono">
                    {calculatedConsumption.toFixed(2)} {isHours ? 'L/h' : 'L/100km'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Référence moyenne catégorie:{' '}
                  <span className="font-semibold">{targetBenchmark} {isHours ? 'L/h' : 'L/100km'}</span>
                </p>
              </div>
            </div>
            {isHighConsumption && (
              <span className="text-[11px] font-bold px-2 py-1 bg-amber-200 text-amber-900 rounded-lg">
                Consommation élevée
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Requester, Department & Signatures */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
            Demandeur, Département & Signature
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Demandeur */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nom du Demandeur / Chauffeur <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="requester-name-input"
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="ex: Omar Selmi"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Département / Affectation <span className="text-red-500">*</span>
            </label>
            <select
              id="department-select"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
            >
              <option value="">-- Choisir le département --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Motif / Destination / Chantier
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="ex: Rotation terrassement Chantier Nord"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
            />
          </div>

          {/* Operator */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pompiste / Opérateur de saisie
            </label>
            <input
              type="text"
              value={currentUser.name}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-medium text-slate-600"
            />
          </div>
        </div>

        {/* Digital Signature Pad */}
        <div className="pt-2">
          <SignaturePad
            onSave={(dataUrl) => setSignatureDataUrl(dataUrl)}
            requesterName={requesterName}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          id="submit-fuel-exit-btn"
          disabled={currentStockLiters <= 0}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <Fuel className="w-4 h-4" />
          <span>Enregistrer la Sortie & Générer le Bon</span>
        </button>
      </div>
    </form>
  );
};
