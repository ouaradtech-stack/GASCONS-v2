import { getSupabaseClient } from '../supabase';
import {
  ClientSubscription,
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
  VehicleMaintenance,
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
        currency: data.currency || 'DHS',
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
        currency: profile.currency || 'DHS',
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
        unitType: d.unit_type || 'KM',
        defaultTargetRate: d.default_target_rate || 25,
        description: d.description || undefined,
        color: d.color || '#2563eb',
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
        description: cat.description || null,
        color: cat.color,
      };
      const { error } = await client.from('vehicle_categories').upsert(payload, { onConflict: 'id' });
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
        name: d.designation || d.name || '',
        categoryId: d.category_id,
        departmentId: d.department_id,
        tankCapacity: Number(d.tank_capacity) || 80,
        currentReading: Number(d.current_reading) || 0,
        unitType: d.unit_type || 'KM',
        assignedDriver: d.assigned_driver || undefined,
        status: d.status || 'ACTIF',
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
        designation: veh.name,
        category_id: veh.categoryId,
        department_id: veh.departmentId,
        tank_capacity: veh.tankCapacity,
        current_reading: veh.currentReading,
        unit_type: veh.unitType,
        status: veh.status,
        notes: veh.notes || null,
      };
      const { error } = await client.from('vehicles').upsert(payload, { onConflict: 'id' });
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
        manager: d.manager_name || d.manager || undefined,
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
        manager_name: dept.manager || null,
        code: dept.code || null,
      };
      const { error } = await client.from('departments').upsert(payload, { onConflict: 'id' });
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
        contactName: d.contact_person || d.contact_name || undefined,
        phone: d.phone,
        email: d.email || undefined,
        address: d.address || undefined,
        pricePerLiter: Number(d.price_per_liter) || 12.5,
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
        contact_person: sup.contactName || null,
        phone: sup.phone,
        email: sup.email || null,
        address: sup.address || null,
      };
      const { error } = await client.from('suppliers').upsert(payload, { onConflict: 'id' });
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

  // 11. Vehicle Maintenances
  async getVehicleMaintenances(): Promise<VehicleMaintenance[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('vehicle_maintenances').select('*').order('date', { ascending: false });
      if (error || !data) return [];
      return data.map((m: any) => ({
        id: m.id,
        maintenanceNumber: m.maintenance_number,
        vehicleId: m.vehicle_id,
        serviceType: (m.type || 'VIDANGE') as any,
        title: m.description || 'Entretien',
        date: m.date,
        currentReading: Number(m.current_reading) || 0,
        cost: Number(m.cost) || 0,
        provider: m.provider_name || '',
        invoiceNumber: m.invoice_number || '',
        nextDueReading: m.next_reading_due ? Number(m.next_reading_due) : undefined,
        nextDueDate: m.next_date_due || undefined,
        status: (m.status || 'TERMINE') as any,
        technicianName: m.performed_by || '',
        notes: m.notes || '',
        createdAt: m.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Supabase getVehicleMaintenances exception:', err);
      return [];
    }
  },

  async saveVehicleMaintenance(maint: VehicleMaintenance): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        id: maint.id,
        maintenance_number: maint.maintenanceNumber,
        vehicle_id: maint.vehicleId,
        date: maint.date,
        current_reading: maint.currentReading,
        unit_type: 'KM',
        type: maint.serviceType,
        description: maint.title,
        provider_name: maint.provider,
        cost: maint.cost,
        invoice_number: maint.invoiceNumber || null,
        next_reading_due: maint.nextDueReading || null,
        next_date_due: maint.nextDueDate || null,
        status: maint.status,
        performed_by: maint.technicianName || null,
        notes: maint.notes || null,
        created_at: maint.createdAt || new Date().toISOString(),
      };
      const { error } = await client.from('vehicle_maintenances').upsert([payload], { onConflict: 'id' });
      return !error;
    } catch (err) {
      console.error('Supabase saveVehicleMaintenance exception:', err);
      return false;
    }
  },

  async deleteVehicleMaintenance(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('vehicle_maintenances').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Supabase deleteVehicleMaintenance exception:', err);
      return false;
    }
  },

  // 12. Client Subscriptions (OuaradTech Licences)
  async getClientSubscriptions(): Promise<ClientSubscription[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('client_subscriptions').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((s: any) => ({
        id: s.id,
        contractNumber: s.contract_number,
        clientCompanyName: s.client_company_name,
        clientContactName: s.client_contact_name || '',
        clientEmail: s.client_email || '',
        clientPhone: s.client_phone || '',
        planType: s.plan_type || 'MENSUEL',
        planName: s.plan_name || 'Formule Standard',
        maxVehiclesQuota: s.max_vehicles_quota || 50,
        priceDHS: Number(s.price_dhs) || 0,
        paymentMethod: s.payment_method || 'VIREMENT',
        startDate: s.start_date,
        endDate: s.end_date,
        status: (s.status || 'ACTIF') as any,
        isPaid: s.status === 'ACTIF',
        notes: s.notes || '',
        createdAt: s.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Supabase getClientSubscriptions exception:', err);
      return [];
    }
  },

  async saveClientSubscription(sub: ClientSubscription): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload = {
        id: sub.id,
        contract_number: sub.contractNumber,
        client_company_name: sub.clientCompanyName,
        client_contact_name: sub.clientContactName || null,
        client_email: sub.clientEmail || null,
        client_phone: sub.clientPhone || null,
        plan_type: sub.planType,
        plan_name: sub.planName,
        max_vehicles_quota: sub.maxVehiclesQuota,
        price_dhs: sub.priceDHS,
        payment_method: sub.paymentMethod,
        start_date: sub.startDate,
        end_date: sub.endDate,
        status: sub.status,
        invoice_number: sub.paymentReference || null,
        notes: sub.notes || null,
        created_at: sub.createdAt || new Date().toISOString(),
      };
      const { error } = await client.from('client_subscriptions').upsert([payload], { onConflict: 'id' });
      return !error;
    } catch (err) {
      console.error('Supabase saveClientSubscription exception:', err);
      return false;
    }
  },

  async deleteClientSubscription(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('client_subscriptions').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Supabase deleteClientSubscription exception:', err);
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
    vehicleMaintenances?: VehicleMaintenance[];
    clientSubscriptions?: ClientSubscription[];
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
      if (allData.vehicleMaintenances) {
        for (const maint of allData.vehicleMaintenances) {
          await this.saveVehicleMaintenance(maint);
        }
      }
      if (allData.clientSubscriptions) {
        for (const sub of allData.clientSubscriptions) {
          await this.saveClientSubscription(sub);
        }
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
        (allData.vehicleMaintenances?.length || 0) +
        (allData.clientSubscriptions?.length || 0) +
        2;

      return { success: true, count: totalItems };
    } catch (err: any) {
      console.error('Erreur syncAllToSupabase:', err);
      return { success: false, count: 0, error: err?.message || 'Erreur lors de la synchronisation' };
    }
  },

  async saveVehiclesBatch(vehiclesList: Vehicle[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || vehiclesList.length === 0) return false;
    try {
      const payloads = vehiclesList.map((veh) => ({
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
      }));
      const { error } = await client.from('vehicles').upsert(payloads, { onConflict: 'id' });
      return !error;
    } catch (err) {
      console.error('Supabase saveVehiclesBatch exception:', err);
      return false;
    }
  },

  async deleteVehiclesBatch(ids: string[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || ids.length === 0) return false;
    try {
      const { error } = await client.from('vehicles').delete().in('id', ids);
      return !error;
    } catch (err) {
      console.error('Supabase deleteVehiclesBatch exception:', err);
      return false;
    }
  },
};
