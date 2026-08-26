import React, { useRef, useState } from 'react';
import {
  Building,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  Fuel,
  Image as ImageIcon,
  Layers,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Truck,
  Upload,
  X,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import { CompanyProfile } from '../types';

interface CompanySetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

const PRESET_LOGOS = [
  {
    id: 'fuel-shield',
    name: 'Énergie & Cuves',
    svgColor: 'from-amber-500 to-amber-600',
    icon: '⛽',
  },
  {
    id: 'btp-truck',
    name: 'BTP & Engins',
    svgColor: 'from-blue-600 to-indigo-700',
    icon: '🚜',
  },
  {
    id: 'transport-heavy',
    name: 'Transport Lourd',
    svgColor: 'from-emerald-600 to-teal-700',
    icon: '🚛',
  },
  {
    id: 'industry-gear',
    name: 'Industrie & Mines',
    svgColor: 'from-purple-600 to-slate-800',
    icon: '🏭',
  },
];

export const CompanySetupModal: React.FC<CompanySetupModalProps> = ({
  isOpen,
  onClose,
  isInitialSetup = false,
}) => {
  const { companyProfile, updateCompanyProfile } = useGascons();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(companyProfile.name || '');
  const [legalStatus, setLegalStatus] = useState(companyProfile.legalStatus || 'SARL');
  const [taxId, setTaxId] = useState(companyProfile.taxId || '');
  const [activity, setActivity] = useState(companyProfile.activity || 'Travaux Publics & Transport');
  const [logoUrl, setLogoUrl] = useState(companyProfile.logoUrl || '');
  const [phone, setPhone] = useState(companyProfile.phone || '');
  const [email, setEmail] = useState(companyProfile.email || '');
  const [address, setAddress] = useState(companyProfile.address || '');
  const [city, setCity] = useState(companyProfile.city || '');
  const [country, setCountry] = useState(companyProfile.country || '');
  const [currency, setCurrency] = useState(companyProfile.currency || 'DZD');
  const [headerTagline, setHeaderTagline] = useState(
    companyProfile.headerTagline || 'Gestion & Contrôle des Consommations de Gasoil'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [successSaved, setSuccessSaved] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Le logo est trop lourd (max 2 Mo).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrl(result);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setLogoUrl(result);
          setErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('La Raison Sociale (nom de la société) est obligatoire.');
      return;
    }

    const payload: Partial<CompanyProfile> = {
      isConfigured: true,
      name: name.trim(),
      legalStatus: legalStatus.trim(),
      taxId: taxId.trim(),
      activity: activity.trim(),
      logoUrl: logoUrl.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      currency: currency.trim(),
      headerTagline: headerTagline.trim(),
    };

    updateCompanyProfile(payload);
    setSuccessSaved(true);

    setTimeout(() => {
      setSuccessSaved(false);
      if (onClose) onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
                <Building2 className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/20">
                  {isInitialSetup ? 'Démarrage & Configuration Initiale' : 'Paramétrage de l Entreprise'}
                </span>
                <h2 className="text-xl font-black tracking-tight text-white mt-1">
                  {isInitialSetup ? 'Configuration de votre Société' : 'Modifier la Raison Sociale & Logo'}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ces informations apparaîtront sur l en-tête des bons de sortie, rapports et tableau de bord.
                </p>
              </div>
            </div>

            {!isInitialSetup && onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error / Success alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successSaved && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Informations de la société enregistrées avec succès !</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Logo & Identity Section */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              1. Logo Officiel de la Société
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Logo Preview Container */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/80 transition-colors relative min-h-[130px]">
                {logoUrl ? (
                  <div className="relative group flex flex-col items-center">
                    <img
                      src={logoUrl}
                      alt="Logo Société"
                      className="max-h-20 max-w-full object-contain rounded-lg drop-shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="mt-2 text-[10px] text-rose-600 hover:underline font-bold"
                    >
                      Supprimer le logo
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer text-center space-y-1"
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Importer Logo</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, SVG</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Quick Preset Logos or Upload button */}
              <div className="sm:col-span-8 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">
                    Ou choisissez un modèle prédéfini :
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Parcourir un fichier...
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {PRESET_LOGOS.map((p) => {
                    const isSelected = logoUrl === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setLogoUrl(p.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-base">{p.icon}</span>
                        <div className="truncate">
                          <p className="font-semibold text-xs leading-tight truncate">{p.name}</p>
                          <p className="text-[9px] text-slate-400">Prédéfini</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Identity Section */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              2. Identité Juridique & Raison Sociale
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Raison Sociale (Nom officiel de l entreprise) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="ex: SOCIÉTÉ NATIONALE DE TRAVAUX PUBLICS"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Forme Juridique
                </label>
                <select
                  value={legalStatus}
                  onChange={(e) => setLegalStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white outline-hidden"
                >
                  <option value="SARL">SARL</option>
                  <option value="SPA / SA">SPA / SA (Société Anonyme)</option>
                  <option value="SAS">SAS</option>
                  <option value="EURL">EURL</option>
                  <option value="SNC">SNC</option>
                  <option value="ETS">ETS (Entreprise Individuelle)</option>
                  <option value="GIE">GIE / Groupement</option>
                  <option value="Autre">Autre / Établissement Public</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Identifiants Fiscaux (RC, NIF, NIS, SIRET)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="ex: RC: 16/00-0987625B • NIF: 00161609876"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Secteur / Domaine d Activité
                </label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="ex: BTP, Mines, Terrassement, Logistique..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Contact & Location Section */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              3. Coordonnées & Siège
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Adresse du Siège Social / Dépôt Central
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex: Zone Industrielle Voie 04, Lot 18"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Ville / Pays
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="ex: Alger, Paris, Abidjan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Téléphone Contact
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+213 550 12 34 56"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Email Direction / Logistique
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@societe.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Devise Monétaire
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white outline-hidden"
                >
                  <option value="DZD">Dinar Algérien (DZD / DA)</option>
                  <option value="EUR">Euro (€ / EUR)</option>
                  <option value="FCFA">Franc CFA (XOF / XAF)</option>
                  <option value="MAD">Dirham Marocain (MAD)</option>
                  <option value="TND">Dinar Tunisien (TND)</option>
                  <option value="USD">Dollar US ($ / USD)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white space-y-2 border border-slate-800 shadow-md">
            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Aperçu en direct sur vos Bons de Sortie & Entêtes
            </p>
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center font-bold text-lg text-white">
                  {logoUrl && logoUrl.startsWith('data:') ? (
                    <img src={logoUrl} alt="Logo" className="max-h-8 max-w-full object-contain" />
                  ) : logoUrl ? (
                    <span>{PRESET_LOGOS.find((p) => p.id === logoUrl)?.icon || '⛽'}</span>
                  ) : (
                    <span>{name ? name.slice(0, 2).toUpperCase() : 'GS'}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">{name || 'VOTRE SOCIÉTÉ'}</h4>
                  <p className="text-[10px] text-slate-300">{legalStatus} • {activity || 'Secteur d activité'}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block text-[10px] text-slate-300 font-mono">
                <p>{taxId || 'NIF / RC : Non configuré'}</p>
                <p>{city || 'Dépôt Central'}</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {isInitialSetup ? (
              <p className="text-[11px] text-slate-500">
                Ces paramètres restent modifiables à tout moment dans l onglet <span className="font-bold">Base de Données</span>.
              </p>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Annuler
              </button>
            )}

            <button
              type="submit"
              className="ml-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isInitialSetup ? 'Valider et Démarrer Gascons' : 'Enregistrer les Modifications'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
