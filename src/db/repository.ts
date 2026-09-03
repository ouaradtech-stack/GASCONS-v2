import { eq, desc } from 'drizzle-orm';
import { db } from './index.ts';
import {
  companyProfiles,
  departments,
  fuelDeliveries,
  fuelExits,
  stockAdjustments,
  stockConfigs,
  suppliers,
  users,
  vehicleCategories,
  vehicles,
} from './schema.ts';

// 1. Users
export async function getDbUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Erreur SQL getDbUsers:', error);
    throw new Error('Impossible de récupérer les utilisateurs.', { cause: error });
  }
}

export async function upsertDbUser(userData: {
  uid: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  active?: boolean;
  avatar?: string;
  password?: string;
}) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'POMPISTE',
        department: userData.department || '',
        active: userData.active ?? true,
        avatar: userData.avatar,
        password: userData.password,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          name: userData.name,
          email: userData.email,
          role: userData.role || 'POMPISTE',
          department: userData.department || '',
          active: userData.active ?? true,
          avatar: userData.avatar,
          password: userData.password,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Erreur SQL upsertDbUser:', error);
    throw new Error('Impossible d\'enregistrer l\'utilisateur.', { cause: error });
  }
}

// 2. Company Profile
export async function getDbCompanyProfile() {
  try {
    const rows = await db.select().from(companyProfiles).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Erreur SQL getDbCompanyProfile:', error);
    throw new Error('Impossible de récupérer le profil entreprise.', { cause: error });
  }
}

export async function saveDbCompanyProfile(data: {
  isConfigured: boolean;
  name: string;
  legalStatus?: string;
  taxId?: string;
  activity?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  headerTagline?: string;
}) {
  try {
    const existing = await db.select().from(companyProfiles).limit(1);
    if (existing.length > 0) {
      const updated = await db
        .update(companyProfiles)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(companyProfiles.id, existing[0].id))
        .returning();
      return updated[0];
    } else {
      const created = await db
        .insert(companyProfiles)
        .values({
          ...data,
          updatedAt: new Date(),
        })
        .returning();
      return created[0];
    }
  } catch (error) {
    console.error('Erreur SQL saveDbCompanyProfile:', error);
    throw new Error('Impossible d\'enregistrer le profil entreprise.', { cause: error });
  }
}

// 3. Stock Config
export async function getDbStockConfig() {
  try {
    const rows = await db.select().from(stockConfigs).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Erreur SQL getDbStockConfig:', error);
    throw new Error('Impossible de récupérer la configuration de stock.', { cause: error });
  }
}

export async function saveDbStockConfig(data: {
  initialStock: number;
  initialStockDate: string;
  tankCapacity: number;
  alertThreshold: number;
  criticalThreshold: number;
  tankName: string;
  location: string;
}) {
  try {
    const existing = await db.select().from(stockConfigs).limit(1);
    if (existing.length > 0) {
      const updated = await db
        .update(stockConfigs)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(stockConfigs.id, existing[0].id))
        .returning();
      return updated[0];
    } else {
      const created = await db
        .insert(stockConfigs)
        .values({
          ...data,
          updatedAt: new Date(),
        })
        .returning();
      return created[0];
    }
  } catch (error) {
    console.error('Erreur SQL saveDbStockConfig:', error);
    throw new Error('Impossible d\'enregistrer la configuration de stock.', { cause: error });
  }
}

// 4. Categories
export async function getDbCategories() {
  try {
    return await db.select().from(vehicleCategories);
  } catch (error) {
    console.error('Erreur SQL getDbCategories:', error);
    throw new Error('Impossible de récupérer les catégories.', { cause: error });
  }
}

export async function saveDbCategory(cat: {
  id: string;
  name: string;
  unitType: string;
  defaultTargetRate: number;
  description?: string;
  color: string;
}) {
  try {
    const result = await db
      .insert(vehicleCategories)
      .values(cat)
      .onConflictDoUpdate({
        target: vehicleCategories.id,
        set: {
          name: cat.name,
          unitType: cat.unitType,
          defaultTargetRate: cat.defaultTargetRate,
          description: cat.description,
          color: cat.color,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Erreur SQL saveDbCategory:', error);
    throw new Error('Impossible d\'enregistrer la catégorie.', { cause: error });
  }
}

// 5. Vehicles
export async function getDbVehicles() {
  try {
    return await db.select().from(vehicles);
  } catch (error) {
    console.error('Erreur SQL getDbVehicles:', error);
    throw new Error('Impossible de récupérer les véhicules.', { cause: error });
  }
}

export async function saveDbVehicle(veh: {
  id: string;
  code: string;
  plateNumber: string;
  name: string;
  categoryId: string;
  departmentId: string;
  tankCapacity: number;
  currentReading: number;
  unitType: string;
  assignedDriver?: string;
  status: string;
  notes?: string;
}) {
  try {
    const result = await db
      .insert(vehicles)
      .values(veh)
      .onConflictDoUpdate({
        target: vehicles.id,
        set: {
          code: veh.code,
          plateNumber: veh.plateNumber,
          name: veh.name,
          categoryId: veh.categoryId,
          departmentId: veh.departmentId,
          tankCapacity: veh.tankCapacity,
          currentReading: veh.currentReading,
          unitType: veh.unitType,
          assignedDriver: veh.assignedDriver,
          status: veh.status,
          notes: veh.notes,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Erreur SQL saveDbVehicle:', error);
    throw new Error('Impossible d\'enregistrer le véhicule.', { cause: error });
  }
}

// 6. Departments
export async function getDbDepartments() {
  try {
    return await db.select().from(departments);
  } catch (error) {
    console.error('Erreur SQL getDbDepartments:', error);
    throw new Error('Impossible de récupérer les départements.', { cause: error });
  }
}

export async function saveDbDepartment(dept: {
  id: string;
  name: string;
  manager: string;
  code: string;
}) {
  try {
    const result = await db
      .insert(departments)
      .values(dept)
      .onConflictDoUpdate({
        target: departments.id,
        set: {
          name: dept.name,
          manager: dept.manager,
          code: dept.code,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Erreur SQL saveDbDepartment:', error);
    throw new Error('Impossible d\'enregistrer le département.', { cause: error });
  }
}

// 7. Suppliers
export async function getDbSuppliers() {
  try {
    return await db.select().from(suppliers);
  } catch (error) {
    console.error('Erreur SQL getDbSuppliers:', error);
    throw new Error('Impossible de récupérer les fournisseurs.', { cause: error });
  }
}

export async function saveDbSupplier(sup: {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  pricePerLiter: number;
}) {
  try {
    const result = await db
      .insert(suppliers)
      .values(sup)
      .onConflictDoUpdate({
        target: suppliers.id,
        set: {
          name: sup.name,
          contactName: sup.contactName,
          phone: sup.phone,
          email: sup.email,
          address: sup.address,
          pricePerLiter: sup.pricePerLiter,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Erreur SQL saveDbSupplier:', error);
    throw new Error('Impossible d\'enregistrer le fournisseur.', { cause: error });
  }
}

// 8. Fuel Exits
export async function getDbFuelExits() {
  try {
    return await db.select().from(fuelExits).orderBy(desc(fuelExits.createdAt));
  } catch (error) {
    console.error('Erreur SQL getDbFuelExits:', error);
    throw new Error('Impossible de récupérer les sorties de gasoil.', { cause: error });
  }
}

export async function saveDbFuelExit(exit: {
  id: string;
  ticketNumber: string;
  date: string;
  time: string;
  vehicleId: string;
  categoryId: string;
  departmentId: string;
  quantityLiters: number;
  previousReading: number;
  currentReading: number;
  distanceOrHours: number;
  calculatedConsumption: number;
  requesterName: string;
  pumpOperatorName: string;
  signatureDataUrl?: string;
  purpose?: string;
  notes?: string;
}) {
  try {
    const result = await db
      .insert(fuelExits)
      .values(exit)
      .onConflictDoUpdate({
        target: fuelExits.id,
        set: {
          ticketNumber: exit.ticketNumber,
          date: exit.date,
          time: exit.time,
          vehicleId: exit.vehicleId,
          categoryId: exit.categoryId,
          departmentId: exit.departmentId,
          quantityLiters: exit.quantityLiters,
          previousReading: exit.previousReading,
          currentReading: exit.currentReading,
          distanceOrHours: exit.distanceOrHours,
          calculatedConsumption: exit.calculatedConsumption,
          requesterName: exit.requesterName,
          pumpOperatorName: exit.pumpOperatorName,
          signatureDataUrl: exit.signatureDataUrl,
          purpose: exit.purpose,
          notes: exit.notes,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Erreur SQL saveDbFuelExit:', error);
    throw new Error('Impossible d\'enregistrer la sortie de carburant.', { cause: error });
  }
}

// 9. Fuel Deliveries
export async function getDbFuelDeliveries() {
  try {
    return await db.select().from(fuelDeliveries).orderBy(desc(fuelDeliveries.createdAt));
  } catch (error) {
    console.error('Erreur SQL getDbFuelDeliveries:', error);
    throw new Error('Impossible de récupérer les réceptions de carburant.', { cause: error });
  }
}

export async function saveDbFuelDelivery(deliv: {
  id: string;
  deliveryNumber: string;
  date: string;
  time: string;
  supplierId: string;
  quantityLiters: number;
  unitPrice: number;
  totalCost: number;
  tankName: string;
  driverName?: string;
  truckPlate?: string;
  receiverName: string;
  notes?: string;
}) {
  try {
    const result = await db
      .insert(fuelDeliveries)
      .values(deliv)
      .onConflictDoUpdate({
        target: fuelDeliveries.id,
        set: {
          deliveryNumber: deliv.deliveryNumber,
          date: deliv.date,
          time: deliv.time,
          supplierId: deliv.supplierId,
          quantityLiters: deliv.quantityLiters,
          unitPrice: deliv.unitPrice,
          totalCost: deliv.totalCost,
          tankName: deliv.tankName,
          driverName: deliv.driverName,
          truckPlate: deliv.truckPlate,
          receiverName: deliv.receiverName,
          notes: deliv.notes,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Erreur SQL saveDbFuelDelivery:', error);
    throw new Error('Impossible d\'enregistrer la livraison de carburant.', { cause: error });
  }
}

// 10. Stock Adjustments
export async function getDbStockAdjustments() {
  try {
    return await db.select().from(stockAdjustments).orderBy(desc(stockAdjustments.createdAt));
  } catch (error) {
    console.error('Erreur SQL getDbStockAdjustments:', error);
    throw new Error('Impossible de récupérer les ajustements de stock.', { cause: error });
  }
}

export async function saveDbStockAdjustment(adj: {
  id: string;
  date: string;
  previousStock: number;
  newStock: number;
  difference: number;
  reason: string;
  adjustedBy: string;
}) {
  try {
    const result = await db
      .insert(stockAdjustments)
      .values(adj)
      .onConflictDoUpdate({
        target: stockAdjustments.id,
        set: {
          date: adj.date,
          previousStock: adj.previousStock,
          newStock: adj.newStock,
          difference: adj.difference,
          reason: adj.reason,
          adjustedBy: adj.adjustedBy,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Erreur SQL saveDbStockAdjustment:', error);
    throw new Error('Impossible d\'enregistrer l\'ajustement de stock.', { cause: error });
  }
}
