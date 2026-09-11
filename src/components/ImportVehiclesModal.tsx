import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Info,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import { Department, Vehicle, VehicleCategory } from '../types';
import {
  generateVehicleCSVTemplate,
  parseVehiclesCSV,
  downloadFile,
  ParsedVehicleRow,
} from '../utils/exportHelpers';

interface ImportVehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: VehicleCategory[];
  departments: Department[];
  vehicles: Vehicle[];
  addVehicle: (v: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  onImportSuccess: (added: number, updated: number) => void;
  importVehicleBatch?: (newVehicles: Omit<Vehicle, 'id'>[], mode: 'merge' | 'append') => Promise<{ count: number; updated: number; batchId: string }>;
  lastImportedVehicleBatch?: { batchId: string; date: string; vehicleIds: string[]; count: number } | null;
  deleteLastImportedBatch?: () => Promise<{ success: boolean; deletedCount: number }>;
}

export const ImportVehiclesModal: React.FC<ImportVehiclesModalProps> = ({
  isOpen,
  onClose,
  categories,
  departments,
  vehicles,
  addVehicle,
  updateVehicle,
  onImportSuccess,
  importVehicleBatch,
  lastImportedVehicleBatch,
  deleteLastImportedBatch,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'file' | 'paste'>('file');
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedVehicleRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'append'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rollbackStatus, setRollbackStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const template = generateVehicleCSVTemplate();
    downloadFile(template, 'Modele_Import_Vehicules_Engins.csv', 'text/csv;charset=utf-8;');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || '';
      setCsvContent(text);
      const res = parseVehiclesCSV(text, categories, departments);
      setParsedRows(res.validVehicles);
      setParseErrors(res.errors);
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (text: string) => {
    setCsvContent(text);
    if (!text.trim()) {
      setParsedRows([]);
      setParseErrors([]);
      return;
    }
    const res = parseVehiclesCSV(text, categories, departments);
    setParsedRows(res.validVehicles);
    setParseErrors(res.errors);
  };

  const handleReset = () => {
    setCsvContent('');
    setFileName('');
    setParsedRows([]);
    setParseErrors([]);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    try {
      if (importVehicleBatch) {
        const result = await importVehicleBatch(parsedRows, importMode);
        onImportSuccess(result.count - result.updated, result.updated);
      } else {
        let added = 0;
        let updated = 0;
        parsedRows.forEach((row) => {
          const existing = importMode === 'merge'
            ? vehicles.find(
                (v) =>
                  (row.plateNumber && v.plateNumber.trim().toLowerCase() === row.plateNumber.trim().toLowerCase()) ||
                  (row.code && v.code.trim().toLowerCase() === row.code.trim().toLowerCase())
              )
            : undefined;

          if (existing) {
            updateVehicle(existing.id, row);
            updated++;
          } else {
            addVehicle(row);
            added++;
          }
        });
        onImportSuccess(added, updated);
      }

      handleReset();
      onClose();
    } catch (err) {
      console.error('Error during vehicle import:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteLastImport = async () => {
    if (!deleteLastImportedBatch) return;
    if (!window.confirm('Voulez-vous vraiment supprimer la dernière liste de véhicules importée ?')) return;

    setIsProcessing(true);
    try {
      const res = await deleteLastImportedBatch();
      if (res.success) {
        setRollbackStatus(`${res.deletedCount} véhicule(s) du dernier import ont été supprimé(s).`);
        setTimeout(() => setRollbackStatus(null), 4000);
      }
    } catch (err) {
      console.error('Error deleting last imported batch:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Upload className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-black text-base">Importer la Liste des Véhicules & Engins</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Importation en masse par fichier CSV ou copier-coller (compatible Excel)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Rollback status alert if triggered */}
          {rollbackStatus && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{rollbackStatus}</span>
            </div>
          )}

          {/* Last import info & Delete Last List Option */}
          {lastImportedVehicleBatch && lastImportedVehicleBatch.count > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-amber-900">
                    Dernière liste importée : {lastImportedVehicleBatch.count} véhicule(s)
                  </p>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Importé le {new Date(lastImportedVehicleBatch.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Vous pouvez annuler et supprimer cette liste si nécessaire.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDeleteLastImport}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Supprimer la dernière liste</span>
              </button>
            </div>
          )}

          {/* Template Download Prompt */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Vous n avez pas encore préparé votre fichier ?</p>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Téléchargez notre modèle CSV pré-formaté avec les colonnes attendues (Code, Immatriculation, Désignation, Catégorie, Capacité, etc.).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Télécharger Modèle CSV</span>
            </button>
          </div>

          {/* Tab Selector: File vs Paste */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveInputTab('file')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeInputTab === 'file'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Charger un Fichier CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveInputTab('paste')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeInputTab === 'paste'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Copier-Coller le Contenu CSV</span>
            </button>
          </div>

          {/* Input Method 1: File Upload */}
          {activeInputTab === 'file' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Sélectionner un fichier CSV / Texte (*.csv, *.txt)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-700 hover:underline">
                      Cliquez pour choisir un fichier
                    </span>{' '}
                    <span className="text-xs text-slate-500">ou glissez-déposez ici</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Séparateurs acceptés : virgule (,), point-virgule (;), tabulation (\t)</p>
                </label>
                {fileName && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{fileName}</span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input Method 2: Textarea Paste */}
          {activeInputTab === 'paste' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Collez les lignes CSV ici (première ligne avec les en-têtes)
              </label>
              <textarea
                value={csvContent}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="Code;Immatriculation;Designation;Categorie;Departement;Capacite;Compteur;Unite;Chauffeur&#10;V-01;12345-A-1;Camion Benne Actros;Poids Lourd;Exploitation;400;125000;KM;Ahmed"
                rows={6}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Mode Selection */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Comportement en cas de doublon :</span>
            <div className="flex flex-col sm:flex-row gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <strong>Mettre à jour</strong> les véhicules existants (si code ou immatriculation identique) et ajouter les nouveaux
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <strong>Ajouter tous</strong> comme nouveaux éléments
                </span>
              </label>
            </div>
          </div>

          {/* Warnings & Errors */}
          {parseErrors.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{parseErrors.length} avertissement(s) détecté(s) :</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-700 max-h-24 overflow-y-auto">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{parsedRows.length} véhicule(s) valide(s) prêt(s) à être importé(s)</span>
                </div>
                <span className="text-[11px] text-slate-400">Aperçu des 10 premiers</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Immatriculation</th>
                      <th className="px-3 py-2">Désignation</th>
                      <th className="px-3 py-2">Catégorie</th>
                      <th className="px-3 py-2 text-right">Capacité</th>
                      <th className="px-3 py-2 text-right">Compteur</th>
                      <th className="px-3 py-2">Chauffeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 10).map((v, i) => {
                      const cat = categories.find((c) => c.id === v.categoryId);
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 font-mono font-bold text-blue-900">{v.code}</td>
                          <td className="px-3 py-1.5 font-mono font-semibold">{v.plateNumber}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-800">{v.name}</td>
                          <td className="px-3 py-1.5">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {cat?.name || 'Standard'}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono">{v.tankCapacity} L</td>
                          <td className="px-3 py-1.5 text-right font-mono">
                            {v.currentReading} {v.unitType}
                          </td>
                          <td className="px-3 py-1.5 text-slate-500">{v.assignedDriver || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={handleExecuteImport}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all ${
              parsedRows.length > 0 && !isProcessing
                ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Importation en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Confirmer l importation ({parsedRows.length} véhicules)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
