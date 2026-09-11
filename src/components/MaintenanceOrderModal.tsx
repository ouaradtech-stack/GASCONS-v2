import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  MapPin,
  Printer,
  Shield,
  Truck,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { VehicleMaintenance } from '../types';
import { downloadMaintenanceOrderHTML } from '../utils/exportHelpers';

interface MaintenanceOrderModalProps {
  maintenance: VehicleMaintenance | null;
  onClose: () => void;
}

export const MaintenanceOrderModal: React.FC<MaintenanceOrderModalProps> = ({
  maintenance,
  onClose,
}) => {
  const { getVehicleById, getCategoryById, companyProfile } = useGascons();

  if (!maintenance) return null;

  const vehicle = getVehicleById(maintenance.vehicleId);
  const category = vehicle ? getCategoryById(vehicle.categoryId) : undefined;
  const currency = companyProfile.currency || 'DHS';
  const unit = vehicle?.unitType || 'KM';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadMaintenanceOrderHTML(maintenance, vehicle, category, companyProfile);
  };

  const statusConfig = {
    PLANIFIE: { label: 'Planifié / En attente', color: 'bg-sky-100 text-sky-800 border-sky-300' },
    EN_COURS: { label: 'En cours d atelier', color: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' },
    TERMINE: { label: 'Terminé / Réceptionné', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    ANNULE: { label: 'Annulé', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  }[maintenance.status] || { label: maintenance.status, color: 'bg-slate-100 text-slate-800 border-slate-300' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:my-0">
        {/* Header Toolbar (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white text-xs font-bold border border-blue-500/40 transition-all cursor-pointer shadow-xs"
              title="Retourner à la liste des entretiens"
            >
              <ArrowLeft className="w-4 h-4 text-blue-300" />
              <span>Retour</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-2">
                <span>Fiche d'Intervention & Entretien</span>
                <span className="font-mono text-blue-400">{maintenance.maintenanceNumber}</span>
              </h3>
              <p className="text-[11px] text-slate-400">Ordre de Réparation & Suivi Technique Flotte</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Imprimer directement"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              title="Télécharger la fiche HTML autonome"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Order Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Company & Order Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b-2 border-blue-600 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center p-2">
                {companyProfile.logoUrl ? (
                  <img
                    src={companyProfile.logoUrl}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Wrench className="w-7 h-7 text-blue-600" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  Carnet d'Entretien Flotte
                </span>
                <h1 className="text-xl font-black text-slate-900 mt-1">
                  {companyProfile.name || 'GASCONS'}
                </h1>
                <p className="text-xs text-slate-500">
                  {companyProfile.legalStatus || 'Société'} • NIF/RC: {companyProfile.taxId || 'Flotte Interne'}
                </p>
                <p className="text-xs text-slate-500">
                  {companyProfile.address || ''} {companyProfile.phone ? `• Tél: ${companyProfile.phone}` : ''}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl font-black font-mono text-blue-600">
                {maintenance.maintenanceNumber}
              </div>
              <div className="text-xs text-slate-500 flex items-center sm:justify-end gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Intervention le {maintenance.date} {maintenance.time ? `à ${maintenance.time}` : ''}</span>
              </div>
              <div className="mt-2">
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metric Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Véhicule</p>
              <p className="text-sm font-black text-slate-900 truncate">
                {vehicle?.code || 'VEH'} • {vehicle?.plateNumber || '-'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{vehicle?.name || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Compteur Intervention</p>
              <p className="text-base font-black text-blue-700 font-mono">
                {(maintenance.currentReading || 0).toLocaleString('fr-FR')} <span className="text-xs">{unit}</span>
              </p>
              <p className="text-[11px] text-slate-500">Relevé atelier</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Prochaine Échéance</p>
              <p className="text-sm font-black text-slate-900 font-mono">
                {maintenance.nextDueReading ? `${maintenance.nextDueReading.toLocaleString('fr-FR')} ${unit}` : (maintenance.nextDueDate || 'Non définie')}
              </p>
              <p className="text-[11px] text-slate-500">
                {maintenance.nextDueDate ? `Date: ${maintenance.nextDueDate}` : 'Selon kilométrage'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Montant Total</p>
              <p className="text-base font-black text-emerald-700 font-mono">
                {(maintenance.cost || 0).toLocaleString('fr-FR')} {currency}
              </p>
              <p className="text-[11px] text-slate-500">Coût travaux</p>
            </div>
          </div>

          {/* Vehicle & Workshop details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                Détails du Véhicule
              </h4>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">Code Parc :</span>
                <span className="font-bold text-slate-800">{vehicle?.code || '-'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">Immatriculation :</span>
                <span className="font-mono font-bold text-slate-900">{vehicle?.plateNumber || '-'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">Marque / Modèle :</span>
                <span className="font-medium text-slate-800">{vehicle?.name || '-'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">Catégorie :</span>
                <span className="font-medium text-slate-800">{category?.name || '-'}</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Chauffeur assigné :</span>
                <span className="font-bold text-slate-800">{vehicle?.assignedDriver || 'Non assigné'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                Atelier & Prestataire
              </h4>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">Garage / Prestataire :</span>
                <span className="font-bold text-blue-700">{maintenance.provider || 'Atelier Interne'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">Technicien / Mécanicien :</span>
                <span className="font-medium text-slate-800">{maintenance.technicianName || '-'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">N° Facture / BL :</span>
                <span className="font-mono font-bold text-slate-900">{maintenance.invoiceNumber || '-'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">Type de service :</span>
                <span className="font-bold text-slate-800">{maintenance.serviceType}</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Statut actuel :</span>
                <span className="font-bold text-slate-900">{statusConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Description & Work done */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText className="w-3.5 h-3.5 text-slate-700" />
              Descriptif des Travaux & Pièces Remplacées
            </h4>
            <div>
              <p className="text-xs font-bold text-slate-700">Objet de l'intervention :</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{maintenance.title}</p>
            </div>
            {maintenance.partsReplaced && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700">Pièces & consommables changés :</p>
                <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 whitespace-pre-line font-mono">
                  {maintenance.partsReplaced}
                </p>
              </div>
            )}
            {maintenance.notes && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700">Observations / Diagnostic :</p>
                <p className="text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 mt-1">
                  {maintenance.notes}
                </p>
              </div>
            )}
          </div>

          {/* Signatures box */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="border border-dashed border-slate-300 rounded-xl p-4 min-h-[110px] flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Le Prestataire / Chef d'Atelier</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {maintenance.technicianName || maintenance.provider || 'Atelier'}
                </p>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2 text-[10px] text-slate-400 italic">
                Date, Signature & Cachet Atelier
              </div>
            </div>

            <div className="border border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-4 min-h-[110px] flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-blue-700">Le Responsable Flotte / Direction</p>
                <p className="text-xs font-bold text-blue-950 mt-0.5">Visa & Bon pour Réception</p>
              </div>
              <div className="border-t border-dashed border-blue-200 pt-2 text-[10px] text-blue-600 font-bold">
                TRAVAUX RÉCEPTIONNÉS CONFORMES ✓
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            {companyProfile.name || 'GASCONS'} • Logiciel de Gestion Gasoil & Maintenance de Flotte
          </div>
        </div>

        {/* Bottom Bar Actions with prominent Retour button (Hidden on print) */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-xs"
            title="Fermer la fiche et retourner à la liste des entretiens"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>← Retour à la liste</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Télécharger Fiche (HTML)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
