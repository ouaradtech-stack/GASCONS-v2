import {
  CompanyProfile,
  Department,
  FuelDelivery,
  FuelExit,
  StockAdjustment,
  StockConfig,
  Supplier,
  User,
  Vehicle,
  VehicleCategory,
} from '../types';

export const SqlService = {
  // Check health / connection
  async checkConnection(): Promise<{ status: string; database?: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Échec de connexion au serveur');
      return await res.json();
    } catch (err) {
      console.warn('Erreur de connexion SQL /api/health:', err);
      return { status: 'offline' };
    }
  },

  // 1. Company Profile
  async getCompanyProfile(): Promise<CompanyProfile | null> {
    try {
      const res = await fetch('/api/company');
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Erreur getCompanyProfile SQL:', err);
      return null;
    }
  },

  async saveCompanyProfile(profile: CompanyProfile): Promise<boolean> {
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveCompanyProfile SQL:', err);
      return false;
    }
  },

  // 2. Stock Config
  async getStockConfig(): Promise<StockConfig | null> {
    try {
      const res = await fetch('/api/stock/config');
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Erreur getStockConfig SQL:', err);
      return null;
    }
  },

  async saveStockConfig(config: StockConfig): Promise<boolean> {
    try {
      const res = await fetch('/api/stock/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveStockConfig SQL:', err);
      return false;
    }
  },

  // 3. Categories
  async getCategories(): Promise<VehicleCategory[]> {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('Erreur getCategories SQL:', err);
      return [];
    }
  },

  async saveCategory(cat: VehicleCategory): Promise<boolean> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveCategory SQL:', err);
      return false;
    }
  },

  // 4. Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const res = await fetch('/api/vehicles');
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('Erreur getVehicles SQL:', err);
      return [];
    }
  },

  async saveVehicle(veh: Vehicle): Promise<boolean> {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veh),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveVehicle SQL:', err);
      return false;
    }
  },

  // 5. Departments
  async getDepartments(): Promise<Department[]> {
    try {
      const res = await fetch('/api/departments');
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('Erreur getDepartments SQL:', err);
      return [];
    }
  },

  async saveDepartment(dept: Department): Promise<boolean> {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dept),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveDepartment SQL:', err);
      return false;
    }
  },

  // 6. Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const res = await fetch('/api/suppliers');
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('Erreur getSuppliers SQL:', err);
      return [];
    }
  },

  async saveSupplier(sup: Supplier): Promise<boolean> {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sup),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveSupplier SQL:', err);
      return false;
    }
  },

  // 7. Fuel Exits
  async getFuelExits(): Promise<FuelExit[]> {
    try {
      const res = await fetch('/api/fuel-exits');
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('Erreur getFuelExits SQL:', err);
      return [];
    }
  },

  async saveFuelExit(exit: FuelExit): Promise<boolean> {
    try {
      const res = await fetch('/api/fuel-exits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exit),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveFuelExit SQL:', err);
      return false;
    }
  },

  // 8. Fuel Deliveries
  async getFuelDeliveries(): Promise<FuelDelivery[]> {
    try {
      const res = await fetch('/api/fuel-deliveries');
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('Erreur getFuelDeliveries SQL:', err);
      return [];
    }
  },

  async saveFuelDelivery(delivery: FuelDelivery): Promise<boolean> {
    try {
      const res = await fetch('/api/fuel-deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(delivery),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveFuelDelivery SQL:', err);
      return false;
    }
  },

  // 9. Stock Adjustments
  async getStockAdjustments(): Promise<StockAdjustment[]> {
    try {
      const res = await fetch('/api/stock/adjustments');
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('Erreur getStockAdjustments SQL:', err);
      return [];
    }
  },

  async saveStockAdjustment(adj: StockAdjustment): Promise<boolean> {
    try {
      const res = await fetch('/api/stock/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adj),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveStockAdjustment SQL:', err);
      return false;
    }
  },

  // 10. Users
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('Erreur getUsers SQL:', err);
      return [];
    }
  },

  async saveUser(user: User): Promise<boolean> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('Erreur saveUser SQL:', err);
      return false;
    }
  },
};
