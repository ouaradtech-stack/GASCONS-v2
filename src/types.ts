export type UserRole = 'ADMIN' | 'GESTIONNAIRE' | 'SUPERVISEUR' | 'POMPISTE';

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
  currency?: string; // DZD, EUR, FCFA, MAD, USD...
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
