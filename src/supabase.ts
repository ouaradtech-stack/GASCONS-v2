import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE_URL = 'gascons_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'gascons_supabase_anon_key';
const STORAGE_KEY_SUPABASE_PROJECT_ID = 'gascons_supabase_project_id';

// Default project configuration provided by user
export const DEFAULT_SUPABASE_CONFIG = {
  projectId: 'bwauklkozmwuunevrpah',
  url: 'https://bwauklkozmwuunevrpah.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3YXVrbGtvem13dXVuZXZycGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDI1MzUsImV4cCI6MjEwMzc3ODUzNX0.s--SX8EEYczgCNEHQeaU9p6PK1cba_7amIhAqc13ouw',
};

/**
 * Normalizes Supabase Project URL by removing any trailing slashes or /rest/v1 paths
 * which causes the Supabase JS SDK client to fail.
 */
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip /rest/v1 or /rest/v1/ if user accidentally copied the REST endpoint
  url = url.replace(/\/rest\/v1\/?$/i, '');
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  return url;
}

// Retrieve configuration from env variables, localStorage, or pre-configured defaults
export function getStoredSupabaseConfig() {
  const envUrl = normalizeSupabaseUrl((import.meta as any).env?.VITE_SUPABASE_URL || '');
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();
  const envProjectId = ((import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || '').trim();

  const storedUrl =
    typeof window !== 'undefined'
      ? normalizeSupabaseUrl(localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || '')
      : '';
  const storedKey =
    typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || '').trim()
      : '';
  const storedProjectId =
    typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY_SUPABASE_PROJECT_ID) || '').trim()
      : '';

  const effectiveUrl = storedUrl || envUrl || DEFAULT_SUPABASE_CONFIG.url;
  const effectiveKey = storedKey || envKey || DEFAULT_SUPABASE_CONFIG.anonKey;
  const effectiveProjectId =
    storedProjectId || envProjectId || DEFAULT_SUPABASE_CONFIG.projectId;

  return {
    projectId: effectiveProjectId,
    url: effectiveUrl,
    anonKey: effectiveKey,
    isConfigured: !!(effectiveUrl && effectiveKey),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string, projectId?: string) {
  if (typeof window !== 'undefined') {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = anonKey.trim();

    if (cleanUrl) {
      localStorage.setItem(STORAGE_KEY_SUPABASE_URL, cleanUrl);
    } else {
      localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
    }

    if (cleanKey) {
      localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, cleanKey);
    } else {
      localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);
    }

    if (projectId && projectId.trim()) {
      localStorage.setItem(STORAGE_KEY_SUPABASE_PROJECT_ID, projectId.trim());
    }

    // Re-initialize client singleton
    supabaseInstance = null;
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  try {
    const cleanUrl = normalizeSupabaseUrl(url);
    supabaseInstance = createClient(cleanUrl, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (error) {
    console.error("Erreur lors de l'initialisation du client Supabase:", error);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  tables?: string[];
  needMigration?: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: "Supabase n'est pas encore configuré (URL ou clé Anon manquante).",
    };
  }

  try {
    // Try to query schema or test connection
    const { error } = await client.from('company_profiles').select('count', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet, it means authentication and network to Supabase work 100%!
      if (
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('schema cache')
      ) {
        return {
          connected: true,
          needMigration: true,
          message:
            'Projet Supabase connecté et joignable avec succès ! Les tables doivent être créées en exécutant le script SQL fourni dans le SQL Editor.',
        };
      }
      return {
        connected: false,
        message: `Erreur de connexion Supabase: ${error.message} (${error.code || 'Inconnu'})`,
      };
    }

    return {
      connected: true,
      needMigration: false,
      message: 'Projet Supabase connecté et tables opérationnelles pour la synchronisation !',
    };
  } catch (error: any) {
    return {
      connected: false,
      message: error?.message || 'Impossible de joindre le serveur Supabase.',
    };
  }
}

// SQL Schema for users to run in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- GASCONS : Script d'initialisation complet pour SUPABASE
-- Projet ID: bwauklkozmwuunevrpah
-- À coller et exécuter dans l'éditeur SQL de votre projet Supabase
-- ==========================================================

-- 1. Table Profil Entreprise
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  is_configured BOOLEAN NOT NULL DEFAULT false,
  name TEXT NOT NULL DEFAULT '',
  legal_status TEXT,
  tax_id TEXT,
  activity TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  currency TEXT DEFAULT 'DHS',
  header_tagline TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table Configuration du Stock de Gasoil
CREATE TABLE IF NOT EXISTS public.stock_configs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  initial_stock DOUBLE PRECISION NOT NULL DEFAULT 0,
  initial_stock_date TEXT NOT NULL DEFAULT '',
  tank_capacity DOUBLE PRECISION NOT NULL DEFAULT 20000,
  alert_threshold DOUBLE PRECISION NOT NULL DEFAULT 3000,
  critical_threshold DOUBLE PRECISION NOT NULL DEFAULT 1500,
  tank_name TEXT NOT NULL DEFAULT 'Cuve Principale',
  location TEXT NOT NULL DEFAULT 'Dépôt Central',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table Catégories de Véhicules / Engins
CREATE TABLE IF NOT EXISTS public.vehicle_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'KM',
  default_target_rate DOUBLE PRECISION NOT NULL DEFAULT 30,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table Départements / Chantiers
CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  manager TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table Véhicules & Engins
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES public.vehicle_categories(id) ON DELETE SET NULL,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  tank_capacity DOUBLE PRECISION NOT NULL DEFAULT 200,
  current_reading DOUBLE PRECISION NOT NULL DEFAULT 0,
  unit_type TEXT NOT NULL DEFAULT 'KM',
  assigned_driver TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIF',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Table Fournisseurs de Carburant
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  address TEXT,
  price_per_liter DOUBLE PRECISION NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Table Sorties de Gasoil (Distributions & Bons)
CREATE TABLE IF NOT EXISTS public.fuel_exits (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '12:00',
  vehicle_id TEXT REFERENCES public.vehicles(id) ON DELETE SET NULL,
  category_id TEXT,
  department_id TEXT,
  quantity_liters DOUBLE PRECISION NOT NULL,
  previous_reading DOUBLE PRECISION NOT NULL DEFAULT 0,
  current_reading DOUBLE PRECISION NOT NULL DEFAULT 0,
  distance_or_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
  calculated_consumption DOUBLE PRECISION NOT NULL DEFAULT 0,
  requester_name TEXT NOT NULL DEFAULT '',
  pump_operator_name TEXT NOT NULL DEFAULT '',
  signature_data_url TEXT,
  purpose TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Table Livraisons & Réceptions Cuve
CREATE TABLE IF NOT EXISTS public.fuel_deliveries (
  id TEXT PRIMARY KEY,
  delivery_number TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '12:00',
  supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
  quantity_liters DOUBLE PRECISION NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  tank_name TEXT NOT NULL DEFAULT 'Cuve Principale',
  driver_name TEXT,
  truck_plate TEXT,
  receiver_name TEXT NOT NULL DEFAULT '',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Table Ajustements de Jauge
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  previous_stock DOUBLE PRECISION NOT NULL,
  new_stock DOUBLE PRECISION NOT NULL,
  difference DOUBLE PRECISION NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  adjusted_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Table Utilisateurs & Opérateurs (avec Licences & Sous-Admins)
CREATE TABLE IF NOT EXISTS public.users (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'POMPISTE',
  department TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  avatar TEXT,
  password TEXT,
  client_company_name TEXT,
  client_phone TEXT,
  license_type TEXT DEFAULT 'MENSUEL',
  license_price DOUBLE PRECISION DEFAULT 0,
  license_expires_at TEXT,
  subscription_status TEXT DEFAULT 'ACTIF',
  suspension_reason TEXT,
  max_vehicles_quota INTEGER DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Table Entretiens & Maintenances Véhicules
CREATE TABLE IF NOT EXISTS public.vehicle_maintenances (
  id TEXT PRIMARY KEY,
  maintenance_number TEXT NOT NULL,
  vehicle_id TEXT REFERENCES public.vehicles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  current_reading DOUBLE PRECISION NOT NULL DEFAULT 0,
  unit_type TEXT NOT NULL DEFAULT 'KM',
  type TEXT NOT NULL DEFAULT 'VIDANGE',
  description TEXT,
  provider_name TEXT,
  cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  invoice_number TEXT,
  next_reading_due DOUBLE PRECISION,
  next_date_due TEXT,
  status TEXT NOT NULL DEFAULT 'TERMINE',
  performed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Table Abonnements Clients & Licences (Gestion OuaradTech)
CREATE TABLE IF NOT EXISTS public.client_subscriptions (
  id TEXT PRIMARY KEY,
  contract_number TEXT NOT NULL,
  client_company_name TEXT NOT NULL,
  client_contact_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  plan_type TEXT NOT NULL DEFAULT 'MENSUEL',
  plan_name TEXT NOT NULL DEFAULT 'Formule Standard',
  max_vehicles_quota INTEGER NOT NULL DEFAULT 50,
  price_dhs DOUBLE PRECISION NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'VIREMENT',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIF',
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration automatique des colonnes si les tables existent déjà
DO $$ 
BEGIN
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS client_company_name TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS client_phone TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'MENSUEL';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS license_price DOUBLE PRECISION DEFAULT 0;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS license_expires_at TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'ACTIF';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS max_vehicles_quota INTEGER DEFAULT 50;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notes TEXT;
END $$;

-- Activer Row Level Security (RLS)
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_exits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS d'accès public/authentifié pour l'application Gascons
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read-write for company_profiles" ON public.company_profiles;
  DROP POLICY IF EXISTS "Allow public read-write for stock_configs" ON public.stock_configs;
  DROP POLICY IF EXISTS "Allow public read-write for vehicle_categories" ON public.vehicle_categories;
  DROP POLICY IF EXISTS "Allow public read-write for departments" ON public.departments;
  DROP POLICY IF EXISTS "Allow public read-write for vehicles" ON public.vehicles;
  DROP POLICY IF EXISTS "Allow public read-write for suppliers" ON public.suppliers;
  DROP POLICY IF EXISTS "Allow public read-write for fuel_exits" ON public.fuel_exits;
  DROP POLICY IF EXISTS "Allow public read-write for fuel_deliveries" ON public.fuel_deliveries;
  DROP POLICY IF EXISTS "Allow public read-write for stock_adjustments" ON public.stock_adjustments;
  DROP POLICY IF EXISTS "Allow public read-write for users" ON public.users;
  DROP POLICY IF EXISTS "Allow public read-write for vehicle_maintenances" ON public.vehicle_maintenances;
  DROP POLICY IF EXISTS "Allow public read-write for client_subscriptions" ON public.client_subscriptions;

  CREATE POLICY "Allow public read-write for company_profiles" ON public.company_profiles FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for stock_configs" ON public.stock_configs FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for vehicle_categories" ON public.vehicle_categories FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for suppliers" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for fuel_exits" ON public.fuel_exits FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for fuel_deliveries" ON public.fuel_deliveries FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for stock_adjustments" ON public.stock_adjustments FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for vehicle_maintenances" ON public.vehicle_maintenances FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public read-write for client_subscriptions" ON public.client_subscriptions FOR ALL USING (true) WITH CHECK (true);
END $$;
`;
