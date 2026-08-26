/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AdminDataView,
} from './components/AdminDataView';
import { CompanySetupModal } from './components/CompanySetupModal';
import { Dashboard } from './components/Dashboard';
import { FuelDeliveryView } from './components/FuelDeliveryView';
import { FuelExitForm } from './components/FuelExitForm';
import { FuelExitList } from './components/FuelExitList';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { ReportsExportView } from './components/ReportsExportView';
import { StockManagementView } from './components/StockManagementView';
import { VoucherModal } from './components/VoucherModal';
import { GasconsProvider, useGascons } from './context/GasconsContext';
import { FuelExit } from './types';
import { Fuel, ArrowLeft, CheckCircle2 } from 'lucide-react';

function GasconsApp() {
  const { companyProfile, isAuthenticated } = useGascons();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedVoucher, setSelectedVoucher] = useState<FuelExit | null>(null);
  const [recentSuccessTicket, setRecentSuccessTicket] = useState<FuelExit | null>(null);

  const handleFuelExitSuccess = (newExit: FuelExit) => {
    setSelectedVoucher(newExit);
    setRecentSuccessTicket(newExit);
    setCurrentTab('sorties');
  };

  // 1. Authentication Guard at App Startup
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* App Startup Company Profile Setup Guard Modal */}
      <CompanySetupModal
        isOpen={!companyProfile.isConfigured}
        isInitialSetup={true}
      />

      {/* Top Navigation */}
      <Navbar currentTab={currentTab} onNavigate={(tab) => setCurrentTab(tab)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success Toast Banner */}
        {recentSuccessTicket && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-600 text-white shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Sortie de Gasoil Enregistrée avec Succès !</p>
                <p className="text-xs text-emerald-100">
                  Bon N° <span className="font-mono font-bold">{recentSuccessTicket.ticketNumber}</span> • {recentSuccessTicket.quantityLiters} Litres distribués
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedVoucher(recentSuccessTicket)}
                className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition-colors"
              >
                Imprimer le Bon
              </button>
              <button
                onClick={() => setRecentSuccessTicket(null)}
                className="text-xs text-emerald-200 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {currentTab === 'dashboard' && (
          <Dashboard
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectVoucher={(exit) => setSelectedVoucher(exit)}
          />
        )}

        {currentTab === 'sorties' && (
          <FuelExitList
            onNewExitClick={() => setCurrentTab('nouvelle-sortie')}
          />
        )}

        {currentTab === 'nouvelle-sortie' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-blue-600" />
                  Saisie d une Nouvelle Sortie de Gasoil
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ravitaillement véhicule, relevé compteur, signature du demandeur et génération de bon
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('sorties')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la liste
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <FuelExitForm
                onSuccess={handleFuelExitSuccess}
                onCancel={() => setCurrentTab('sorties')}
              />
            </div>
          </div>
        )}

        {currentTab === 'livraisons' && <FuelDeliveryView />}

        {currentTab === 'stock' && <StockManagementView />}

        {currentTab === 'rapports' && <ReportsExportView />}

        {currentTab === 'base-donnees' && <AdminDataView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-800">GASCONS</span>
            <span>— Solution Professionnelle de Gestion de Gasoil</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Stock en direct • Traçabilité & Signatures • Exports Excel & Rapports
          </div>
        </div>
      </footer>

      {/* Floating Voucher Modal */}
      {selectedVoucher && (
        <VoucherModal
          exit={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <GasconsProvider>
      <GasconsApp />
    </GasconsProvider>
  );
}
