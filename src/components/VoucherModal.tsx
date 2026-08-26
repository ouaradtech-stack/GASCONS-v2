import React from 'react';
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Fuel,
  Gauge,
  Hash,
  MapPin,
  Printer,
  Shield,
  UserCheck,
  X,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { FuelExit } from '../types';
import { downloadVoucherHTML } from '../utils/exportHelpers';

interface VoucherModalProps {
  exit: FuelExit | null;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ exit, onClose }) => {
  const { getVehicleById, getCategoryById, getDepartmentById, stockConfig, companyProfile } = useGascons();

  if (!exit) return null;

  const vehicle = getVehicleById(exit.vehicleId);
  const category = getCategoryById(exit.categoryId);
  const department = getDepartmentById(exit.departmentId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadVoucherHTML(exit, vehicle, category, department, stockConfig, companyProfile);
  };

  const isHours = vehicle?.unitType === 'HEURES';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              title="Retourner au menu précédent"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Retour</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Bon de Distribution de Carburant</h3>
              <p className="text-xs text-slate-400">Document officiel N° {exit.ticketNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Télécharger le reçu au format HTML/Document imprimable"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Télécharger
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
            <button
              onClick={onClose}
              title="Fermer et retourner au menu précédent"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Body */}
        <div className="p-8 space-y-6 text-slate-800 print:p-0 print:space-y-4 print:text-black" id="printable-voucher">
          {/* Top Brand Banner */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-3">
              {companyProfile.logoUrl && companyProfile.logoUrl.startsWith('data:') ? (
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                  <img
                    src={companyProfile.logoUrl}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg font-black shadow-xs">
                  <Fuel className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-blue-950 flex items-center gap-1.5">
                    {companyProfile.name || 'GASCONS'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wide">
                    {companyProfile.legalStatus || 'SARL'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {companyProfile.headerTagline || 'Gestion & Contrôle Carburant'}
                  {companyProfile.taxId ? ` • NIF: ${companyProfile.taxId}` : ''}
                </p>
                <p className="text-[11px] text-slate-400">
                  Cuve: <span className="font-semibold text-slate-600">{stockConfig.tankName}</span> — {stockConfig.location}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">N° Ticket Sortie</span>
                <span className="text-base font-mono font-black text-blue-900">{exit.ticketNumber}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-end gap-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {exit.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {exit.time}
                </span>
              </div>
            </div>
          </div>

          {/* Main Quantity Spotlight */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/50 border border-amber-300 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Quantité de Gasoil Distribuée</span>
              <div className="text-4xl font-black text-amber-950 font-mono tracking-tight flex items-baseline gap-2">
                {exit.quantityLiters.toLocaleString('fr-FR')} <span className="text-xl font-bold text-amber-700">Litres</span>
              </div>
              <p className="text-xs text-amber-800">
                Type de produit: <span className="font-semibold">Gasoil / Diesel Standard (B7)</span>
              </p>
            </div>
            <div className="text-right border-l border-amber-200 pl-6">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Consommation Calculée</span>
              <div className="text-2xl font-black text-slate-800 font-mono">
                {exit.calculatedConsumption > 0 ? exit.calculatedConsumption.toFixed(2) : '-'}
                <span className="text-xs font-semibold text-slate-600 ml-1">
                  {isHours ? 'L/Heure' : 'L/100km'}
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center justify-end gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Conforme
              </span>
            </div>
          </div>

          {/* Vehicle & Index Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Box 1: Véhicule & Destination */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Shield className="w-3.5 h-3.5 text-blue-600" /> Informations Véhicule / Équipement
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Immatriculation / Code:</span>
                  <span className="font-bold text-slate-900 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {vehicle?.plateNumber || exit.vehicleId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Désignation:</span>
                  <span className="font-semibold text-slate-800 text-right">{vehicle?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Catégorie:</span>
                  <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                    {category?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Département:</span>
                  <span className="font-medium text-slate-800">{department?.name || '-'}</span>
                </div>
                {exit.purpose && (
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Motif / Destination:</span>
                    <span className="font-medium text-slate-700 italic">{exit.purpose}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Compteurs & Relevés */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Gauge className="w-3.5 h-3.5 text-amber-600" /> Relevé Compteur ({isHours ? 'Heures' : 'Kilomètres'})
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ancien index:</span>
                  <span className="font-mono font-medium text-slate-700">
                    {exit.previousReading.toLocaleString('fr-FR')} {isHours ? 'h' : 'km'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nouvel index actuel:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {exit.currentReading.toLocaleString('fr-FR')} {isHours ? 'h' : 'km'}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-slate-200">
                  <span className="text-slate-800">{isHours ? 'Heures travaillées:' : 'Distance parcourue:'}</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +{exit.distanceOrHours.toLocaleString('fr-FR')} {isHours ? 'h' : 'km'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacité réservoir:</span>
                  <span className="font-medium text-slate-700">{vehicle?.tankCapacity ? `${vehicle.tankCapacity} L` : '-'}</span>
                </div>
                {exit.notes && (
                  <div className="text-[11px] text-slate-500 italic pt-1">
                    Notes: {exit.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signatures and Validation Blocks */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Operator Box */}
            <div className="border border-slate-300 rounded-xl p-4 bg-white space-y-2 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Distribué Par (Pompiste / Agent)</span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  {exit.pumpOperatorName || 'Agent Dépôt'}
                </span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Visa & Contrôle Dépôt</span>
                <span className="font-mono text-emerald-600 font-bold">VALIDÉ ✓</span>
              </div>
            </div>

            {/* Requester & Signature Box */}
            <div className="border border-slate-300 rounded-xl p-4 bg-white space-y-2 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Réceptionné & Signé Par (Demandeur / Chauffeur)</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  {exit.requesterName}
                </span>
              </div>

              {exit.signatureDataUrl ? (
                <div className="border border-slate-200 bg-slate-50/50 rounded-lg p-1 flex items-center justify-center">
                  <img
                    src={exit.signatureDataUrl}
                    alt="Signature"
                    className="max-h-12 object-contain"
                  />
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-lg h-12 flex items-center justify-center text-[11px] text-slate-400 italic">
                  Signature manuscrite / Cachet
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>Document généré automatiquement par Gascons v1.0 • Authentifié</span>
            <span className="font-mono">{new Date().toISOString().slice(0, 19).replace('T', ' ')}</span>
          </div>
        </div>

        {/* Bottom Interactive Modal Action Bar (Hidden when printing) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>← Retour au menu précédent</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-slate-100 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Télécharger le Bon</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
