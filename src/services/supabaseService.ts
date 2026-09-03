import { getSupabaseClient } from '../supabase';
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

export const SupabaseService = {
  // Check client availability
  isAvailable(): boolean {
    return getSupabaseClient() !== null;
  },

  // 1. Company Profile
  async getCompanyProfile(): Promise<CompanyProfile | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('company_profiles').select('*').limit(1).maybeSingle();
      if (error) {
        console.warn('Supabase getCompanyProfile warning:', error.message);
        return null;
      }
      if (!data) return null;
      return {
        isConfigured: data.is_configured,
        name: data.name,
        legalStatus: data.legal_status || '',
        taxId: data.tax_id || '',
        activity: data.activity || '',
        logoUrl: data.logo_url || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        currency: data.currency || 'DZD',
        headerTagline: data.header_tagline || '',
      };
    } catch (err) {
      console.error('Supabase getCompanyProfile exception:', err);
      return null;
    }
  },

  async saveCompanyProfile(profile: CompanyProfile): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        is_configured: profile.isConfigured,
        name: profile.name,
        legal_status: profile.legalStatus,
        tax_id: profile.taxId,
        activity: profile.activity,
        logo_url: profile.logoUrl,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        city: profile.city,
        country: profile.country,
        currency: profile.currency || 'DZD',
        header_tagline: profile.headerTagline,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await client.from('company_profiles').select('id').limit(1).maybeSingle();
      if (existing) {
        const { error } = await client.from('company_profiles').update(payload).eq('id', existing.id);
        return !error;
      } else {
        const { error } = await client.from('company_profiles').insert([payload]);
        return !error;
      }
    } catch (err) {
      console.error('Supabase saveCompanyProfile exception:', err);
      return false;
    }
  },

  // 2. Stock Config
  async getStockConfig(): Promise<StockConfig | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('stock_configs').select('*').limit(1).maybeSingle();
      if (error || !data) return null;
      return {
        initialStock: data.initial_stock,
        initialStockDate: data.initial_stock_date,
        tankCapacity: data.tank_capacity,
        alertThreshold: data.alert_threshold,
        criticalThreshold: data.critical_threshold,
        tankName: data.tank_name,
        location: data.location,
      };
    } catch (err) {
      console.error('Supabase getStockConfig exception:', err);
      return null;
    }
  },

  async saveStockConfig(config: StockConfig): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        initial_stock: config.initialStock,
        initial_stock_date: config.initialStockDate,
        tank_capacity: config.tankCapacity,
        alert_threshold: config.alertThreshold,
        critical_threshold: config.criticalThreshold,
        tank_name: config.tankName,
        location: config.location,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await client.from('stock_configs').select('id').limit(1).maybeSingle();
      if (existing) {
        const { error } = await client.from('stock_configs').update(payload).eq('id', existing.id);
        return !error;
      } else {
        const { error } = await client.from('stock_configs').insert([payload]);
        return !error;
      }
    } catch (err) {
      console.error('Supabase saveStockConfig exception:', err);
      return false;
    }
  },

  // 3. Vehicle Categories
  async getCategories(): Promise<VehicleCategory[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('vehicle_categories').select('*');
      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        name: d.name,
        unitType: d.unit_type,
        defaultTargetRate: d.default_target_rate,
        description: d.description || undefined,
        color: d.color,
      }));
    } catch (err) {
      console.error('Supabase getCategories exception:', err);
      return [];
    }
  },

  async saveCategory(cat: VehicleCategory): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        id: cat.id,
        name: cat.name,
        unit_type: cat.unitType,
        default_target_rate: cat.defaultTargetRate,
        description: cat.description || null,
        color: cat.color,
      };
      const { error } = await client.from('vehicle_categories').upsert(payload);
      return !error;
    } catch (err) {
      console.error('Supabase saveCategory exception:', err);
      return false;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('vehicle_categories').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Supabase deleteCategory exception:', err);
      return false;
    }
  },

  // 4. Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('vehicles').select('*');
      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        code: d.code,
        plateNumber: d.plate_number,
        name: d.name,
        categoryId: d.category_id,
        departmentId: d.department_id,
        tankCapacity: d.tank_capacity,
        currentReading: d.current_reading,
        unitType: d.unit_type,
        assignedDriver: d.assigned_driver || undefined,
        status: d.status,
        notes: d.notes || undefined,
      }));
    } catch (err) {
      console.error('Supabase getVehicles exception:', err);
      return [];
    }
  },

  async saveVehicle(veh: Vehicle): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        id: veh.id,
        code: veh.code,
        plate_number: veh.plateNumber,
        name: veh.name,
        category_id: veh.categoryId,
        department_id: veh.departmentId,
        tank_capacity: veh.tankCapacity,
        current_reading: veh.currentReading,
        unit_type: veh.unitType,
        assigned_driver: veh.assignedDriver || null,
        status: veh.status,
        notes: veh.notes || null,
      };
      const { error } = await client.from('vehicles').upsert(payload);
      return !error;
    } catch (err) {
      console.error('Supabase saveVehicle exception:', err);
      return false;
    }
  },

  async deleteVehicle(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('vehicles').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Supabase deleteVehicle exception:', err);
      return false;
    }
  },

  // 5. Departments
  async getDepartments(): Promise<Department[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('departments').select('*');
      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        name: d.name,
        manager: d.manager,
        code: d.code,
      }));
    } catch (err) {
      console.error('Supabase getDepartments exception:', err);
      return [];
    }
  },

  async saveDepartment(dept: Department): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        id: dept.id,
        name: dept.name,
        manager: dept.manager,
        code: dept.code,
      };
      const { error } = await client.from('departments').upsert(payload);
      return !error;
    } catch (err) {
      console.error('Supabase saveDepartment exception:', err);
      return false;
    }
  },

  async deleteDepartment(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('departments').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Supabase deleteDepartment exception:', err);
      return false;
    }
  },

  // 6. Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('suppliers').select('*');
      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        name: d.name,
        contactName: d.contact_name,
        phone: d.phone,
        email: d.email || undefined,
        address: d.address || undefined,
        pricePerLiter: d.price_per_liter,
      }));
    } catch (err) {
      console.error('Supabase getSuppliers exception:', err);
      return [];
    }
  },

  async saveSupplier(sup: Supplier): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        id: sup.id,
        name: sup.name,
        contact_name: sup.contactName,
        phone: sup.phone,
        email: sup.email || null,
        address: sup.address || null,
        price_per_liter: sup.pricePerLiter,
      };
      const { error } = await client.from('suppliers').upsert(payload);
      return !error;
    } catch (err) {
      console.error('Supabase saveSupplier exception:', err);
      return false;
    }
  },

  async deleteSupplier(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('suppliers').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Supabase deleteSupplier exception:', err);
      return false;
    }
  },

  // 7. Fuel Exits
  async getFuelExits(): Promise<FuelExit[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('fuel_exits').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        ticketNumber: d.ticket_number,
        date: d.date,
        time: d.time,
        vehicleId: d.vehicle_id,
        categoryId: d.category_id,
        departmentId: d.department_id,
        quantityLiters: d.quantity_liters,
        previousReading: d.previous_reading,
        currentReading: d.current_reading,
        distanceOrHours: d.distance_or_hours,
        calculatedConsumption: d.calculated_consumption,
        requesterName: d.requester_name,
        pumpOperatorName: d.pump_operator_name,
        signatureDataUrl: d.signature_data_url || undefined,
        purpose: d.purpose || undefined,
        notes: d.notes || undefined,
        createdAt: d.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Supabase getFuelExits exception:', err);
      return [];
    }
  },

  async saveFuelExit(exit: FuelExit): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        id: exit.id,
        ticket_number: exit.ticketNumber,
        date: exit.date,
        time: exit.time,
        vehicle_id: exit.vehicleId,
        category_id: exit.categoryId,
        department_id: exit.departmentId,
        quantity_liters: exit.quantityLiters,
        previous_reading: exit.previousReading,
        current_reading: exit.currentReading,
        distance_or_hours: exit.distanceOrHours,
        calculated_consumption: exit.calculatedConsumption,
        requester_name: exit.requesterName,
        pump_operator_name: exit.pumpOperatorName,
        signature_data_url: exit.signatureDataUrl || null,
        purpose: exit.purpose || null,
        notes: exit.notes || null,
      };
      const { error } = await client.from('fuel_exits').upsert(payload);
      return !error;
    } catch (err) {
      console.error('Supabase saveFuelExit exception:', err);
      return false;
    }
  },

  async deleteFuelExit(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('fuel_exits').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Supabase deleteFuelExit exception:', err);
      return false;
    }
  },

  // 8. Fuel Deliveries
  async getFuelDeliveries(): Promise<FuelDelivery[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('fuel_deliveries').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        deliveryNumber: d.delivery_number,
        date: d.date,
        time: d.time,
        supplierId: d.supplier_id,
        quantityLiters: d.quantity_liters,
        unitPrice: d.unit_price,
        totalCost: d.total_cost,
        tankName: d.tank_name,
        driverName: d.driver_name || undefined,
        truckPlate: d.truck_plate || undefined,
        receiverName: d.receiver_name,
        notes: d.notes || undefined,
        createdAt: d.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Supabase getFuelDeliveries exception:', err);
      return [];
    }
  },

  async saveFuelDelivery(delivery: FuelDelivery): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        id: delivery.id,
        delivery_number: delivery.deliveryNumber,
        date: delivery.date,
        time: delivery.time,
        supplier_id: delivery.supplierId,
        quantity_liters: delivery.quantityLiters,
        unit_price: delivery.unitPrice,
        total_cost: delivery.totalCost,
        tank_name: delivery.tankName,
        driver_name: delivery.driverName || null,
        truck_plate: delivery.truckPlate || null,
        receiver_name: delivery.receiverName,
        notes: delivery.notes || null,
      };
      const { error } = await client.from('fuel_deliveries').upsert(payload);
      return !error;
    } catch (err) {
      console.error('Supabase saveFuelDelivery exception:', err);
      return false;
    }
  },

  async deleteFuelDelivery(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('fuel_deliveries').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Supabase deleteFuelDelivery exception:', err);
      return false;
    }
  },

  // 9. Stock Adjustments
  async getStockAdjustments(): Promise<StockAdjustment[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('stock_adjustments').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        date: d.date,
        previousStock: d.previous_stock,
        newStock: d.new_stock,
        difference: d.difference,
        reason: d.reason,
        adjustedBy: d.adjusted_by,
        createdAt: d.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Supabase getStockAdjustments exception:', err);
      return [];
    }
  },

  async saveStockAdjustment(adj: StockAdjustment): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        id: adj.id,
        date: adj.date,
        previous_stock: adj.previousStock,
        new_stock: adj.newStock,
        difference: adj.difference,
        reason: adj.reason,
        adjusted_by: adj.adjustedBy,
      };
      const { error } = await client.from('stock_adjustments').upsert(payload);
      return !error;
    } catch (err) {
      console.error('Supabase saveStockAdjustment exception:', err);
      return false;
    }
  },

  // 10. Users
  async getUsers(): Promise<User[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('users').select('*');
      if (error || !data) return [];
      return data.map((d) => ({
        id: d.uid || String(d.id),
        name: d.name,
        email: d.email,
        role: d.role,
        department: d.department || undefined,
        active: d.active ?? true,
        avatar: d.avatar || undefined,
        password: d.password || undefined,
        createdAt: d.created_at || undefined,
        clientCompanyName: d.client_company_name || undefined,
        clientPhone: d.client_phone || undefined,
        licenseType: d.license_type || 'MENSUEL',
        licensePrice: d.license_price !== null && d.license_price !== undefined ? d.license_price : undefined,
        licenseExpiresAt: d.license_expires_at || undefined,
        subscriptionStatus: d.subscription_status || (d.active ? 'ACTIF' : 'SUSPENDU'),
        suspensionReason: d.suspension_reason || undefined,
        maxVehiclesQuota: d.max_vehicles_quota || 50,
        notes: d.notes || undefined,
      }));
    } catch (err) {
      console.error('Supabase getUsers exception:', err);
      return [];
    }
  },

  async saveUser(user: User): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        uid: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        active: user.active ?? true,
        avatar: user.avatar || null,
        password: user.password || null,
        client_company_name: user.clientCompanyName || null,
        client_phone: user.clientPhone || null,
        license_type: user.licenseType || 'MENSUEL',
        license_price: user.licensePrice !== undefined && user.licensePrice !== '' ? Number(user.licensePrice) : 0,
        license_expires_at: user.licenseExpiresAt || null,
        subscription_status: user.subscriptionStatus || (user.active ? 'ACTIF' : 'SUSPENDU'),
        suspension_reason: user.suspensionReason || null,
        max_vehicles_quota: user.maxVehiclesQuota || 50,
        notes: user.notes || null,
      };
      const { error } = await client.from('users').upsert(payload, { onConflict: 'uid' });
      return !error;
    } catch (err) {
      console.error('Supabase saveUser exception:', err);
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('users').delete().eq('uid', id);
      return !error;
    } catch (err) {
      console.error('Supabase deleteUser exception:', err);
      return false;
    }
  },

  // Push all local data into Supabase (Initial Migration / Sync)
  async syncAllToSupabase(allData: {
    companyProfile: CompanyProfile;
    stockConfig: StockConfig;
    categories: VehicleCategory[];
    vehicles: Vehicle[];
    departments: Department[];
    suppliers: Supplier[];
    fuelExits: FuelExit[];
    fuelDeliveries: FuelDelivery[];
    stockAdjustments: StockAdjustment[];
    users: User[];
  }): Promise<{ success: boolean; count: number; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, count: 0, error: 'Supabase non configuré' };
    }

    try {
      await this.saveCompanyProfile(allData.companyProfile);
      await this.saveStockConfig(allData.stockConfig);

      for (const cat of allData.categories) {
        await this.saveCategory(cat);
      }
      for (const dept of allData.departments) {
        await this.saveDepartment(dept);
      }
      for (const sup of allData.suppliers) {
        await this.saveSupplier(sup);
      }
      for (const veh of allData.vehicles) {
        await this.saveVehicle(veh);
      }
      for (const exit of allData.fuelExits) {
        await this.saveFuelExit(exit);
      }
      for (const deliv of allData.fuelDeliveries) {
        await this.saveFuelDelivery(deliv);
      }
      for (const adj of allData.stockAdjustments) {
        await this.saveStockAdjustment(adj);
      }
      for (const usr of allData.users) {
        await this.saveUser(usr);
      }

      const totalItems =
        allData.categories.length +
        allData.departments.length +
        allData.suppliers.length +
        allData.vehicles.length +
        allData.fuelExits.length +
        allData.fuelDeliveries.length +
        allData.stockAdjustments.length +
        allData.users.length +
        2;

      return { success: true, count: totalItems };
    } catch (err: any) {
      console.error('Erreur syncAllToSupabase:', err);
      return { success: false, count: 0, error: err?.message || 'Erreur lors de la synchronisation' };
    }
  },
};
