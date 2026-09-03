import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Droplet,
  FileText,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Truck,
  UserCheck,
  X,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { FuelDelivery } from '../types';
import { DeliveryVoucherModal } from './DeliveryVoucherModal';
import { downloadDeliveryVoucherHTML, exportDeliveriesToCSV } from '../utils/exportHelpers';

export const FuelDeliveryView: React.FC = () => {
  const {
    suppliers,
    fuelDeliveries,
    stockConfig,
    companyProfile,
    currentUser,
    addFuelDelivery,
    updateFuelDelivery,
    deleteFuelDelivery,
    getSupplierById,
    totalDeliveriesLiters,
    totalDeliverySpend,
  } = useGascons();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('ALL');

  // Selected voucher for full-screen / print view
  const [selectedDeliveryVoucher, setSelectedDeliveryVoucher] = useState<FuelDelivery | null>(null);

  // Deletion modal state
  const [deliveryToDelete, setDeliveryToDelete] = useState<FuelDelivery | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit modal state
  const [editingDelivery, setEditingDelivery] = useState<FuelDelivery | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState('');
  const [editDeliveryNumber, setEditDeliveryNumber] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editQuantityLiters, setEditQuantityLiters] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');
  const [editDriverName, setEditDriverName] = useState('');
  const [editTruckPlate, setEditTruckPlate] = useState('');
  const [editReceiverName, setEditReceiverName] = useState('');
  const [editTankName, setEditTankName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // New Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [quantityLiters, setQuantityLiters] = useState('');
  const [unitPrice, setUnitPrice] = useState(suppliers[0]?.pricePerLiter ? String(suppliers[0].pricePerLiter) : '1.45');
  const [driverName, setDriverName] = useState('');
  const [truckPlate, setTruckPlate] = useState('');
  const [receiverName, setReceiverName] = useState(currentUser.name || '');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Permissions: Super Admin, Admin, Sous-Admin, Gestionnaire & Pompiste can manage
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.email === 'ouaradtech@gmail.com';
  const canManage = isSuperAdmin || currentUser.role === 'ADMIN' || currentUser.role === 'SOUS_ADMIN' || currentUser.role === 'GESTIONNAIRE' || currentUser.role === 'POMPISTE';

  // Handle supplier change to update unit price default
  const handleSupplierChange = (supId: string) => {
    setSupplierId(supId);
    const sup = getSupplierById(supId);
    if (sup?.pricePerLiter) {
      setUnitPrice(String(sup.pricePerLiter));
    }
  };

  const qty = Number(quantityLiters || 0);
  const price = Number(unitPrice || 0);
  const computedTotalCost = qty * price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!supplierId) {
      setErrorMsg('Veuillez sélectionner un fournisseur.');
      return;
    }

    if (qty <= 0) {
      setErrorMsg('La quantité livrée doit être supérieure à 0 Litre.');
      return;
    }

    if (price < 0) {
      setErrorMsg('Le prix unitaire ne peut pas être négatif.');
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const timeStr = today.toTimeString().slice(0, 5);

    const generatedBL = deliveryNumber.trim() || `BL-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    addFuelDelivery({
      deliveryNumber: generatedBL,
      date: dateStr,
      time: timeStr,
      supplierId,
      quantityLiters: qty,
      unitPrice: price,
      totalCost: computedTotalCost,
      tankName: stockConfig.tankName,
      driverName: driverName.trim() || undefined,
      truckPlate: truckPlate.trim() || undefined,
      receiverName: receiverName.trim() || currentUser.name || 'Réceptionnaire',
      notes: notes.trim() || undefined,
    });

    setIsFormOpen(false);
    setDeliveryNumber('');
    setQuantityLiters('');
    setNotes('');
  };

  // Open Edit Modal prefilled
  const handleOpenEdit = (del: FuelDelivery) => {
    setEditingDelivery(del);
    setEditSupplierId(del.supplierId);
    setEditDeliveryNumber(del.deliveryNumber);
    setEditDate(del.date);
    setEditTime(del.time);
    setEditQuantityLiters(String(del.quantityLiters));
    setEditUnitPrice(del.unitPrice !== undefined ? String(del.unitPrice) : '1.45');
    setEditDriverName(del.driverName || '');
    setEditTruckPlate(del.truckPlate || '');
    setEditReceiverName(del.receiverName || '');
    setEditTankName(del.tankName || stockConfig.tankName);
    setEditNotes(del.notes || '');
    setEditErrorMsg('');
    setIsEditModalOpen(true);
  };

  // Save edits
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg('');

    if (!editingDelivery) return;

    if (!editSupplierId) {
      setEditErrorMsg('Veuillez sélectionner un fournisseur.');
      return;
    }

    const editQty = Number(editQuantityLiters || 0);
    const editPrice = Number(editUnitPrice || 0);

    if (editQty <= 0) {
      setEditErrorMsg('La quantité livrée doit être supérieure à 0 Litre.');
      return;
    }

    if (editPrice < 0) {
      setEditErrorMsg('Le prix unitaire ne peut pas être négatif.');
      return;
    }

    updateFuelDelivery(editingDelivery.id, {
      supplierId: editSupplierId,
      deliveryNumber: editDeliveryNumber.trim() || editingDelivery.deliveryNumber,
      date: editDate || editingDelivery.date,
      time: editTime || editingDelivery.time,
      quantityLiters: editQty,
      unitPrice: editPrice,
      totalCost: editQty * editPrice,
      tankName: editTankName.trim() || editingDelivery.tankName || stockConfig.tankName,
      driverName: editDriverName.trim() || undefined,
      truckPlate: editTruckPlate.trim() || undefined,
      receiverName: editReceiverName.trim() || editingDelivery.receiverName,
      notes: editNotes.trim() || undefined,
    });

    setIsEditModalOpen(false);
    setEditingDelivery(null);
  };

  // Open Delete Modal
  const handleOpenDelete = (del: FuelDelivery) => {
    setDeliveryToDelete(del);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (deliveryToDelete) {
      deleteFuelDelivery(deliveryToDelete.id);
      setIsDeleteModalOpen(false);
      setDeliveryToDelete(null);
    }
  };

  // Quick download voucher
  const handleQuickDownloadVoucher = (del: FuelDelivery) => {
    const sup = getSupplierById(del.supplierId);
    downloadDeliveryVoucherHTML(del, sup, stockConfig, companyProfile);
  };

  // Export filtered deliveries to CSV
  const handleExportCSV = () => {
    exportDeliveriesToCSV(filteredDeliveries, getSupplierById);
  };

  const filteredDeliveries = fuelDeliveries.filter((d) => {
    if (selectedSupplierFilter !== 'ALL' && d.supplierId !== selectedSupplierFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sup = getSupplierById(d.supplierId);
      const matchBL = d.deliveryNumber.toLowerCase().includes(q);
      const matchSup = sup?.name.toLowerCase().includes(q) || false;
      const matchRec = d.receiverName.toLowerCase().includes(q);
      if (!matchBL && !matchSup && !matchRec) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            Livraisons des Fournisseurs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Réception des approvisionnements en carburant, suivi des bons de livraison (BL), modification et exports
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV/Excel */}
          <button
            onClick={handleExportCSV}
            title="Télécharger la liste des livraisons en fichier Excel / CSV"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Exporter CSV / Excel
          </button>

          {/* Print Register */}
          <button
            onClick={() => window.print()}
            title="Imprimer le registre des livraisons fournisseurs"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimer Registre
          </button>

          {/* New Delivery */}
          {canManage && (
            <button
              onClick={() => {
                setReceiverName(currentUser.name || '');
                setIsFormOpen(true);
              }}
              id="new-fuel-delivery-btn"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Réceptionner une Livraison
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        {/* Total Litres Delivered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Volume Réceptionné</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Droplet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalDeliveriesLiters.toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-500">Litres</span>
          </div>
          <p className="text-[11px] text-slate-400">Cumul de toutes les livraisons enregistrées</p>
        </div>

        {/* Total Cost Spend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dépenses Totales d Approvisionnement</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono">
            {totalDeliverySpend.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-slate-500">€</span>
          </div>
          <p className="text-[11px] text-slate-400">Basé sur le prix unitaire HT/TTC saisi</p>
        </div>

        {/* Active Suppliers Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Fournisseurs Actifs</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-purple-900 font-mono">
            {suppliers.length} <span className="text-sm font-bold text-slate-500">partenaires</span>
          </div>
          <p className="text-[11px] text-slate-400">TotalEnergies, Ola Energy, Puma...</p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between print:hidden">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Rechercher par N° BL, fournisseur, réceptionnaire..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedSupplierFilter}
              onChange={(e) => setSelectedSupplierFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="ALL">Tous les fournisseurs</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">N° BL / Facture</th>
                <th className="px-4 py-3.5">Date & Heure</th>
                <th className="px-4 py-3.5">Fournisseur</th>
                <th className="px-4 py-3.5 text-right">Volume Reçu</th>
                <th className="px-4 py-3.5 text-right">Prix Unitaire</th>
                <th className="px-4 py-3.5 text-right">Montant Total</th>
                <th className="px-4 py-3.5">Citerne & Chauffeur</th>
                <th className="px-4 py-3.5">Réceptionné Par</th>
                <th className="px-4 py-3.5 text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Aucune livraison enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => {
                  const supplier = getSupplierById(del.supplierId);
                  return (
                    <tr key={del.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* BL */}
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">
                        {del.deliveryNumber}
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{del.date}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block ml-4.5">{del.time}</span>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {supplier?.name || del.supplierId}
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-mono font-black text-sm bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                          +{del.quantityLiters.toLocaleString('fr-FR')} L
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                        {del.unitPrice !== undefined ? `${del.unitPrice.toFixed(3)} €/L` : '-'}
                      </td>

                      {/* Total Cost */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        {del.totalCost !== undefined ? `${del.totalCost.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €` : '-'}
                      </td>

                      {/* Truck & Driver */}
                      <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                        <div>{del.truckPlate ? `Immat: ${del.truckPlate}` : 'Citerne standard'}</div>
                        {del.driverName && <div className="text-slate-400">Chauf: {del.driverName}</div>}
                      </td>

                      {/* Receiver */}
                      <td className="px-4 py-3.5 text-slate-700">
                        <div className="flex items-center gap-1 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {del.receiverName}
                        </div>
                        {del.notes && <div className="text-[10px] text-slate-400 italic">{del.notes}</div>}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. View / Print Official Voucher */}
                          <button
                            onClick={() => setSelectedDeliveryVoucher(del)}
                            title="Consulter et Imprimer le Bon de Réception Carburant"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* 2. Direct Download HTML Slip */}
                          <button
                            onClick={() => handleQuickDownloadVoucher(del)}
                            title="Télécharger directement le Bon de Réception (HTML)"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* 3. Modifier */}
                          {canManage && (
                            <button
                              onClick={() => handleOpenEdit(del)}
                              title="Modifier cette livraison"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {/* 4. Supprimer */}
                          {canManage && (
                            <button
                              onClick={() => handleOpenDelete(del)}
                              title="Supprimer cette livraison"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Modal Delivery Voucher (Print & Download Official Slip) */}
      {selectedDeliveryVoucher && (
        <DeliveryVoucherModal
          delivery={selectedDeliveryVoucher}
          onClose={() => setSelectedDeliveryVoucher(null)}
        />
      )}

      {/* Modal Delete Confirmation */}
      {isDeleteModalOpen && deliveryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Supprimer la Livraison</h3>
              </div>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeliveryToDelete(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-2">
              <p className="font-bold">
                Êtes-vous sûr de vouloir supprimer la livraison N° {deliveryToDelete.deliveryNumber} ?
              </p>
              <div className="text-[11px] text-rose-800 space-y-0.5">
                <p>• Fournisseur : <span className="font-semibold">{getSupplierById(deliveryToDelete.supplierId)?.name || deliveryToDelete.supplierId}</span></p>
                <p>• Volume dépoté : <span className="font-semibold font-mono">+{deliveryToDelete.quantityLiters.toLocaleString('fr-FR')} L</span></p>
                <p>• Date : <span className="font-semibold">{deliveryToDelete.date} à {deliveryToDelete.time}</span></p>
              </div>
              <p className="text-[10px] text-rose-700 font-semibold mt-1">
                ⚠️ Attention : Le stock de la cuve sera automatiquement diminué de {deliveryToDelete.quantityLiters.toLocaleString('fr-FR')} Litres dès validation.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeliveryToDelete(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer Définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Delivery */}
      {isEditModalOpen && editingDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-blue-700 text-white">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                <h3 className="font-bold text-base">Modifier la Livraison N° {editingDelivery.deliveryNumber}</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDelivery(null);
                }}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              {editErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fournisseur */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fournisseur <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editSupplierId}
                    onChange={(e) => setEditSupplierId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* N° BL */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    N° Bon de Livraison / Facture <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editDeliveryNumber}
                    onChange={(e) => setEditDeliveryNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* Heure */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Heure</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* Quantite Litres */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quantité Livrée (Litres) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={editQuantityLiters}
                      onChange={(e) => setEditQuantityLiters(e.target.value)}
                      required
                      className="w-full pl-8 pr-12 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                    <Droplet className="w-4 h-4 text-emerald-600 absolute left-2.5 top-2.5" />
                    <span className="absolute right-3 top-2 font-bold text-slate-400">L</span>
                  </div>
                </div>

                {/* Prix Unitaire */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prix Unitaire (€ / Litre)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editUnitPrice}
                      onChange={(e) => setEditUnitPrice(e.target.value)}
                      className="w-full pl-8 pr-12 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <span className="absolute right-3 top-2 font-bold text-slate-400">€/L</span>
                  </div>
                </div>
              </div>

              {/* Total Cost recalculation notice */}
              {Number(editQuantityLiters || 0) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-blue-900 font-semibold">Montant Total Recalculé :</span>
                  <span className="text-base font-black text-blue-950 font-mono">
                    {(Number(editQuantityLiters || 0) * Number(editUnitPrice || 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chauffeur */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chauffeur Citerne</label>
                  <input
                    type="text"
                    value={editDriverName}
                    onChange={(e) => setEditDriverName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* Immat Camion */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Immatriculation Camion Citerne</label>
                  <input
                    type="text"
                    value={editTruckPlate}
                    onChange={(e) => setEditTruckPlate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* Réceptionnaire */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Réceptionné Par <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editReceiverName}
                    onChange={(e) => setEditReceiverName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* Cuve */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cuve de Destination</label>
                  <input
                    type="text"
                    value={editTankName}
                    onChange={(e) => setEditTankName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observations / Contrôle qualité</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingDelivery(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal New Delivery Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <h3 className="font-bold text-base">Nouvelle Livraison de Carburant (Gasoil)</h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fournisseur */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fournisseur <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* N° BL */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    N° Bon de Livraison / Facture <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryNumber}
                    onChange={(e) => setDeliveryNumber(e.target.value)}
                    placeholder="ex: BL-2026-9481"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                {/* Quantite Litres */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quantité Livrée (Litres) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={quantityLiters}
                      onChange={(e) => setQuantityLiters(e.target.value)}
                      placeholder="ex: 10000"
                      required
                      className="w-full pl-8 pr-12 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                    <Droplet className="w-4 h-4 text-emerald-600 absolute left-2.5 top-2.5" />
                    <span className="absolute right-3 top-2 font-bold text-slate-400">L</span>
                  </div>
                </div>

                {/* Prix Unitaire */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prix Unitaire (€ / Litre)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder="1.45"
                      className="w-full pl-8 pr-12 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <span className="absolute right-3 top-2 font-bold text-slate-400">€/L</span>
                  </div>
                </div>
              </div>

              {/* Total Cost auto calculation */}
              {computedTotalCost > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-emerald-900 font-semibold">Montant Total Estimé de la Livraison:</span>
                  <span className="text-base font-black text-emerald-950 font-mono">
                    {computedTotalCost.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chauffeur Citerne */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chauffeur Citerne</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Nom du chauffeur fournisseur"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                {/* Immat Citerne */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Immatriculation Camion Citerne</label>
                  <input
                    type="text"
                    value={truckPlate}
                    onChange={(e) => setTruckPlate(e.target.value)}
                    placeholder="ex: 984-BL-75"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                {/* Réceptionnaire */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Réceptionné Par (Agent / Gestionnaire) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Votre nom"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                {/* Cuve */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cuve de Destination</label>
                  <input
                    type="text"
                    value={stockConfig.tankName}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-slate-600"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observations / Contrôle qualité</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex: Test de densité conforme, pas de fuite constatée..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  Valider la Réception (+{qty > 0 ? qty : 0} L)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
