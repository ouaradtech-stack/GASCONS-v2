import React from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Droplet,
  FileText,
  Printer,
  ShieldCheck,
  Truck,
  UserCheck,
  X,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { FuelDelivery } from '../types';
import { downloadDeliveryVoucherHTML } from '../utils/exportHelpers';

interface DeliveryVoucherModalProps {
  delivery: FuelDelivery | null;
  onClose: () => void;
}

export const DeliveryVoucherModal: React.FC<DeliveryVoucherModalProps> = ({ delivery, onClose }) => {
  const { getSupplierById, stockConfig, companyProfile } = useGascons();

  if (!delivery) return null;

  const supplier = getSupplierById(delivery.supplierId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadDeliveryVoucherHTML(delivery, supplier, stockConfig, companyProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Toolbar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              title="Retourner au tableau des livraisons"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 hover:text-white text-xs font-bold border border-emerald-700/60 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-300" />
              <span>Retour</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-emerald-700/60 border border-emerald-600/50 flex items-center justify-center text-emerald-200">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Bon de Réception Carburant</h3>
              <p className="text-xs text-emerald-200">Fournisseur BL N° {delivery.deliveryNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Télécharger le bon de réception en fichier HTML"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold border border-emerald-600 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              Télécharger
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              Imprimer
            </button>
            <button
              onClick={onClose}
              title="Fermer"
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Body */}
        <div className="p-8 space-y-6 text-slate-800 print:p-0 print:space-y-4 print:text-black" id="printable-voucher">
          {/* Brand & Header Section */}
          <div className="flex items-start justify-between border-b-2 border-emerald-800 pb-5">
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
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-black shadow-xs">
                  <Truck className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-emerald-950 flex items-center gap-1.5">
                    {companyProfile.name || 'GASCONS'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                    {companyProfile.legalStatus || 'SARL'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {companyProfile.headerTagline || 'Gestion & Contrôle des Approvisionnements Carburant'}
                  {companyProfile.taxId ? ` • NIF: ${companyProfile.taxId}` : ''}
                </p>
                <p className="text-[11px] text-slate-400">
                  Site: <span className="font-semibold text-slate-600">{stockConfig.location || 'Dépôt Central'}</span> • Cuve: <span className="font-semibold text-slate-600">{delivery.tankName || stockConfig.tankName}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">N° Bon Livraison</span>
                <span className="text-base font-mono font-black text-emerald-900">{delivery.deliveryNumber}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-end gap-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {delivery.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {delivery.time}
                </span>
              </div>
            </div>
          </div>

          {/* Volume & Cost Spotlight */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-teal-50/50 border border-emerald-300 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-emerald-600" /> Volume Réceptionné en Cuve
              </span>
              <div className="text-4xl font-black text-emerald-950 font-mono tracking-tight flex items-baseline gap-2">
                +{delivery.quantityLiters.toLocaleString('fr-FR')} <span className="text-xl font-bold text-emerald-700">Litres</span>
              </div>
              <p className="text-xs text-emerald-800">
                Produit approvisionné : <span className="font-semibold">Gasoil / Carburant Diesel B7</span>
              </p>
            </div>
            <div className="text-right border-l border-emerald-200 pl-6">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Montant Total Livraison</span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {delivery.totalCost ? `${delivery.totalCost.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €` : '-'}
              </div>
              <div className="text-xs font-mono font-semibold text-emerald-800 mt-0.5">
                P.U : {delivery.unitPrice ? `${delivery.unitPrice.toFixed(3)} €/L` : '-'}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center justify-end gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Entrée Stock Validée
              </span>
            </div>
          </div>

          {/* Detail Boxes */}
          <div className="grid grid-cols-2 gap-4">
            {/* Box 1: Fournisseur & Transporteur */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Fournisseur & Transporteur
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fournisseur:</span>
                  <span className="font-bold text-slate-900">{supplier?.name || delivery.supplierId}</span>
                </div>
                {supplier?.contactName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact / Tél:</span>
                    <span className="font-medium text-slate-800">{supplier.contactName} ({supplier.phone})</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Chauffeur Citerne:</span>
                  <span className="font-semibold text-slate-800">{delivery.driverName || 'Non précisé'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Immatriculation Camion:</span>
                  <span className="font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                    {delivery.truckPlate || 'Standard'}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Dépôt & Contrôle Réception */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Cuve & Contrôle Réception
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cuve de Destination:</span>
                  <span className="font-bold text-emerald-900">{delivery.tankName || stockConfig.tankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacité Cuve:</span>
                  <span className="font-medium text-slate-700">{stockConfig.tankCapacity.toLocaleString('fr-FR')} Litres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Réceptionné Par:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {delivery.receiverName}
                  </span>
                </div>
                {delivery.notes && (
                  <div className="pt-1 border-t border-slate-200/80">
                    <span className="text-slate-500 block text-[11px] font-semibold">Observations :</span>
                    <span className="text-slate-700 italic text-[11px]">{delivery.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-28 bg-white">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Le Livreur / Chauffeur Citerne
                </span>
                <span className="text-xs font-semibold text-slate-800 mt-1 block">
                  {delivery.driverName || supplier?.name || 'Chauffeur Fournisseur'}
                </span>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2 text-[10px] text-slate-400 italic">
                Signature & émargement du livreur
              </div>
            </div>

            <div className="border border-emerald-300 rounded-xl p-4 flex flex-col justify-between h-28 bg-emerald-50/40">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Le Responsable Réceptionnaire
                </span>
                <span className="text-xs font-bold text-emerald-950 mt-1 block">
                  {delivery.receiverName}
                </span>
              </div>
              <div className="border-t border-dashed border-emerald-300 pt-2 flex items-center justify-between text-[10px] font-bold text-emerald-700">
                <span>DÉPOTAGE CONFORME</span>
                <span>VISA VALIDÉ ✓</span>
              </div>
            </div>
          </div>

          {/* Printable Footer */}
          <div className="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">
            <span>{companyProfile.name || 'Gascons'} • Système de Gestion et Contrôle de Stock Carburant</span>
            <span className="block mt-0.5">Édité le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</span>
          </div>
        </div>

        {/* Bottom Bar Actions (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            Enregistrement N° {delivery.id} • Stock automatiquement actualisé
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Télécharger le Bon (HTML)
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimer / Enregistrer en PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
