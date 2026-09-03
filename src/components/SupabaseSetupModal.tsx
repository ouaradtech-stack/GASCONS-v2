import React, { useState, useEffect } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Cloud,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Key,
  Layers,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  SUPABASE_SQL_SCHEMA,
  testSupabaseConnection,
} from '../supabase';
import { SupabaseService } from '../services/supabaseService';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    companyProfile,
    stockConfig,
    categories,
    vehicles,
    departments,
    suppliers,
    fuelExits,
    fuelDeliveries,
    stockAdjustments,
    users,
    supabaseStatus,
    setSupabaseStatus,
  } = useGascons();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');
  const [isSqlCopied, setIsSqlCopied] = useState(false);
  const [showSqlEditor, setShowSqlEditor] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTestResult(null);
      setSyncSuccessMessage('');
      setSaveMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    setSaveMessage('Paramètres Supabase enregistrés avec succès !');
    setTimeout(() => setSaveMessage(''), 3000);
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    saveSupabaseConfig(url, anonKey);
    const res = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(res);
    if (res.connected) {
      setSupabaseStatus('connected');
    } else {
      setSupabaseStatus('offline');
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage('');
    saveSupabaseConfig(url, anonKey);

    const result = await SupabaseService.syncAllToSupabase({
      companyProfile,
      stockConfig,
      categories,
      vehicles,
      departments,
      suppliers,
      fuelExits,
      fuelDeliveries,
      stockAdjustments,
      users,
    });

    setIsSyncing(false);
    if (result.success) {
      setSyncSuccessMessage(`✅ Synchronisation réussie ! ${result.count} éléments envoyés vers Supabase.`);
      setSupabaseStatus('connected');
    } else {
      setTestResult({
        connected: false,
        message: result.error || 'Erreur lors de la synchronisation vers Supabase.',
      });
    }
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsSqlCopied(true);
    setTimeout(() => setIsSqlCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Connexion Supabase Database</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  PostgreSQL Cloud
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Synchronisation temps réel avec votre projet Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
            supabaseStatus === 'connected'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              supabaseStatus === 'connected' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Database className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-bold flex items-center gap-2">
                <span>Statut Supabase :</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  supabaseStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    supabaseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                  {supabaseStatus === 'connected' ? 'Connecté & Opérationnel' : 'Non Connecté'}
                </span>
              </div>
              <p className="mt-1 text-slate-600">
                Connectez votre projet Supabase en entrant l'URL du projet et la clé publique <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">anon</code>.
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              Identifiants de votre projet Supabase
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-3 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase">
                  HTTPS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Disponible dans votre tableau de bord Supabase &gt; Project Settings &gt; API.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supabase Anon Key (Public API Key)
              </label>
              <textarea
                rows={2}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Clé d'API publique avec politiques Row Level Security (RLS) actives.
              </p>
            </div>

            {saveMessage && (
              <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveMessage}</span>
              </div>
            )}

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                testResult.connected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                {testResult.connected ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url || !anonKey}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Test en cours...' : 'Tester la connexion'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncing || !url || !anonKey}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all ml-auto"
              >
                <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser tout vers Supabase'}</span>
              </button>
            </div>

            {syncSuccessMessage && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 mt-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* SQL Migration Script Section */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-xs text-white">
                  Script SQL d'initialisation des tables Supabase
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copySqlSchema}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                >
                  {isSqlCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le Script SQL</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlEditor(!showSqlEditor)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition-colors"
                  title="Afficher/Masquer le code SQL"
                >
                  {showSqlEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pour créer automatiquement toutes les tables (profil, véhicules, sorties, livraisons, stock) dans votre projet Supabase, copiez le script SQL ci-dessus et exécutez-le dans le <strong className="text-emerald-300">SQL Editor</strong> de Supabase.
            </p>

            {showSqlEditor && (
              <div className="relative mt-3">
                <pre className="p-4 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 border border-slate-800 scrollbar-thin">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Steps Guide */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Guide rapide en 3 étapes :
            </h5>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
              <li>Créez un projet sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a>.</li>
              <li>Dans l'onglet <strong>SQL Editor</strong> de Supabase, collez le script SQL ci-dessus et cliquez sur <strong>Run</strong>.</li>
              <li>Copiez votre <strong>Project URL</strong> et votre <strong>Anon Public Key</strong> dans les champs ci-dessus, puis cliquez sur <strong>Synchroniser tout vers Supabase</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Supporte le mode multi-utilisateurs & offline</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
