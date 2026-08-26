import React, { useState } from 'react';
import {
  AppWindow,
  ArrowRight,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  HardDrive,
  Laptop,
  Monitor,
  Package,
  Play,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';

interface WindowsExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsExeModal: React.FC<WindowsExeModalProps> = ({ isOpen, onClose }) => {
  const { companyProfile } = useGascons();
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleDownloadBatch = () => {
    const batContent = `@echo off
title ${companyProfile.name || 'GASCONS'} - Compilation Package EXE Windows
color 0B
cls
echo ========================================================
echo        ${companyProfile.name || 'GASCONS'} - GENERATEUR EXECUTABLE WINDOWS (.EXE)
echo ========================================================
echo.
echo Ce script va generer :
echo  1. ${companyProfile.name || 'GASCONS'}-Setup-1.0.0.exe (Programme d'installation Windows)
echo  2. ${companyProfile.name || 'GASCONS'}-Portable.exe    (Version autonome sans installation)
echo.
echo [1/3] Verification de Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe. Telechargez-le sur https://nodejs.org/
    pause
    exit /b
)

echo [2/3] Installation des outils de compilation Desktop...
call npm install --save-dev electron electron-builder

echo [3/3] Creation de l'executable Windows (.EXE)...
call npm run dist:win

echo.
if exist "release\\" (
    echo ========================================================
    echo  SUCCES ! Vos fichiers executables sont prets dans le dossier :
    echo  \release\\
    echo ========================================================
    explorer release
)
pause
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-windows-exe.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadQuickLauncher = () => {
    const batContent = `@echo off
title ${companyProfile.name || 'GASCONS'} Desktop
cls
echo Lancement de ${companyProfile.name || 'GASCONS'} en mode Application Desktop Windows...
start msedge --app="https://ais-pre-6leusnufxnb52iudx4damc-494905499075.europe-west2.run.app" --window-size=1400,900 || start chrome --app="https://ais-pre-6leusnufxnb52iudx4damc-494905499075.europe-west2.run.app" --window-size=1400,900
exit
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lancer-${companyProfile.name || 'GASCONS'}-Desktop.bat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/20">
                    Édition Desktop Windows
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    Format .EXE (Setup & Portable)
                  </span>
                </div>
                <h2 className="text-xl font-black tracking-tight text-white mt-1">
                  Convertir & Installer GASCONS sur Windows (.EXE)
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Générez un fichier exécutable autonome pour installer l application sur n importe quel PC ou tablette Windows (hors-ligne).
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Full Installer .EXE */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 space-y-3 relative flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                    <Package className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Recommandé
                  </span>
                </div>
                <h3 className="font-black text-sm text-slate-900">
                  1. Générateur d Exécutable .EXE
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Crée un véritable installeur Windows (<strong className="text-blue-900">GASCONS-Setup.exe</strong>) avec icône sur le bureau et raccourci dans le menu Démarrer.
                </p>
              </div>

              <button
                onClick={handleDownloadBatch}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le Script de Compilation (.bat)</span>
              </button>
            </div>

            {/* Option 2: Instant Desktop App */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                    <AppWindow className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Immédiat (0 Compil)
                  </span>
                </div>
                <h3 className="font-black text-sm text-slate-900">
                  2. Lanceur Bureau Instantané
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lance immédiatement GASCONS dans une fenêtre autonome plein écran sans barre d adresse ni onglets de navigateur.
                </p>
              </div>

              <button
                onClick={handleDownloadQuickLauncher}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le Raccourci Bureau (.bat)</span>
              </button>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div className="space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Procédure en 3 Étapes pour Créer le Fichier .EXE
            </h3>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">
                    Exporter le Projet (ZIP)
                  </h4>
                  <p className="text-xs text-slate-600">
                    Dans le menu de Google AI Studio en haut à droite, cliquez sur les trois petits points <strong className="text-slate-800">⋮</strong> puis sur <strong className="text-blue-600">« Export to ZIP »</strong> ou téléchargez le code source. Extrayez le dossier ZIP sur votre PC Windows.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-sm shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">
                    Placer le script de compilation dans le dossier
                  </h4>
                  <p className="text-xs text-slate-600">
                    Placez le fichier <strong className="font-mono text-slate-800">build-windows-exe.bat</strong> à la racine du dossier extrait.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">
                    Double-cliquer sur le fichier .bat
                  </h4>
                  <p className="text-xs text-slate-600">
                    Le script assemble automatiquement l application et place l installeur final dans le dossier <strong className="font-mono text-emerald-700 font-bold">\release\GASCONS-Setup-1.0.0.exe</strong> !
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal / Advanced Command Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Ligne de Commande Windows (PowerShell / CMD)
              </span>
              <button
                onClick={() => handleCopy('npm install && npm run dist:win')}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono font-bold"
              >
                {copiedCmd ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copié !' : 'Copier la commande'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto select-all">
              npm install && npm run dist:win
            </pre>
          </div>

          {/* Windows Features Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-lg">📴</span>
              <h5 className="font-bold text-xs text-slate-900">100% Hors-Ligne</h5>
              <p className="text-[10px] text-slate-500">Fonctionne sur chantiers sans connexion réseau</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-lg">🖨️</span>
              <h5 className="font-bold text-xs text-slate-900">Impression Directe</h5>
              <p className="text-[10px] text-slate-500">Bons de sortie sur imprimantes thermiques & A4</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-lg">💾</span>
              <h5 className="font-bold text-xs text-slate-900">Sauvegarde Locale</h5>
              <p className="text-[10px] text-slate-500">Stockage sécurisé sur le disque dur Windows</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Compatible avec <strong className="text-slate-700">Windows 10, Windows 11 et Windows Server</strong> (64-bit / 32-bit).
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
