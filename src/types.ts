export type UserRole = 'SUPER_ADMIN' | 'SOUS_ADMIN' | 'ADMIN' | 'GESTIONNAIRE' | 'SUPERVISEUR' | 'POMPISTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  active: boolean;
  avatar?: string;
  password?: string;
  createdAt?: string;

  // Champs de gestion Sous-Admin & Vente Client (Licences)
  clientCompanyName?: string; // Raison sociale de l'entreprise cliente
  clientPhone?: string; // Numéro de contact client
  licenseType?: 'MENSUEL' | 'ANNUEL' | 'A_VIE' | 'DEMO' | 'STARTER' | 'BUSINESS' | 'ENTERPRISE' | 'SUR_MESURE';
  licensePrice?: number | string; // Prix de vente convenu
  licenseExpiresAt?: string; // Date d'expiration de la licence (YYYY-MM-DD)
  subscriptionExpiresAt?: string; // Date d'expiration de l'abonnement
  subscriptionStatus?: 'ACTIF' | 'SUSPENDU' | 'EXPIRE' | 'EN_ESSAI' | 'EN_ATTENTE';
  suspensionReason?: string; // Motif de désactivation / suspension (ex: impayé, expiration, litige)
  maxVehiclesQuota?: number; // Quota max de véhicules alloués
  notes?: string; // Notes internes Super Admin
}

export interface CompanyProfile {
  isConfigured: boolean;
  name: string; // Raison Sociale
  legalStatus?: string; // Forme juridique: SARL, SA, SAS, EURL, ETS...
  taxId?: string; // NIF / SIRET / Registre de Commerce
  activity?: string; // Secteur d'activité (BTP, Transport, Mines, Industrie...)
  logoUrl?: string; // Logo en Data URL ou URL
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string; // DHS, MAD, EUR, USD, FCFA...
  headerTagline?: string;
  updatedAt?: string;
}

export type VehicleUnitType = 'KM' | 'HEURES';

export interface VehicleCategory {
  id: string;
  name: string; // e.g., 'Poids Lourds', 'Engins de Chantier', 'Véhicules Légers', 'Groupes Électrogènes', 'Utilitaires'
  unitType: VehicleUnitType; // KM or HEURES
  defaultTargetRate: number; // L/100km or L/h
  description?: string;
  color: string;
}

export interface Vehicle {
  id: string;
  code: string; // e.g. "PL-101" or "ENG-04"
  plateNumber: string; // e.g., "1234-AB-56" or "SN-882-TR"
  name: string; // "Caterpillar 320D" / "Renault Trucks Kerax" / "Toyota Hilux"
  categoryId: string;
  departmentId: string;
  tankCapacity: number; // in Litres
  currentReading: number; // current KM or Hours
  unitType: VehicleUnitType;
  assignedDriver?: string;
  status: 'ACTIF' | 'EN_MAINTENANCE' | 'HORS_SERVICE';
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  code: string;
}

export interface Supplier {
  id: string;
  name: string; // e.g. "TotalEnergies", "Ola Energy", "Shell / Vivo", "Puma Energy"
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  pricePerLiter: number;
}

export interface FuelExit {
  id: string;
  ticketNumber: string; // e.g. "BS-2026-0042"
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  vehicleId: string;
  categoryId: string;
  departmentId: string;
  quantityLiters: number;
  previousReading: number; // Previous KM or Hours
  currentReading: number; // Current KM or Hours
  distanceOrHours: number; // Difference
  calculatedConsumption: number; // L/100km or L/h
  requesterName: string; // Demandeur
  pumpOperatorName: string; // Pompiste / Agent
  signatureDataUrl?: string; // Base64 signature image
  purpose?: string; // Motif / Destination (Chantier, Mission...)
  notes?: string;
  createdAt: string;
}

export interface FuelDelivery {
  id: string;
  deliveryNumber: string; // N° BL ou Facture
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  supplierId: string;
  quantityLiters: number;
  unitPrice: number; // Prix/L
  totalCost: number;
  tankName: string; // Cuve A, Cuve B
  driverName?: string; // Chauffeur Citerne
  truckPlate?: string; // Immatriculation Citerne
  receiverName: string; // Réceptionnaire
  notes?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  date: string;
  previousStock: number;
  newStock: number;
  difference: number;
  reason: string; // "Étalonnage jauge", "Inventaire physique", "Ajustement mensuel"
  adjustedBy: string;
  createdAt: string;
}

export interface StockConfig {
  initialStock: number; // Saisi initial
  initialStockDate: string;
  tankCapacity: number; // Capacité totale de la cuve (ex: 20000 L)
  alertThreshold: number; // Seuil alerte stock bas (ex: 3000 L)
  criticalThreshold: number; // Seuil alerte critique (ex: 1500 L)
  tankName: string;
  location: string;
}

export interface FilterOptions {
  categoryId: string;
  vehicleId: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  month: string; // "YYYY-MM" or "ALL"
  searchQuery: string;
}

export type MaintenanceServiceType =
  | 'VIDANGE'
  | 'FILTRES'
  | 'FREINAGE'
  | 'PNEUMATIQUES'
  | 'REVISION'
  | 'CONTROLE_TECHNIQUE'
  | 'DISTRIBUTION'
  | 'BATTERIE'
  | 'SUSPENSION'
  | 'CLIMATISATION'
  | 'REPARATION_MECANIQUE'
  | 'LAVAGE_NETTOYAGE'
  | 'AUTRE';

export type MaintenanceStatus = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

export type SubscriptionPlanType =
  | 'MENSUEL'
  | 'TRIMESTRIEL'
  | 'SEMESTRIEL'
  | 'ANNUEL'
  | 'A_VIE'
  | 'PACK_FLOTTE_15'
  | 'PACK_FLOTTE_50'
  | 'ILLIMITE'
  | 'SUR_MESURE';

export type SubscriptionPaymentMethod = 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'CARTE' | 'AUTRE';

export interface ClientSubscription {
  id: string;
  contractNumber: string; // e.g. "ABN-2026-001"
  clientCompanyName: string;
  clientContactName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCity?: string;
  clientTaxId?: string; // ICE / IF / RC
  userId?: string; // Linked sub-admin user ID
  planType: SubscriptionPlanType;
  planName: string;
  priceDHS: number;
  paymentMethod: SubscriptionPaymentMethod;
  paymentReference?: string;
  isPaid: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'ACTIF' | 'SUSPENDU' | 'EXPIRE' | 'EN_ATTENTE';
  maxVehiclesQuota: number;
  notes?: string;
  createdAt: string;
}

export interface VehicleMaintenance {
  id: string;
  maintenanceNumber: string; // e.g. "ENT-2026-001"
  vehicleId: string;
  serviceType: MaintenanceServiceType;
  title: string; // e.g. "Vidange moteur 15W40 + Filtres à huile et gasoil"
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  currentReading: number; // KM or Hours when serviced
  nextDueReading?: number; // Next service at KM/Hours (e.g. 135 000 km)
  nextDueDate?: string; // Next service date (e.g. YYYY-MM-DD)
  cost: number; // Total cost in currency (e.g. € or DZD)
  provider: string; // Garage / Atelier interne / Concessionnaire
  invoiceNumber?: string; // N° Facture / BL / Devis
  technicianName?: string; // Nom mécanicien / chef atelier
  status: MaintenanceStatus;
  partsReplaced?: string; // Pièces et consommables (ex: 20L Huile 15W40, 1x Filtre gasoil, Plaquettes AV)
  notes?: string; // Observations, diagnostic, préconisations
  createdAt: string;
}
