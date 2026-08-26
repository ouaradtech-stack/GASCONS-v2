import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Edit3,
  Fuel,
  Gauge,
  Info,
  PenTool,
  Save,
  Trash2,
  Truck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { FuelExit, Vehicle } from '../types';
import { SignaturePad } from './SignaturePad';

interface EditFuelExitModalProps {
  exit: FuelExit;
  onClose: () => void;
  onSaved?: () => void;
}

export const EditFuelExitModal: React.FC<EditFuelExitModalProps> = ({ exit, onClose, onSaved }) => {
  const {
    vehicles,
    departments,
    categories,
    updateFuelExit,
    getVehicleById,
    getCategoryById,
    currentStockLiters,
  } = useGascons();

  const [date, setDate] = useState(exit.date);
  const [time, setTime] = useState(exit.time);
  const [vehicleId, setVehicleId] = useState(exit.vehicleId);
  const [departmentId, setDepartmentId] = useState(exit.departmentId);
  const [quantityLiters, setQuantityLiters] = useState<string>(String(exit.quantityLiters));
  const [previousReading, setPreviousReading] = useState<string>(String(exit.previousReading));
  const [currentReading, setCurrentReading] = useState<string>(String(exit.currentReading));
  const [requesterName, setRequesterName] = useState(exit.requesterName);
  const [pumpOperatorName, setPumpOperatorName] = useState(exit.pumpOperatorName || '');
  const [purpose, setPurpose] = useState(exit.purpose || '');
  const [notes, setNotes] = useState(exit.notes || '');
  const [signatureDataUrl, setSignatureDataUrl] = useState(exit.signatureDataUrl || '');
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedVehicle = getVehicleById(vehicleId);
  const isHours = selectedVehicle?.unitType === 'HEURES';
  const unitLabel = isHours ? 'Heures (h)' : 'Kilomètres (km)';
  const selectedCat = selectedVehicle ? getCategoryById(selectedVehicle.categoryId) : undefined;

  // Real-time calculations
  const prevVal = Number(previousReading) || 0;
  const currVal = Number(currentReading) || 0;
  const qtyVal = Number(quantityLiters) || 0;
  const delta = currVal >= prevVal ? currVal - prevVal : 0;

  let computedConsumption = 0;
  if (delta > 0 && qtyVal > 0) {
    if (isHours) {
      computedConsumption = Number((qtyVal / delta).toFixed(2));
    } else {
      computedConsumption = Number(((qtyVal / delta) * 100).toFixed(2));
    }
  }

  const handleVehicleChange = (newVehId: string) => {
    setVehicleId(newVehId);
    const veh = getVehicleById(newVehId);
    if (veh) {
      if (veh.departmentId) setDepartmentId(veh.departmentId);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!vehicleId) {
      setErrorMsg('Veuillez sélectionner un véhicule.');
      return;
    }
    if (qtyVal <= 0) {
      setErrorMsg('La quantité doit être supérieure à 0 Litres.');
      return;
    }
    if (currVal < prevVal) {
      setErrorMsg(`Le nouvel index (${currVal}) ne peut pas être inférieur à l'index précédent (${prevVal}).`);
      return;
    }
    if (!requesterName.trim()) {
      setErrorMsg('Veuillez spécifier le nom du demandeur.');
      return;
    }
    if (!departmentId) {
      setErrorMsg('Veuillez sélectionner un département.');
      return;
    }

    const veh = getVehicleById(vehicleId);
    const categoryId = veh?.categoryId || exit.categoryId;

    updateFuelExit(exit.id, {
      date,
      time,
      vehicleId,
      categoryId,
      departmentId,
      quantityLiters: qtyVal,
      previousReading: prevVal,
      currentReading: currVal,
      distanceOrHours: delta,
      calculatedConsumption: computedConsumption,
      requesterName: requesterName.trim(),
      pumpOperatorName: pumpOperatorName.trim(),
      purpose: purpose.trim(),
      notes: notes.trim(),
      signatureDataUrl: signatureDataUrl || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      if (onSaved) onSaved();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Modifier la Sortie de Gasoil</h3>
              <p className="text-xs text-slate-400">Ticket N° <span className="font-mono text-amber-400 font-bold">{exit.ticketNumber}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Modifications enregistrées avec succès !</span>
            </div>
          )}

          {/* Date & Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date de distribution *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Heure *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Véhicule & Département */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" /> Véhicule / Engin *
              </label>
              <select
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    [{v.code}] {v.plateNumber} — {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Département / Chantier *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Volume & Relevés Compteur */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-amber-600" /> Volume & Relevés d'Index ({unitLabel})
              </span>
              {selectedCat && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${selectedCat.color}20`,
                    color: selectedCat.color,
                  }}
                >
                  Catégorie: {selectedCat.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Volume (Litres) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={quantityLiters}
                    onChange={(e) => setQuantityLiters(e.target.value)}
                    required
                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">L</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Ancien Index ({isHours ? 'h' : 'km'})
                </label>
                <input
                  type="number"
                  step="any"
                  value={previousReading}
                  onChange={(e) => setPreviousReading(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nouvel Index Actuel *
                </label>
                <input
                  type="number"
                  step="any"
                  value={currentReading}
                  onChange={(e) => setCurrentReading(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-950 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            {/* Live Recalculated Summary */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">{isHours ? 'Temps travaillé:' : 'Distance effectuée:'}</span>
                <span className="font-mono font-bold text-emerald-700">
                  +{delta.toLocaleString('fr-FR')} {isHours ? 'h' : 'km'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Consommation recalculée:</span>
                <span className="font-mono font-black text-blue-900">
                  {computedConsumption > 0 ? computedConsumption.toFixed(2) : '-'}{' '}
                  <span className="text-[10px] font-normal">{isHours ? 'L/h' : 'L/100km'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Intervenants: Demandeur & Pompiste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Demandeur / Chauffeur *
              </label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                required
                placeholder="Ex: Omar Selmi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Pompiste / Opérateur
              </label>
              <input
                type="text"
                value={pumpOperatorName}
                onChange={(e) => setPumpOperatorName(e.target.value)}
                placeholder="Ex: Karim Ouarad"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Motif & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motif / Destination
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Ex: Transport agrégats Chantier Nord"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notes ou Remarques
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Plein régulier hebdomadaire"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Signature Management */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-blue-600" /> Signature du Demandeur
              </span>
              <button
                type="button"
                onClick={() => setIsEditingSignature(!isEditingSignature)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                {isEditingSignature ? 'Garder signature existante' : 'Modifier la signature'}
              </button>
            </div>

            {isEditingSignature ? (
              <div className="space-y-2">
                <SignaturePad
                  onSave={(dataUrl) => {
                    setSignatureDataUrl(dataUrl);
                    setIsEditingSignature(false);
                  }}
                  onClear={() => setSignatureDataUrl('')}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                {signatureDataUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={signatureDataUrl}
                      alt="Signature enregistrée"
                      className="h-9 max-w-[140px] object-contain border border-slate-200 rounded bg-slate-50/50 p-0.5"
                    />
                    <span className="text-[11px] text-emerald-700 font-semibold">✓ Signature enregistrée</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Aucune signature attachée</span>
                )}
                {signatureDataUrl && (
                  <button
                    type="button"
                    onClick={() => setSignatureDataUrl('')}
                    className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                  >
                    Effacer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              Enregistrer les Modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
