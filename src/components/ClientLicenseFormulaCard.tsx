import React from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Fuel,
  Info,
  Lock,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';

interface ClientLicenseFormulaCardProps {
  onNavigate?: (tab: string) => void;
  compact?: boolean;
}

export const ClientLicenseFormulaCard: React.FC<ClientLicenseFormulaCardProps> = ({
  onNavigate,
  compact = false,
}) => {
  const {
    currentUser,
    isSuperAdmin,
    vehicles,
    clientPlanName,
    licenseExpiresAt,
    licenseDaysRemaining,
    isLicenseExpired,
    isCurrentClientSuspended,
    isClientLockedOut,
    maxVehiclesQuota,
    isVehicleQuotaReached,
  } = useGascons();

  // If Super Admin, this card is not relevant for their own dashboard
  if (isSuperAdmin) {
    return null;
  }

  const quotaPercent = Math.min(100, Math.round((vehicles.length / (maxVehiclesQuota || 1)) * 100));
  const isExpiringSoon = licenseDaysRemaining !== null && licenseDaysRemaining > 0 && licenseDaysRemaining <= 15;

  const statusConfig = isCurrentClientSuspended
    ? {
        label: 'Licence Suspendue',
        bg: 'bg-rose-50',
        border: 'border-rose-300',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: ShieldAlert,
        iconColor: 'text-rose-600',
        desc: currentUser.suspensionReason || 'Accès temporairement suspendu par le Super Administrateur.',
      }
    : isLicenseExpired
    ? {
        label: 'Licence Expirée',
        bg: 'bg-rose-50',
        border: 'border-rose-300',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: Lock,
        iconColor: 'text-rose-600',
        desc: `La période de validité de votre licence a pris fin le ${licenseExpiresAt}. Contactez l'administrateur pour renouveler votre formule.`,
      }
    : isExpiringSoon
    ? {
        label: `Échéance Proche (${licenseDaysRemaining}j restants)`,
        bg: 'bg-amber-50/90',
        border: 'border-amber-300',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        icon: Clock,
        iconColor: 'text-amber-600',
        desc: `Votre licence arrive à expiration dans ${licenseDaysRemaining} jours. Pensez à renouveler votre formule.`,
      }
    : {
        label: 'Licence Active & Valide',
        bg: 'bg-emerald-50/70',
        border: 'border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: ShieldCheck,
        iconColor: 'text-emerald-600',
        desc: `Licence valide jusqu'au ${licenseExpiresAt || 'Indéterminée'}.`,
      };

  const StatusIcon = statusConfig.icon;

  if (compact) {
    return (
      <div className={`p-4 rounded-2xl border ${statusConfig.border} ${statusConfig.bg} shadow-2xs space-y-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
            <span className="text-xs font-bold text-slate-900 truncate">
              {clientPlanName}
            </span>
          </div>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusConfig.badgeBg}`}>
            {statusConfig.label}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
          <span>Échéance : <strong>{licenseExpiresAt || 'N/A'}</strong></span>
          <span>Quota : <strong>{vehicles.length}/{maxVehiclesQuota} véh.</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="client-license-conditions-card"
      className={`rounded-2xl border ${statusConfig.border} bg-white shadow-2xs overflow-hidden transition-all`}
    >
      {/* Top Notification bar if expired or suspended */}
      {isClientLockedOut && (
        <div className="bg-rose-600 text-white px-5 py-2.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-200" />
            <span>
              {isCurrentClientSuspended
                ? 'COMPTE CLIENT SUSPENDU — Saisies de gasoil et réceptions temporairement bloquées.'
                : 'PÉRIODE DE VALIDITÉ EXPIRÉE — Vos saisies sont verrouillées jusqu au renouvellement.'}
            </span>
          </div>
          <span className="text-[11px] underline font-bold cursor-pointer">
            Support: ouaradtech@gmail.com
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-5">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300/60 text-amber-700 flex items-center justify-center font-bold shadow-xs">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-slate-900">
                  {currentUser.clientCompanyName || currentUser.name}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Formule : {clientPlanName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Contrôle des conditionnements et validité de votre licence logicielle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${statusConfig.badgeBg}`}
            >
              <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
              <span>{statusConfig.label}</span>
            </span>
          </div>
        </div>

        {/* Details Grid: Validity Period & Vehicle Quota */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Période de Validité de la Licence */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Période de Validité
              </span>
              {licenseDaysRemaining !== null && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono ${
                    licenseDaysRemaining <= 0
                      ? 'bg-rose-100 text-rose-800'
                      : licenseDaysRemaining <= 15
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {licenseDaysRemaining <= 0 ? 'Expirée' : `${licenseDaysRemaining}j restants`}
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 text-slate-700">
                <span className="text-slate-500">Date d échéance :</span>
                <span className="font-bold font-mono text-slate-900">
                  {licenseExpiresAt || 'Non renseignée'}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-700">
                <span className="text-slate-500">Statut licence :</span>
                <span className={`font-bold ${isClientLockedOut ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isCurrentClientSuspended ? 'Suspendue' : isLicenseExpired ? 'Expirée' : 'En cours de validité'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Quota Véhicules de la Formule */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                Conditionnement Parc Véhicules
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono">
                Max {maxVehiclesQuota} véh.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900 font-mono">
                  {vehicles.length}{' '}
                  <span className="text-xs font-normal text-slate-500">/ {maxVehiclesQuota} utilisés</span>
                </span>
                <span className={`text-xs font-bold font-mono ${isVehicleQuotaReached ? 'text-rose-600' : 'text-slate-600'}`}>
                  {quotaPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isVehicleQuotaReached
                      ? 'bg-rose-500'
                      : quotaPercent >= 80
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>
                  {isVehicleQuotaReached ? (
                    <strong className="text-rose-600">Plafond formule atteint</strong>
                  ) : (
                    <span>{maxVehiclesQuota - vehicles.length} places disponibles</span>
                  )}
                </span>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('base-donnees')}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Voir la flotte →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Prestations & Contrôles Inclus */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Prestations Incluses dans la Formule
            </div>
            <ul className="text-[11px] space-y-1 text-slate-700">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Sorties gasoil illimitées & bons signés</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Contrôle cuve & alertes stock en direct</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Suivi entretiens, révisions & vidanges</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Rapports analytiques & exports Excel</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quota reached warning */}
        {isVehicleQuotaReached && !isClientLockedOut && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Quota de la formule atteint :</strong> Vous utilisez l intégralité des{' '}
                {maxVehiclesQuota} véhicules inclus dans votre formule. Pour enregistrer davantage de véhicules,
                contactez le Super Administrateur pour passer à une formule supérieure.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
